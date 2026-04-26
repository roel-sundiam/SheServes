const mongoose = require('mongoose');

const coinRequestSchema = new mongoose.Schema({
  amount:      { type: Number, required: true },
  status:      { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestedBy: { type: String, default: 'admin' },
}, { timestamps: true });

module.exports = mongoose.models.CoinRequest || mongoose.model('CoinRequest', coinRequestSchema);
