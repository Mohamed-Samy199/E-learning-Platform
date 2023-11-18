import mongoose, { Schema, Types, model } from "mongoose";

const couponSchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true, lowerCase: true },
    image: { type: Object },
    subscrip : {type : Number , default : 1},
    expireDate : {type : Date , required : true},
    usedBy : [{type : Types.ObjectId , ref : 'User'}],
    createdBy : {type : Types.ObjectId , ref : 'User' , required : true},
    updatedBy : {type : Types.ObjectId , ref : 'User'},
    url : String
},{
    timestamps : true
});
const couponModel = mongoose.models.Coupon || model('Coupon' , couponSchema);

export default couponModel;