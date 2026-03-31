const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema({
  username:  { type: String, required: true },
  loginAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('LoginLog', loginLogSchema);
