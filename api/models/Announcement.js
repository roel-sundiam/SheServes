const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title:     { type: String, required: true, trim: true },
  message:   { type: String, required: true, trim: true },
  type:      { type: String, enum: ['announcement', 'invitation'], default: 'announcement' },
  eventDate: { type: Date, default: null },
  place:     { type: String, default: null, trim: true },
  createdBy: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
