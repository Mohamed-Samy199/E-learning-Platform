import slugify from "slugify";
import categoryModel from "../../../DB/Models/category.model.js";
import courseModel from "../../../DB/Models/course.model.js";
import cloudinary from "../../Utils/cloudinary.js";
import { nanoid, customAlphabet } from "nanoid";
import moment from "moment/moment.js";
import userModel from "../../../DB/Models/user.model.js";

export const courseModule = (req, res, next) => {
    return res.status(200).json({ message: 'Course Module' });
}
export const createCourse = async (req, res, next) => {
    const { title, price, discount, categoryId } = req.body;
    if (!await categoryModel.findOne({ _id: categoryId })) {
        return next(new Error("In-valid category id", { cause: 409 }));
    }
    req.body.slug = slugify(title);
    req.body.finalPrice = Number.parseFloat(price - (price * ((discount || 0) / 100))).toFixed(2);

    req.body.customId = nanoid(6);
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        // resource_type: "video",
        folder: `${process.env.APP_NAME}/course/${req.body.customId}`
    })
    req.body.image = { secure_url, public_id };

    req.body.startDate = moment().format('MM/DD/YYYY');
    req.body.endDate = moment().format('MM/DD/YYYY');
    const nanoId = customAlphabet("123456789", 5)
    req.body.courseId = nanoId()
    req.body.createdBy = req.user._id;
    const course = await courseModel.create(req.body);
    if (!course) {
        return next(new Error("fail to create cousre", { cause: 400 }));
    }
    return res.status(201).json({ message: "Done", course });
}
export const updateCourse = async (req, res, next) => {
    const { title, price, discount, categoryId } = req.body;
    const { courseId } = req.params;
    // check course exsit
    const course = await courseModel.findById(courseId);
    if (!course) {
        return next(new Error("course not exist", { cause: 400 }));
    }
    // check category exist
    if (!await categoryModel.findById(categoryId)) {
        return next(new Error("category not exist", { cause: 400 }));
    }
    // update name & slug
    if (title.toLowerCase()) {
        if (course.title == title) {
            return next(new Error(`sorry, can not update dublicate title ${title}`, { cause: 409 }));
        }
        course.title = title;
        course.slug = slugify(title);
    }
    // update prise & discount
    if (price && discount) {
        req.body.finalPrice = Number.parseFloat(price - (price * ((discount) / 100))).toFixed(2);
        if (price) {
            req.body.finalPrice = Number.parseFloat(price - (price * ((course.discount || 0) / 100))).toFixed(2);
        }
        if (discount) {
            req.body.finalPrice = Number.parseFloat(course.price - (course.price * ((discount || 0) / 100))).toFixed(2);
        }
    }
    // update image
    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path,
            { folder: `${process.env.APP_NAME}/course/${course.customId}` });
        await cloudinary.uploader.destroy(course.image.public_id);
        course.image = { secure_url, public_id };
    }
    course.updatedBy = req.user._id;
    await course.save();
    return res.status(200).json({ message: "Done", course });
}
// instructor implement
export const addInstructorOnCourse = async (req, res, next) => {
    const { courseId } = req.params;
    if (!await courseModel.findById(courseId)) {
        return next(new Error("In-valid course id", { cause: 400 }));
    }
    const instructor = await userModel.findOneAndUpdate({ _id: req.user._id }, { $addToSet: { instructor: courseId } }, { new: true });
    if (!instructor) {
        return next(new Error("can not instructor", { cause: 400 }));
    }
    let numOfInstructors = instructor.instructor.length;
    return res.status(201).json({ message: "Done", numOfInstructors, instructor: instructor.instructor });
}
export const removeInstructor = async (req, res, next) => {
    const { courseId } = req.params;
    if (!await courseModel.findById(courseId)) {
        return next(new Error("In-valid course id", { cause: 400 }));
    }
    const instructor = await userModel.findOneAndUpdate({ _id: req.user._id }, { $pull: { instructor: courseId } }, { new: true });
    if (!instructor) {
        return next(new Error("can not instructor", { cause: 400 }));
    }
    return res.status(201).json({ message: "Done", instructor: instructor.instructor });
}
// Wishlist
export const getWishlist = async (req, res, next) => {
    const wishlist = await userModel.findOne({ _id: req.user._id }).select("wishlist");
    if (!wishlist) {
        return next(new Error("Not found wishlist", { cause: 404 }));
    }
    let numOfWishlistCourses = wishlist.wishlist.length;
    return res.status(201).json({ message: "Done", wishlist, numOfWishlistCourses });
}
export const addToWishlist = async (req, res, next) => {
    const { courseId } = req.body;
    if (!await courseModel.findById(courseId)) {
        return next(new Error("In-valid course id", { cause: 400 }));
    }
    const wishlist = await userModel.findOneAndUpdate({ _id: req.user._id }, { $addToSet: { wishlist: courseId } }, { new: true });
    if (!wishlist) {
        return next(new Error("can not add to wishlist", { cause: 400 }));
    }
    let numOfWishlistCourses = wishlist.wishlist.length;
    return res.status(201).json({ message: "Done", wishlist, numOfWishlistCourses });
}
export const removeWishlist = async (req, res, next) => {
    const { courseId } = req.body;
    await userModel.updateOne({ _id: req.user._id }, { $pull: { wishlist: courseId } }, { new: true });
    return res.status(200).json({ message: "Done" });
}