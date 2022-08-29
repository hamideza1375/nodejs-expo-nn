const mongoose = require('mongoose');




const Payment = new mongoose.Schema({
  phone : String ,
  fullname: String,
  price : Number,
  title: String,
  paymentCode : String,
  refId : String,
  floor: Number,
  plaque: Number,
  formattedAddress: String,
  success: { type: Boolean, default: false },
  user: { type : mongoose.Schema.Types.ObjectId, ref : "user" },
});



module.exports = mongoose.model('payment', Payment);;

