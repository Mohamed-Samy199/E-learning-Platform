import mongoose, { Schema, Types, model } from "mongoose";

const progressSchema = new Schema({
    userId : { type: Types.ObjectId, ref: "User", required: true },
    lessonId : {type : Types.ObjectId , ref : "Lesson" , required : true},
    progress : {type : Number , default : 0},
    isCompleted : {type :Boolean , default : false}
},{
    timestamps : true
})
const progressModel = mongoose.models.Progress || model("Progress" , progressSchema);
export default progressModel;