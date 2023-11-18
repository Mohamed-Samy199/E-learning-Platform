import mongoose, { Schema, Types, model } from "mongoose";

const categorySchema = new Schema({
    name : {type : String , required : true , lowerCase : true , trim : true},
    slug : {type :  String , required : true , lowerCase : true , trim : true},
    createdBy : {type : Types.ObjectId , ref : "User" , required : true},
    updatedBy : { type: Types.ObjectId, ref: "User" }
},{
    timestamps : true
})

const categoryModel = mongoose.models.Categoey || model("Category" , categorySchema);
export default categoryModel;