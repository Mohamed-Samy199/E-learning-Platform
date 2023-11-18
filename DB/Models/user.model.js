import mongoose, { Schema, Types, model } from "mongoose";

const userSchema = new Schema({
    userName : {
        type : String ,
        required : true, 
        min : 2 , 
        max : 30
    },
    email : {
        type : String, 
        required : true, 
        unique : true,
        lowercase : true
    },
    password : {
        type : String,
        required : true
    },
    gender : {
        type : String,
        default : "male",
        enam : ["male" , "female"]
    },
    confirmEmail : {
        type : Boolean,
        default : false
    },
    status : {
        type : String,
        default : "offline",
        enam : ["online" , "offline" , "blocked"]
    },
    role : {
        type : String,
        default : "User",
        enam : ["User" , "Admin" , "Teacher"]
    },
    instructor : [{type : Types.ObjectId , ref : 'Course'}],
    numOfInstructors : Number,
    phone : Number,
    address : String,
    DOF : String,
    image : Object,

    wishlist: {type: [{ type: Types.ObjectId, ref: "Course" }]},
    numOfWishlistCourses: { type: Number },

    forgetCode : {type : Number , default : null},
    changePasswordTime : Date
},{
    timestamps : true,
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
});

userSchema.virtual('payment' , {
    ref : 'Payment',
    localField : '_id',
    foreignField : 'userId'
})
const userModel = mongoose.models.User || model("User" , userSchema);

export default userModel;