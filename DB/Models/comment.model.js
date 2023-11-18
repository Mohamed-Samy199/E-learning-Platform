import mongoose, { Schema, Types, model } from "mongoose";

const commentSchema = new Schema({
    text: { type: String, required: true },
    isDeleted : {type : Boolean , default : false},
    createdBy : {type : Types.ObjectId , ref : 'User' , required : true},
    lessonId : {type : Types.ObjectId , ref : 'Lesson' , required : true},
    image: { type: Object },
    reply : 
    [
        {
            textReply : {type : String , required : true},
            repliedBy : {type : Types.ObjectId , ref : 'User' , required : true},
            commentId : {type : Types.ObjectId , ref : 'Comment'},
            imageReply: {type: Object },
        }
    ],
},{
    timestamps : true
});

const commentModel = mongoose.models.Comment || model('Comment' , commentSchema);
export default commentModel;