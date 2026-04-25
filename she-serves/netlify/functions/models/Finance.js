const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
  entryType:   { type: String, enum: ['cash-in', 'cash-out'], required: true },
  amount:      { type: Number, required: true },
  description: { type: String, required: true, trim: true },
  date:        { type: String, required: true },
  createdBy:   { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.models.Finance || mongoose.model('Finance', financeSchema);
