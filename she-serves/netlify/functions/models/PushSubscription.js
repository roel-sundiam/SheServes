const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  endpoint: { type: String, required: true, unique: true },
  keys:     { p256dh: String, auth: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.PushSubscription
  || mongoose.model('PushSubscription', schema);
