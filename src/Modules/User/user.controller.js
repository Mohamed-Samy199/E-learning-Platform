import { customAlphabet } from "nanoid";
import userModel from "../../../DB/Models/user.model.js";
import { sendEmail } from "../../Utils/sendEmail.js";
import { compary, hash } from "../../Utils/hash&compary.js";
import cloudinary from "../../Utils/cloudinary.js";

export const userModule = (req, res, next) => {
    return res.status(200).json({ message: "User Module" })
}
export const sendCode = async (req, res, next) => {
    const { email } = req.body;
    const nanoId = customAlphabet("123456789", 4);
    const forgetCode = nanoId();
    const user = await userModel.findOneAndUpdate({ email }, { forgetCode });
    if (!user) {
        next(new Error("Not register user", { cause: 404 }));
    }
    const emailSend = await sendEmail({
        to: email,
        subject: 'Forget Password',
        message: `<p>${forgetCode}</p> `
    })
    if (!emailSend) {
        return res.json({ message: 'Email Rejected' })
    }
    return res.status(200).json({ message: "Done", userCode: user.forgetCode })
}
export const forgetPassword = async (req, res, next) => {
    const { email, forgetCode, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
        return next(new Error("not register user", { cause: 404 }));
    }
    if (user.forgetCode != forgetCode) {
        return next(new Error("in-valid reset code", { cause: 400 }));
    }
    user.password = hash({ plaintext: password });
    user.forgetCode = null;
    user.changePasswordTime = Date.now();
    await user.save();
    return res.status(200).json({ message: "Done" });
}
export const updatePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const user = await userModel.findById(req.user._id);
    if (!user) {
        return next(new Error("not register user", { cause: 404 }));
    }
    const match = compary({ plaintext: oldPassword, hashValue: user.password });
    if (!match) {
        return next(new Error("In-valid old password", { cause: 400 }));
    }
    const hashPassword = hash({ plaintext: newPassword });
    user.password = hashPassword;
    await user.save();
    return res.status(200).json({ message: "Done" });
}
export const profile = async (req, res, next) => {
    const user = await userModel.findById(req.user._id);
    if (!user) {
        return next(new Error("not register user", { cause: 404 }));
    }

    if (req.body.userName) {
        user.userName = req.body.userName;
    }
    if (req.file) {
        if (user.image) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
                folder: `${process.env.APP_NAME}/profile/${req.user.userName}`
            })
            await cloudinary.uploader.destroy(user.image.public_id);
            req.body.image = { secure_url, public_id }
        } else {
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
                folder: `${process.env.APP_NAME}/profile/${req.user.userName}`
            })
            req.body.image = { secure_url, public_id }
        }
    }

    const newDataForUser = await userModel.updateOne({ _id: req.user._id }, req.body);
    if (!newDataForUser.modifiedCount) {
        return next(new Error("can not update", { cause: 400 }));
    }
    return res.status(200).json({ message: "Done", newDataForUser });
}
export const createAdmin = async (req , res , next) => {
    const {newAdminId} = req.params;
    
    if (!await userModel.findOne({role : "Admin"})) {
        return next(new Error("user not found" , {cause : 404}));
    }
    const admin = await userModel.findByIdAndUpdate(newAdminId , {role : "Admin"} , {new : true});
    if (!admin) {
        return next(new Error("user not found or update" , {cause : 409}));
    }
    return res.status(201).json({message : "Done" , newAdmin : admin.role});
}
export const createInstructor = async (req , res , next) => {
    const {instructorId} = req.params;
    const instructor = await userModel.findByIdAndUpdate(instructorId , {role : "Instructor"} , {new : true});
    if (!instructor) {
        return next(new Error("Instructor not found or update" , {cause : 409}));
    }
    return res.status(201).json({message : "Done" , newInstructor : instructor.role});
}