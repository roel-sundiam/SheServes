const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['tournament', 'open-play', 'private-event'],
    required: true,
  },
  eventDate: {
    type: String,
    required: true,
    trim: true,
  },
  eventTime: {
    type: String,
    required: true,
    trim: true,
  },
  place: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150,
  },
  startsAt: {
    type: Date,
    required: true,
    index: true,
  },
  createdBy: {
    type: String,
    default: 'admin',
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);