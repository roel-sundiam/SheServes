const mongoose = require('mongoose');

const coinTransactionSchema = new mongoose.Schema({
  type:   { type: String, enum: ['visit', 'admin'], required: true },
  amount: { type: Number, required: true },
  reason: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.models.CoinTransaction || mongoose.model('CoinTransaction', coinTransactionSchema);
