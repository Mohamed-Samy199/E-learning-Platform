import courseModel from "../../../DB/Models/course.model.js";
import enrollmentModel from "../../../DB/Models/enrollment.model.js";
import userModel from "../../../DB/Models/user.model.js";

export const userModule = (req, res, next) => {
    return res.status(200).json({ message: "Enrollment Module" })
}
export const createUserEnrollment = async (req, res, next) => {
    const userId = req.user._id;
    const { courseId } = req.params;
    let arrProgress = [];
    const course = await courseModel.findByIdAndUpdate(
        courseId,
        {
            $push: {
                userEnrollmentt: {
                    userId: req.user._id,
                    courseId: courseId,
                    enrollmentDate: Date.now()
                }
            },
        },
        {
            new: true
        }
    );
    

    if (!course) {
        return next(new Error("in-vliad course id", { cause: 404 }));
    }
    for (const progress of course.progressLesson) {
        arrProgress.push(progress.progress);
    }
    let enrollment = await enrollmentModel.findOne({ courseId, userId });
    if (!enrollment) {
        enrollment = new enrollmentModel({ courseId, userId });
        await enrollment.save();
    }

    let pro = Math.max(...arrProgress);

    if (pro < 100) {
        let enroll = await enrollmentModel.updateOne({ courseId }, { progress: pro, userId, grades: course.progressLesson });
        if (enroll.modifiedCount) {
            return res.status(200).json({ message: "Done", enroll, arrProgress })
        }
    } else {
        let enroll = await enrollmentModel.updateOne({ courseId }, { progress: pro, isCompleted: true, userId, grades: course.progressLesson });
        if (enroll.modifiedCount) {
            return res.status(200).json({ message: "Done", enroll, arrProgress })
        }
    }
}