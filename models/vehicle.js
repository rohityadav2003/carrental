const mongoose = require("mongoose");
const vehicleschema = new mongoose.Schema(
  {
    title: { type: String,required:true },
    car: { 
        type: String, 
        ref: "brand",
      
      },
    over: { type: String,required:true  },
    price: { type: Number,required:true  },
    fuel: {
      type: String,
    
      enum: ["petrol","diesel", "hybrid","electric"],
    },
    carmodel: { type: Number,required:true },
    seating: { type: Number,required:true  },
   image:{type:[String]}
  },
  { timestamps: true }
);
const mong3 = mongoose.model("vehicles", vehicleschema);
module.exports = mong3;
