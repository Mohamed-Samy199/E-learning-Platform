import courseModel from "../../../DB/Models/course.model.js";
import reviewModel from "../../../DB/Models/review.model.js";

export const getReview = (req, res, next) => {
    return res.status(200).json({ message: "Review Module" });
}
export const createReview = async (req, res, next) => {
    const { comment, rate, courseId } = req.body;
    let progress = [];
    if (!comment || !rate || !courseId) {
        return next(new Error("Missing required fields in the requiste body."), { cause: 400 });
    }
    const course = await courseModel.findOne({ _id: courseId, 'userEnrollment.userId': req.user._id });
    for (const pro of course.progressLesson) {
        progress.push(pro.progress);
    }
    if (Math.max(...progress) == 100) {
        if (await reviewModel.findOne({ createdBy: req.user._id, courseId })) {
            return next(new Error("Already review by you", { cause: 400 }));
        }
        const review = await reviewModel.create({ comment, rate, courseId, createdBy: req.user._id });
        return res.status(201).json({ message: "Done", review })
    }
    return next(new Error(`Must see all lesson to can add your review mr ${req.user.userName}`, { cause: 409 }));
}
export const updateReview = async (req, res, next) => {
    const { courseId, reviewId } = req.params;
    const review = await reviewModel.updateOne({ _id: reviewId, courseId }, req.body);
    if (!review.matchedCount) {
        return next(new Error(`can not update review`, { cause: 400 }));
    }
    return res.status(200).json({ message: "Done", review });
}