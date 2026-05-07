const express = require('express');
const Schedule = require('../models/Schedule');

const router = express.Router();

const ALLOWED_CATEGORIES = new Set(['tournament', 'open-play', 'private-event']);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

function validatePayload(payload) {
  const category = String(payload.category || '').trim().toLowerCase();
  const eventDate = String(payload.eventDate || '').trim();
  const eventTime = String(payload.eventTime || '').trim();
  const place = String(payload.place || '').trim();
  const createdBy = String(payload.createdBy || 'admin').trim();
  const tournamentName = category === 'tournament'
    ? String(payload.tournamentName || '').trim()
    : '';

  if (!ALLOWED_CATEGORIES.has(category)) {
    return { error: 'category must be one of: tournament, open-play, private-event.' };
  }

  if (!DATE_RE.test(eventDate)) {
    return { error: 'eventDate must be in YYYY-MM-DD format.' };
  }

  if (!TIME_RE.test(eventTime)) {
    return { error: 'eventTime must be in HH:MM format.' };
  }

  if (!place) {
    return { error: 'place is required.' };
  }

  const startsAt = new Date(`${eventDate}T${eventTime}:00+08:00`);
  if (Number.isNaN(startsAt.getTime())) {
    return { error: 'Invalid date/time combination.' };
  }

  return {
    value: {
      category,
      eventDate,
      eventTime,
      place,
      tournamentName,
      startsAt,
      createdBy: createdBy || 'admin',
    },
  };
}

router.get('/schedules', async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ startsAt: 1, createdAt: -1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch schedules.' });
  }
});

router.post('/schedules', async (req, res) => {
  const { error, value } = validatePayload(req.body || {});
  if (error) {
    return res.status(400).json({ message: error });
  }

  try {
    const doc = new Schedule(value, { strict: false });
    const schedule = await doc.save();
    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create schedule.' });
  }
});

router.put('/schedules/:id', async (req, res) => {
  const { error, value } = validatePayload(req.body || {});
  if (error) {
    return res.status(400).json({ message: error });
  }
  try {
    const updated = await Schedule.findByIdAndUpdate(req.params.id, { $set: value }, { new: true, strict: false });
    if (!updated) return res.status(404).json({ message: 'Schedule not found.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update schedule.' });
  }
});

router.delete('/schedules/:id', async (req, res) => {
  try {
    const deleted = await Schedule.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Schedule not found.' });
    }
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete schedule.' });
  }
});

module.exports = router;