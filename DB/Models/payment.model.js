import mongoose, { Schema, Types, model } from "mongoose";

const paymentSchema = new Schema({
    userId : {type : String , ref : 'User' , required : true},
    updatedBy : {type : String , ref : 'User'},
    phone : [{type : Number , required : true}],
    count : Number,
    reason : String,
    courses : [{
        name : {type : String , required : true},
        image : Object,
        courseId : {type : Types.ObjectId , ref : 'Course' , required : true},
        quntity : {type : Number , default : 1 , required : true},
        unitPrice : {type : Number , default : 1 , required : true},
        finalPrice : {type : Number , default : 1 , required : true}
    }],
    finalPrice : {type : Number , default : 1 , required : true},
    suptotal : {type : Number , default : 1 , required : true},
    couponId : {type : Types.ObjectId , ref : 'Coupon'},
    paymentType : {type : String , enum : ['cash' , 'card'] , default : 'cash'},
    // status
},{
    timestamps : true
});

const paymentModel = mongoose.models.Payment || model('Payment' , paymentSchema);

export default paymentModel;