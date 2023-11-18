import mongoose, { Schema, Types, model } from "mongoose";

const cartSchema = new Schema({
    userId : {type : Types.ObjectId , ref : 'User' , required : true , unique : true},
    courses : [{
        courseId : {type : Types.ObjectId , ref : 'Course' , required : true},
        quntity : {type : Number , default : 1 , required : true}
    }],
    numOfCartItems : Number,
    totalCartPrice : Number
},{
    timestamps : true
});
const cartModel = mongoose.models.Cart || model('Cart' , cartSchema);

export default cartModel;