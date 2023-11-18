import multer from "multer"
export const validationObject = {
    image: ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/avif", "image/svg", "video/mp4" , "application/pdf", "application/msword"],
    file: ["application/pdf", "application/msword"],
    video: ["video/mp4"]
}
export const myMulter = ({ custonValidtion = validationObject.image } = {}) => {
    const storage = multer.diskStorage({});
    const fileFilter = (req, file, cb) => {
        if (!custonValidtion.includes(file.mimetype)) {
            return cb(new Error("In-valid type extantion", { cause: 400 }), false);
        }
        cb(null, true)
    }
    const upload = multer({ fileFilter, storage });
    return upload;
}