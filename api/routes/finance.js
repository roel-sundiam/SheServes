const express = require('express');
const Finance = require('../models/Finance');

const router = express.Router();

router.get('/finances', async (req, res) => {
  try {
    const entries = await Finance.find().sort({ date: -1, createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch finance entries.' });
  }
});

router.post('/finances', async (req, res) => {
  const { entryType, amount, description, date, createdBy } = req.body;
  if (!entryType || amount == null || !description || !date || !createdBy)
    return res.status(400).json({ message: 'entryType, amount, description, date, and createdBy are required.' });
  try {
    const entry = await Finance.create({ entryType, amount, description, date, createdBy });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create finance entry.' });
  }
});

router.delete('/finances/:id', async (req, res) => {
  try {
    const deleted = await Finance.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Finance entry not found.' });
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete finance entry.' });
  }
});

module.exports = router;
