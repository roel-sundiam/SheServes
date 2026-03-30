require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ username: 'admin' });
  if (existing) {
    console.log('Admin user already exists.');
    process.exit(0);
  }

  const hashed = await bcrypt.hash('sheserves2025', 10);
  await User.create({ username: 'admin', password: hashed, role: 'admin' });
  console.log('Admin user created: username=admin, password=sheserves2025');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
