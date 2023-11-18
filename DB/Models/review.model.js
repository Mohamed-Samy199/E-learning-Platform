import mongoose, { Schema, Types, model } from "mongoose";

const reviewSchema = new Schema({
    comment : {type : String , required : true},
    rate : {type : Number , min : 0 , max : 5},
    createdBy : {type : Types.ObjectId , ref : 'User' , required : true},
    courseId : {type : Types.ObjectId , ref : 'Course' , required : true},
},{
    timestamps : true
});

const reviewModel = mongoose.models.Review || model('Review' , reviewSchema);
export default reviewModel;