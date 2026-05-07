const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true, index: true },
  playerName:   { type: String, required: true, trim: true, maxlength: 200 },
}, { timestamps: true });

schema.index({ tournamentId: 1, playerName: 1 }, { unique: true });

delete mongoose.models.TournamentRegistration;
module.exports = mongoose.model('TournamentRegistration', schema);
