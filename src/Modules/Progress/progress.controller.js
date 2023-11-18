import courseModel from "../../../DB/Models/course.model.js";
import lessonModel from "../../../DB/Models/lesson.model.js";
import progressModel from "../../../DB/Models/progress .model.js";

export const progressModule = async (req, res, next) => {
    const progress = await progressModel.find({});
    return res.status(200).json({ message: "lessons seen", numOfLessonSeen: progress.length, progress })
}

export const createPrerequisites = async (req, res, next) => {
    const { lessonId } = req.params;
    let lesson = await lessonModel.findById(lessonId);

    if (!lesson) {
        return next(new Error("Invalid lesson id", { cause: 409 }));
    }

    if (!lesson.prerequisites || lesson.prerequisites.length === 0) {
        // No prerequisites, lesson is accessible
        try {
            let updateLesson = await lessonModel.updateOne({ _id: lessonId }, { hasSeen: true });

            if (updateLesson.modifiedCount) {
                // Fetch the updated lesson after the update
                lesson = await lessonModel.findById(lessonId);
                return res.status(200).json({ message: "This video is available to see", lesson, updateLesson });
            } else {
                return next(new Error("Unable to update", { cause: 400 }));
            }
        } catch (err) {
            return next(err);
        }
    }
    if ((lesson.prerequisites.length + 1) - lesson.Sequence == 0) {
        try {
            let updateLesson = await lessonModel.updateOne({ _id: lessonId }, { hasSeen: true });

            if (updateLesson.modifiedCount) {
                // Fetch the updated lesson after the update
                lesson = await lessonModel.findById(lessonId);
                let saveLesson = await lesson.save();
                return res.status(200).json({ message: "Done", saveLesson, updateLesson });
            } else {
                return next(new Error("Unable to update", { cause: 400 }));
            }
        } catch (err) {
            return next(err);
        }
    }

    return next(new Error("Cannot access video", { cause: 400 }));
}

export const createProgress = async (req, res, next) => {
    const { courseId, lessonId } = req.params;
    let lesson = await lessonModel.findById(lessonId);
    if (!lesson) {
        return next(new Error("Lesson not found", { cause: 404 }));
    }
    let numOfLesson = await lessonModel.find({});
    let progressExist = await progressModel.findOne({ lessonId });
    if (!progressExist) {
        progressExist = new progressModel({ lessonId });
        await progressExist.save();
    }
    let percentageProgress = Number.parseFloat(((lesson.prerequisites.length + 1) / numOfLesson.length) * 100).toFixed(2);
    if (!lesson.hasSeen) {
        return next(new Error("Must have seen prerequisite videos", { cause: 409 }));
    }

    try {
        let updateProgress = await progressModel.updateOne({ lessonId },
            { isCompleted: true, progress: percentageProgress, userId: req.user._id });
        if (updateProgress.modifiedCount) {
            // Fetch the updated progress after the update
            progressExist = await progressModel.findOne({ lessonId });
            await progressExist.save();

            const allProgress = await progressModel.find({});
            let arrProgress = [];
            for (const pro of allProgress) {
                arrProgress.push({
                    progress: pro.progress,
                    lessonId: pro.lessonId
                })
            }

            await courseModel.updateOne({ _id: courseId }, { progressLesson: arrProgress });
            return res.status(200).json({ message: "Done", progressExist, arrProgress });
        } else {
            return next(new Error("Unable to update", { cause: 400 }));
        }
    } catch (err) {
        return next(err);
    }
}
