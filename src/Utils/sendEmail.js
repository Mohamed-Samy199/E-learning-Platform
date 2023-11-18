import nodemailer from "nodemailer";

export const sendEmail = async ({ to = "", message = "", subject = "", attachments = [] }) => {
    let transporter = nodemailer.createTransport({
        host: "localhost",
        port: 587,
        secure: false,
        service: "gmail",
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    })
    let info = await transporter.sendMail({
        from: `E-learing ${process.env.SENDER_EMAIL}`,
        to,
        subject,
        html: message,
        attachments
    })
    if (info.accepted.length) {
        return true
    }
    return false
}