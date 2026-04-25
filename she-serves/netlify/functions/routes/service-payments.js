const express        = require('express');
const ServicePayment = require('../models/ServicePayment');

const router = express.Router();

router.get('/service-payments', async (req, res) => {
  try {
    const payments = await ServicePayment.find().sort({ date: -1, createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch service payments.' });
  }
});

router.post('/service-payments', async (req, res) => {
  const { amount, date, paidBy, note } = req.body;
  if (!amount || !date || !paidBy)
    return res.status(400).json({ message: 'amount, date, and paidBy are required.' });
  try {
    const payment = await ServicePayment.create({ amount, date, paidBy, note: note || '' });
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to record service payment.' });
  }
});

module.exports = router;
