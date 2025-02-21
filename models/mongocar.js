const mongoose=require("mongoose");
const userschema=new mongoose.Schema({name:{type:String,required:true},email:{type:String,required:true},password:{type:String,required:true}, role: { type: String, default: "user" } },{timestamps:true});
const User=mongoose.model('userdetails',userschema);
module.exports=User;