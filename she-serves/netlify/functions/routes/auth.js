const express  = require('express');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const LoginLog = require('../models/LoginLog');

const router = express.Router();

// POST /api/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: 'Username and password are required.' });

  try {
    const user = await User.findOne({ username });
    if (!user)
      return res.status(401).json({ message: 'Invalid username or password.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Invalid username or password.' });

    await LoginLog.create({ username });

    res.json({ message: 'Login successful.', role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
