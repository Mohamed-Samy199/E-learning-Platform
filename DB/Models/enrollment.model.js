import mongoose, { Schema, Types, model } from "mongoose";

const enrollmentSchema = new Schema({
    // userEnrollment : [{
    //     userId : {type : Types.ObjectId , ref : "User" },
    //     couseId : {type : Types.ObjectId , ref : "Course"},
    //     enrollmentDate : {type : Date , default : Date.now}
    // }],
    // numOfUserEnroll : Number
    userId: { type: Types.ObjectId, ref: "User" , required : true},
    courseId: { type: Types.ObjectId, ref: "Course" , required : true},
    enrollmentDate: { type: Date, default: Date.now },
    progress : Number,
    isCompleted : {type : Boolean , default : false},
    grades : [Object]

}, {
    timestamps: true
})

const enrollmentModel = mongoose.models.Enrollment || model("Enrollment", enrollmentSchema);
export default enrollmentModel;