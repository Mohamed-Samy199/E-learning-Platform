import mongoose, { Schema, Types, model } from "mongoose";

const lessonSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true },
    order: { type: Number, required: true },
    Sequence: {type: Number,default: 1},

    courseId: { type: Types.ObjectId, ref: "Course", required: true },
    progressId: { type: Types.ObjectId, ref: "Progress", },
    createdByInstructor: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    commentId : {type : Types.ObjectId , ref : 'Comment'},

    description: String,
    content: String,
    duration: Number,
    video: Object,
    fileDownload: [Object],
    visibility: {
        type: String,
        enum: ['public', 'private', 'restricted' , 'payment'],
        default: 'public', // Default to public visibility
    },
    hasSeen: {
        type: Boolean,
        default: false, // Default to not seen
    },
    prerequisites: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
        },
    ],
    like : [{type : Types.ObjectId , ref : 'User'}],
    unlike : [{type : Types.ObjectId , ref : 'User'}],
    totaleVote  : {type : Number , default : 0},
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
lessonSchema.virtual('progress', {
    ref: 'Progress',
    localField: '_id',
    foreignField: 'lessonId'
});
lessonSchema.virtual('comment', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'lessonId'
})

lessonSchema.pre('save', async function (next) {
    if (!this.isNew) {
        return next();
    }

    try {
        // Find the latest lesson for the current course
        const latestLessonForCourse = await lessonModel
            .findOne({ courseId: this.courseId })
            .sort({ Sequence: -1 });

        // Determine the sequence number based on the latest lesson for the course
        const sequence = latestLessonForCourse ? latestLessonForCourse.Sequence + 1 : 1;
        this.Sequence = sequence;

        return next();
    } catch (error) {
        return next(error);
    }
});
const lessonModel = mongoose.models.Lesson || model("Lesson", lessonSchema);

export default lessonModel;