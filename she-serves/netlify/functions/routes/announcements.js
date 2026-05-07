const express      = require('express');
const Announcement = require('../models/Announcement');
const { sendPush } = require('./push');

const router = express.Router();

// GET /api/announcements — public, returns all announcements newest first
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch announcements.' });
  }
});

// POST /api/announcements — admin creates an announcement
router.post('/announcements', async (req, res) => {
  const { title, message, type, eventDate, place, createdBy } = req.body;
  if (!title || !message || !createdBy) {
    return res.status(400).json({ message: 'title, message, and createdBy are required.' });
  }
  try {
    const announcement = await Announcement.create({ title, message, type, eventDate: eventDate || null, place: place || null, createdBy });
    res.status(201).json(announcement);
    sendPush('New Announcement 📣', title, '/announcements').catch(() => {});
  } catch (err) {
    res.status(500).json({ message: 'Failed to create announcement.' });
  }
});

// PUT /api/announcements/:id — admin edits an announcement
router.put('/announcements/:id', async (req, res) => {
  const { title, message, type, eventDate, place } = req.body;
  if (!title || !message)
    return res.status(400).json({ message: 'title and message are required.' });
  try {
    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,
      { $set: { title, message, type, eventDate: eventDate || null, place: place || null } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Announcement not found.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update announcement.' });
  }
});

// DELETE /api/announcements/:id — admin deletes an announcement
router.delete('/announcements/:id', async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Announcement not found.' });
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete announcement.' });
  }
});

module.exports = router;
