const express   = require('express');
const Visit     = require('../models/Visit');
const LoginLog  = require('../models/LoginLog');

const router = express.Router();

// POST /api/visit — called by Angular on each page navigation
router.post('/visit', async (req, res) => {
  const { page, username } = req.body;
  if (!page) return res.status(400).json({ message: 'Page is required.' });
  try {
    await Visit.create({
      page,
      isAnonymous: !username,
      username: username || null,
    });
    res.json({ message: 'Visit recorded.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/analytics — returns summary stats + recent logins
router.get('/analytics', async (req, res) => {
  try {
    const totalVisits     = await Visit.countDocuments();
    const anonymousVisits = await Visit.countDocuments({ isAnonymous: true });
    const loggedInVisits  = await Visit.countDocuments({ isAnonymous: false });

    const recentLogins = await LoginLog.find()
      .sort({ loginAt: -1 })
      .limit(20)
      .select('username loginAt');

    const visitsByPage = await Visit.aggregate([
      { $group: { _id: '$page', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({ totalVisits, anonymousVisits, loggedInVisits, recentLogins, visitsByPage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
