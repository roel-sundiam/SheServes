const mongoose = require('mongoose');

const servicePaymentSchema = new mongoose.Schema({
  amount:  { type: Number, required: true },
  date:    { type: String, required: true },
  paidBy:  { type: String, required: true },
  note:    { type: String, default: '', trim: true },
}, { timestamps: true });

module.exports = mongoose.models.ServicePayment || mongoose.model('ServicePayment', servicePaymentSchema);
