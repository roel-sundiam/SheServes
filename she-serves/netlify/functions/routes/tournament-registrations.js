const express  = require('express');
const mongoose = require('mongoose');
const TournamentRegistration = require('../models/TournamentRegistration');
const Schedule = require('../models/Schedule');

const router = express.Router();

// POST /api/tournament-registrations — public
router.post('/tournament-registrations', async (req, res) => {
  const { tournamentId, playerName } = req.body || {};

  if (!tournamentId || !mongoose.Types.ObjectId.isValid(tournamentId)) {
    return res.status(400).json({ message: 'Valid tournamentId is required.' });
  }
  if (!playerName || !String(playerName).trim()) {
    return res.status(400).json({ message: 'Player name is required.' });
  }

  try {
    const schedule = await Schedule.findById(tournamentId);
    if (!schedule || schedule.category !== 'tournament') {
      return res.status(404).json({ message: 'Tournament not found.' });
    }

    const reg = await TournamentRegistration.create({
      tournamentId,
      playerName: String(playerName).trim(),
    });
    res.status(201).json(reg);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This player is already registered for this tournament.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Failed to submit registration.' });
  }
});

// GET /api/tournament-registrations?tournamentId=... — admin
router.get('/tournament-registrations', async (req, res) => {
  const { tournamentId } = req.query;
  if (!tournamentId || !mongoose.Types.ObjectId.isValid(tournamentId)) {
    return res.status(400).json({ message: 'Valid tournamentId query param is required.' });
  }
  try {
    const regs = await TournamentRegistration
      .find({ tournamentId })
      .sort({ createdAt: 1 });
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch registrations.' });
  }
});

// DELETE /api/tournament-registrations/:id — admin
router.delete('/tournament-registrations/:id', async (req, res) => {
  try {
    const deleted = await TournamentRegistration.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Registration not found.' });
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete registration.' });
  }
});

module.exports = router;
