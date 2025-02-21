const mongoose=require('mongoose');
const booking=new mongoose.Schema({
    from:String,
    to:String,
    vehicle:String,
    message:String,
    fname:String,
    images: String,
    status: { type: String, default: "Not Yet Confirmed" },  // Default status
    postingDate: { type: Date, default: Date.now }  // Auto-filled date
});
const Booking=mongoose.model('bookings',booking);
module.exports=Booking;