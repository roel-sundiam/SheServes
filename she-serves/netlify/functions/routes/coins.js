const express     = require('express');
const CoinBalance = require('../models/CoinBalance');
const CoinRequest = require('../models/CoinRequest');

const router = express.Router();

async function getOrCreate() {
  let doc = await CoinBalance.findOne();
  if (!doc) doc = await CoinBalance.create({ balance: 0 });
  return doc;
}

// GET /coins/balance
router.get('/coins/balance', async (req, res) => {
  try {
    const doc = await getOrCreate();
    res.json({ balance: doc.balance });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch coin balance.' });
  }
});

// POST /coins/visit — anonymous public page visit (1 coin)
router.post('/coins/visit', async (req, res) => {
  try {
    const doc = await getOrCreate();
    if (doc.balance <= 0) {
      return res.json({ balance: 0, locked: true });
    }
    doc.balance -= 1;
    await doc.save();
    res.json({ balance: doc.balance, locked: false });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process visit.' });
  }
});

// POST /coins/deduct — admin action (body: { amount })
router.post('/coins/deduct', async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0)
    return res.status(400).json({ message: 'Amount must be a positive number.' });
  try {
    const doc = await getOrCreate();
    if (doc.balance < amount)
      return res.status(402).json({ message: 'Insufficient coins.', balance: doc.balance });
    doc.balance -= amount;
    await doc.save();
    res.json({ balance: doc.balance });
  } catch (err) {
    res.status(500).json({ message: 'Failed to deduct coins.' });
  }
});

// POST /coins/topup — super admin adds coins (body: { amount })
router.post('/coins/topup', async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0)
    return res.status(400).json({ message: 'Amount must be a positive number.' });
  try {
    const doc = await getOrCreate();
    doc.balance += amount;
    await doc.save();
    res.json({ balance: doc.balance });
  } catch (err) {
    res.status(500).json({ message: 'Failed to top up coins.' });
  }
});

// POST /coins/request — admin submits a top-up request
router.post('/coins/request', async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0)
    return res.status(400).json({ message: 'Amount must be a positive number.' });
  try {
    const request = await CoinRequest.create({ amount });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit request.' });
  }
});

// GET /coins/requests — super admin views all requests
router.get('/coins/requests', async (req, res) => {
  try {
    const requests = await CoinRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch requests.' });
  }
});

// POST /coins/requests/:id/approve
router.post('/coins/requests/:id/approve', async (req, res) => {
  try {
    const request = await CoinRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    if (request.status !== 'pending')
      return res.status(400).json({ message: 'Request already processed.' });
    const doc = await getOrCreate();
    doc.balance += request.amount;
    await doc.save();
    request.status = 'approved';
    await request.save();
    res.json({ request, balance: doc.balance });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve request.' });
  }
});

// POST /coins/requests/:id/reject
router.post('/coins/requests/:id/reject', async (req, res) => {
  try {
    const request = await CoinRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    if (request.status !== 'pending')
      return res.status(400).json({ message: 'Request already processed.' });
    request.status = 'rejected';
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject request.' });
  }
});

module.exports = router;
