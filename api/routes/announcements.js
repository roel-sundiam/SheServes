const express      = require('express');
const Announcement = require('../models/Announcement');

const router = express.Router();

router.get('/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch announcements.' });
  }
});

router.post('/announcements', async (req, res) => {
  const { title, message, type, eventDate, place, createdBy } = req.body;
  if (!title || !message || !createdBy)
    return res.status(400).json({ message: 'title, message, and createdBy are required.' });
  try {
    const announcement = await Announcement.create({ title, message, type, eventDate: eventDate || null, place: place || null, createdBy });
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create announcement.' });
  }
});

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
