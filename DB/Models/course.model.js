import mongoose, { Schema, Types, model } from "mongoose";


const courseSchema = new Schema({
    title: { type: String, unique: true, required: true, trim: true, lowercase: true },
    slug: { type: String, unique: true, required: true, trim: true, lowercase: true },

    price: { type: Number, default: 1, requiredd: true },
    seat: { type: Number, default: 1, required: true },
    discount: { type: Number, default: 0 },
    finalPrice: { type: Number, default: 1 },

    courseId: { type: String, unique: true },
    startDate: { type: String, default: null },
    endDate: { type: String, default: null },
    isDeleted: { type: Boolean, default: false }, //20
    // userEnrollment: { type: Number },
    userEnrollment : [{
        userId : {type : Types.ObjectId , ref : "User" , unique : true},
        couseId : {type : Types.ObjectId , ref : "Course"},
        enrollmentDate : {type : Date , default : Date.now}
    }],
    numOfUserEnroll : {type : Number},


    enrollStatus: { type: String, enum: ['open', 'closed', 'progres'], default: 'open' },//16
    visiblity: { type: String, enum: ['public', 'private'], default: 'public' },

    customId: String,
    duratione: String,
    prerequired: String,
    image: Object,
    description: String,
    progressLesson : Object,

    instructorId: [{ type: Types.ObjectId, ref: 'User', required: true }],
    categoryId: { type: Types.ObjectId, ref: 'Category', required: true },
    wishUserList: [{ type: Types.ObjectId, ref: 'User' }],

    createdBy: { type: Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

const courseModel = mongoose.models.Course || model('Course', courseSchema);
export default courseModel;