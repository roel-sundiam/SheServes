const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  page:        { type: String, required: true },
  isAnonymous: { type: Boolean, default: true },
  username:    { type: String, default: null },
  visitedAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('Visit', visitSchema);
