const express   = require('express');
const https     = require('https');
const Visit     = require('../models/Visit');
const LoginLog  = require('../models/LoginLog');

const router = express.Router();

function fetchCsvRowCount(url) {
  return new Promise((resolve) => {
    const get = (targetUrl, redirects = 0) => {
      if (redirects > 5) return resolve(0);
      https.get(targetUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return get(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) { res.resume(); return resolve(0); }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const lines = data.split(/\r?\n/).filter(l => l.trim() !== '');
          resolve(Math.max(0, lines.length - 1)); // subtract header row
        });
      }).on('error', () => resolve(0));
    };
    get(url);
  });
}

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
      { $addFields: { normalizedPage: { $arrayElemAt: [{ $split: ['$page', '?'] }, 0] } } },
      { $group: { _id: '$normalizedPage', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const registrationCount = process.env.SHEETS_CSV_URL
      ? await fetchCsvRowCount(process.env.SHEETS_CSV_URL)
      : 0;

    res.json({ totalVisits, anonymousVisits, loggedInVisits, recentLogins, visitsByPage, registrationCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
