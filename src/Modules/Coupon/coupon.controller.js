import couponModel from "../../../DB/Models/coupon.model.js";
import cloudinary from "../../Utils/cloudinary.js";
import QRCode from "qrcode";

export const getCoupon = async (req, res, next) => {
    const coupon = await couponModel.find({});
    return res.status(200).json({ message: "Coupon Module", coupon });
}
export const createCoupon = async (req, res, next) => {
    const name = req.body.name.toLowerCase();
    if (await couponModel.findOne({ name })) {
        return next(new Error(`Dublicate coupon name ${name}`, { cause: 409 }))
    }
    let image = {}
    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/coupon` });
        image = { secure_url, public_id }
    }

    QRCode.toDataURL(`http://127.0.0.1:5173/offer`, async function (err, url) {
        const coupon = await couponModel.create({
            name, image, createdBy: req.user._id, expireDate: new Date(req.body.expireDate), subscrip: req.body.subscrip,
            url
        });
        return res.status(201).json({ message: "Done", coupon });
    })
}
export const updateCoupon = async (req, res, next) => {
    const coupon = await couponModel.findById(req.params.couponId)
    if (!coupon) {
        return next(new Error(`In-valid coupon id`, { cause: 400 }));
    }

    if (req.body.name) {
        req.body.name = req.body.name.toLowerCase();
        if (coupon.name == req.body.name) {
            return next(new Error(`Sorry, can not update coupon`, { cause: 400 }));
        }
        if (await couponModel.findOne({ name: req.body.name })) {
            return next(new Error(`Dublicate coupon name ${req.body.name}`, { cause: 409 }));
        }
        coupon.name = req.body.name;
    }
    if (req.body.subscrip) {
        coupon.subscrip = req.body.subscrip
    }
    if (req.body.expireDate) {
        coupon.expireDate = new Date(req.body.expireDate)
    }
    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/coupon` });
        if (coupon.image) {
            await cloudinary.uploader.destroy(coupon.image.public_id);
        }
        coupon.image = { secure_url, public_id };
    }
    coupon.updatedBy = req.user._id;
    await coupon.save();
    return res.status(200).json({ message: "Done", coupon })
}