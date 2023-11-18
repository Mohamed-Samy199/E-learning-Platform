import userModel from "../../../DB/Models/user.model.js";
import { generateToken, verifyToken } from "../../Utils/generate&verifyToken.js";
import { compary, hash } from "../../Utils/hash&compary.js";
import { sendEmail } from "../../Utils/sendEmail.js";

export const authModule = async (req, res, next) => {
    return res.status(200).json({ message: "Auth Module" });
}
export const signUp = async (req, res, next) => {
    const { userName, email, password } = req.body;
    if (await userModel.findOne({ email: email.toLowerCase() })) {
        return next(new Error("user already exist", { cause: 409 }))
    }
    // send email
    const token = generateToken({ payload: { email }, signature: process.env.TOKEN_SIGNATURE, expiresIn: 60 * 30 });
    const refrshToken = generateToken({ payload: { email }, expiresIn: 60 * 60 * 24 });

    const link = `${req.protocol}://${req.headers.host}/auth/confirmationEmail/${token}`;
    const refrshLink = `${req.protocol}://${req.headers.host}/auth/refrash/${refrshToken}`;

    const emailSend = await sendEmail({
        to: email,
        subject: 'conformation email',
        // message: `<a href=${link}>Click To Confirm</a> 
        // <br/><br/>
        // <a href=${refrshLink}>Refrash Your Token</a> `
        message: `<!DOCTYPE html>
        <html>
        <head>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
        <style type="text/css">
        body{background-color: #88BDBF;margin: 0px;}
        </style>
        <body style="margin:0px;"> 
        <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #ff8503;">
        <tr>
        <td>
        <table border="0" width="100%">
        
        </table>
        </td>
        </tr>
        <tr>
        <td>
        <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
        <tr>
        <td style="background-color:#ff8503;height:100px;font-size:50px;color:#fff;padding-top:15px;">
        <img width="150px" height="150px" src="https://media.istockphoto.com/id/1138644570/vector/shopping-cart-icon-design-cart-icon-symbol-design.jpg?s=612x612&w=0&k=20&c=_lTGkSkJ6ha8ZNiKD8XWVtLNyTjQ74HCu_c4WFio27g=">
        </td>
        </tr>
        <tr>
        <td>
        <h1 style="padding-top:10px; color:#ff8503">Email Confirmation</h1>
        </td>
        </tr>
        <tr>
        <td>
        <p style="padding:0px 50px;">
        </p>
        </td>
        </tr>
        <tr>
        <td>
        <a href="${link}" style="margin:5px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#ff8503; ">Verify Email Address</a>
        </td>
        </tr>

        <tr>
        <td>
        <br>
        <br>
        <a href="${refrshLink}" style="margin:5px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#ff8503; ">Request New Email</a>
        </td>
        </tr>
        </table>
        </td>
        </tr>
        <tr>
        <td>
        
        </td>
        </tr>
        </table>
        </body>
        </html>`
    })
    if (!emailSend) {
        return res.json({ message: 'Email Rejected' })
    }
    // hashPassword
    const hashPassword = hash({ plaintext: password })
    // create user
    const user = await userModel.create({ userName, email, password: hashPassword })
    return res.status(201).json({ message: "Done", user: user._id })
}
export const confirmEmail = async (req, res, next) => {
    const { token } = req.params;
    const { email } = verifyToken({ token, signature: process.env.TOKEN_SIGNATURE });
    if (!email) {
        return next(new Error("In-valid token payload", { cause: 400 }));
    }
    const user = await userModel.updateOne({ email }, { confirmEmail: true });
    if (user.modifiedCount) {
        return res.status(200).json({ message: "Done" })
    } else {
        return res.status(200).json({ message: "Not register account" })
    }
}
export const refrashConfirmEmail = async (req, res, next) => {
    const { token } = req.params;
    const { email } = verifyToken({ token, signature: process.env.TOKEN_SIGNATURE });
    if (!email) {
        return next(new Error("In-valid token payload", { cause: 400 }));
    }
    const user = await userModel.findOne({ email });
    if (!user) {
        return next(new Error("Not register account", { cause: 404 }));
    }
    if (user.confirmEmail) {
        return res.status(200).json({ message: "Done" })
    }

    const newToken = generateToken({ payload: { email }, signature: process.env.TOKEN_SIGNATURE, expiresIn: 60 * 30 });
    const refrshToken = generateToken({ payload: { email }, expiresIn: 60 * 60 * 24 });

    const link = `${req.protocol}://${req.headers.host}/auth/confirmationEmail/${newToken}`;
    const refrshLink = `${req.protocol}://${req.headers.host}/auth/refrash/${refrshToken}`;

    const emailSend = await sendEmail({
        to: email,
        subject: 'conformation email',
        message: `<a href=${link}>Click To Confirm</a> 
        <br/><br/>
        <a href=${refrshLink}>Refrash Your Token</a> `
    })
    if (!emailSend) {
        return res.json({ message: 'Email Rejected' })
    }
    return res.status(200).send("<p>New confirmation email send to inbox check please it ASAP.</p>")
}
export const login = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
        return next(new Error("User Not Register", { cause: 404 }));
    }
    if (!user.confirmEmail) {
        return next(new Error("please confirm your email frist", { cause: 400 }));
    }
    if (!compary({ plaintext: password, hashValue: user.password })) {
        return next(new Error("In-valid login data", { cause: 409 }));
    }
    const access_token = generateToken({ payload: { id: user._id, userName: user.userName, role: user.role }, expiresIn: 60 * 60 * 24 });
    const refrash_tokeen = generateToken({ payload: { id: user._id, userName: user.userName, role: user.role }, expiresIn: 60 * 60 * 24 * 365 });
    user.status = "online";
    await user.save();
    return res.status(200).json({ message: "Done", access_token, refrash_tokeen })
}