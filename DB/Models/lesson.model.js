import mongoose, { Schema, Types, model } from "mongoose";

const lessonSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true },
    order: { type: Number, required: true, unique: true },
    // counter: {
    //     type: Number,
    //     default: 1, // Initialize to 1 for the first lesson
    // },
    Sequence: {
        type: Number,
        default: 1,
        unique: true,
    },

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
})

lessonSchema.pre('save', async function (next) {
    if (!this.isNew) {
        return next();
    }

    try {
        const latestLesson = await lessonModel.findOne({}, {}, { sort: { Sequence: -1 } });
        const sequence = latestLesson ? latestLesson.Sequence + 1 : 1;
        this.Sequence = sequence;
        return next();
    } catch (error) {
        return next(error);
    }
});
const lessonModel = mongoose.models.Lesson || model("Lesson", lessonSchema);

export default lessonModel;