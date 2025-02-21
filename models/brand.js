const mongoose=require("mongoose");
const brandschema= new mongoose.Schema({brand_name:{type:String,required:true}},{timestamps:true});
const  mong2=mongoose.model('brands',brandschema);
module.exports=mong2;