import slugify from "slugify";
import courseModel from "../../../DB/Models/course.model.js";
import cloudinary from "../../Utils/cloudinary.js";
import { nanoid } from "nanoid";
import lessonModel from "../../../DB/Models/lesson.model.js";


export const getlessonByVisibilty = async (req, res, next) => {
    const { courseId } = req.params;
    const allLessons = await lessonModel.find({ courseId });
    // if payemnt show all lesson
    if (res.locals.typeOfVisibilityLesson == "payment") {
        return res.status(200).json({ message: "Done", allLessons });
    }

    // if public show some lessons is assine to public visibilty and same idea with private
    const lessons = await lessonModel.find({ courseId, visibility: res.locals.typeOfVisibilityLesson });
    return res.status(200).json({ message: "Done", lessons });

}
export const lessonMedule = async (req, res, next) => {
    const lesson = await lessonModel.find({}).sort('order').populate([
        {
            path: "courseId" //parent
        },
        {
            path: "progress" //child
        }
    ])
    return res.status(200).json({ message: "Lesson Module", lesson })
}
export const getLesson = async (req, res, next) => {
    const { courseId } = req.params;
    if (!await courseModel.findById(courseId)) {
        return next(new Error("in-valid course id", { cause: 400 }));
    }
    const lesson = await lessonModel.find({}).sort('order');
    return res.status(200).json({ message: "Lesson Module", lesson })
}

export const createLesson = async (req, res, next) => {
    const { courseId } = req.params;
    const { title, order, description, content, duration, visibility } = req.body;
    if (await lessonModel.findOne({ order })) {
        return next(new Error(`Dublicate category order ${order}`, { cause: 409 }))
    }
    let slug = slugify(title, { trim: true, lower: true });
    if (!await courseModel.findById(courseId)) {
        return next(new Error("in-valid course id", { cause: 400 }));
    }
    const lessons = await lessonModel.find({});
    let prerequisites = []
    for (const lsn of lessons) {
        prerequisites.push(lsn._id)
    }
    let customId = nanoid(6);
    let video = {}
    if (req.files.video) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.video[0].path, {
            resource_type: "video",
            folder: `${process.env.APP_NAME}/course/${courseId}/lesson/${customId}/${order}`
        })
        video = { secure_url, public_id }
    }

    let fileDownload = [];
    if (req.files.fileDownload) {
        for (const file of req.files.fileDownload) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                resource_type: "raw",
                folder: `${process.env.APP_NAME}/course/${courseId}/lesson/file/${customId}/${order}`
            });
            fileDownload.push({ secure_url, public_id });
        }
    }
    const lesson = new lessonModel({
        title, order, slug, courseId, createdByInstructor: req.user._id, prerequisites, fileDownload,
        video, description, content, duration, visibility, customId
    });
    await lesson.save();
    return res.status(201).json({ message: "Done", lesson })
}
export const updateLesson = async (req , res , next) =>{
    const {lessonId} = req.params;
    const lesson = await lessonModel.findById(lessonId);
    if (!lesson) {
        return next(new Error("in-valid lesson id", { cause: 400 }));
    }
    if (req.body.title) {
        if (req.body.title.toLowerCase() == lesson.title) {
            return next(new Error(`Sorry, can not update title`, { cause: 400 }));
        }
        if (await lessonModel.findOne({title : req.body.title.toLowerCase()})) {
            return next(new Error(`Dublicate lesson title ${req.body.title}`, { cause: 409 }));
        }
        lesson.title = req.body.title;
        lesson.slug = slugify(req.body.title);
    }
    if (req.files?.video?.length) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.video[0].path, {
            resource_type: "video",
            folder: `${process.env.APP_NAME}/course/${courseId}/lesson/${lesson.customId}/${lesson.order}`
        })
        await cloudinary.uploader.destroy(lesson.video.public_id);
        req.body.video = { secure_url, public_id };
    }
    if (req.files?.fileDownload?.length) {
        req.files.fileDownload = [];
        for (const file of req.files.fileDownload) {
            const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
                resource_type: "raw",
                folder: `${process.env.APP_NAME}/course/${lesson.courseId}/lesson/file/${lesson.customId}/${lesson.order}`
            });
            req.files.fileDownload.push({secure_url, public_id});
        }
    }
    req.body.updatedBy = req.user._id;
    const updateLesson = await lessonModel.updateOne({_id : lesson._id} , req.body);
    if (updateLesson.modifiedCount) {
        return res.status(200).json({message : "Done" , updateLesson});
    }
    return next(new Error("can not update" , {cause : 409}));
}
export const likeLesson = async (req ,res , next) => {
    const {lessonId} = req.params;
    const lesson = await lessonModel.findByIdAndUpdate(
        lessonId , 
        {
            $addToSet : {like : req.user._id},
            $pull : {unlike : req.user._id}
        },
        {
            new : true
        }
    )
    if (!lesson) {
        return next(new Error("In-valid lesson id" , {cause : 400}));
    }
    lesson.totaleVote = lesson.like.length - lesson.unlike.length;
    const saveLesson = await lesson.save();
    return res.status(200).json({message : "Done" , saveLesson})
}
export const unlikeLesson = async (req , res , next) => {
    const {lessonId} = req.params;
    const lesson = await lessonModel.findByIdAndUpdate(
        lessonId , 
        {
            $addToSet : {unlike : req.user._id},
            $pull : {like : req.user._id}
        },
        {
            new : true
        }
    );
    if (!lesson) {
        return next(new Error("In-valid lesson id" , {cause : 400}));
    }
    lesson.totaleVote = lesson.like.length - lesson.unlike.length;
    const saveLesson = await lesson.save();
    return res.status(200).json({message : "Done" , saveLesson});
}