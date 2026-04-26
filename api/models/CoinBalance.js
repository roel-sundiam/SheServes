const mongoose = require('mongoose');

const coinBalanceSchema = new mongoose.Schema(
  { balance: { type: Number, required: true, default: 0 } },
  { timestamps: true }
);

module.exports = mongoose.models.CoinBalance || mongoose.model('CoinBalance', coinBalanceSchema);
