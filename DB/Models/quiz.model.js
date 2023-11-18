import mongoose, { Schema, Types, model } from "mongoose";

const questionSchema = new Schema({
    text: { type: String },
    options: [{
        answer: { type: String },
        isCorrect: { type: Boolean, default: false }
    }],
    points: { type: Number, default: 0 }
})
const quizSchema = new Schema({
    title: String,
    description: String,
    questionsText: [questionSchema],
    answersText: [questionSchema],
    isCompleted: { type: Boolean },
    duration: Number,
    attempts: Number,
    passingScore: Number,  // to do update
    results: [{
        userId: { type: Types.ObjectId, required: true, ref: "User" },
        score: Number,
        answersUser : [Object],
        completedAt: Date,
    }],
    instructorId: { type: Types.ObjectId, required: true, ref: "User" },
    courseId: { type: Types.ObjectId, required: true, ref: "Course" },

}, {
    timestamps: true
})

const quizModel = mongoose.models.Quiz || model('Quiz', quizSchema);

export default quizModel;