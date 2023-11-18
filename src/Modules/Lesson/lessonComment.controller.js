import commentModel from "../../../DB/Models/comment.model.js";
import lessonModel from "../../../DB/Models/lesson.model.js";
import cloudinary from "../../Utils/cloudinary.js";

export const addComment = async (req, res, next) => {
    req.body.lessonId = req.params.lessonId;
    if (!await lessonModel.findById(req.params.lessonId)) {
        return next(new Error("In-valid lesson id", { cause: 400 }));
    }
    if (req.file) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, { folder: `${process.env.APP_NAME}/lesson/${req.params.lessonId}/comment` });
        req.body.image = { secure_url, public_id };
    }
    req.body.createdBy = req.user._id;
    const comment = await commentModel.create(req.body);
    return res.status(201).json({ message: "Done", comment });
}
export const removeComment = async (req , res , next) => {
    const {commentId} = req.params;
    const comment = await commentModel.findOneAndDelete({_id : commentId , createdBy : req.user._id});
    if (!comment) {
        return next(new Error("can not delete comment" , {cause : 400}));
    }

    return res.status(200).json({message : "Done"});
}
export const addReply = async (req, res, next) => {
    req.body.lessonId = req.params.lessonId;
    const comment = await commentModel.findById({ _id: req.params.commentId, lessonId: req.params.lessonId });
    if (!comment) {
        return next(new Error("In-valid comment id", { cause: 400 }));
    }
    const reply = await commentModel.findOneAndUpdate({ _id: req.params.commentId }, 
        {$push : {reply : { repliedBy: req.user._id, textReply: req.body.textReply, commentId: comment._id }}}
        ,{new : true});
    if (!reply) {
        return next(new Error("can not update", { cause: 409 }))
    }
    return res.status(201).json({ message: "Done", comment });
}
export const removeReply = async (req , res , next) => {
    const {replyId , commentId} = req.params;
    const reply = await commentModel.findOneAndUpdate(
        { _id : commentId}, 
        {$pull : {reply :  {_id : replyId}  }}
        ,{new : true});
    if (!reply) {
        return next(new Error("replay not found", { cause: 400 }));
    }

    return res.status(200).json({message : "Done"});
}