require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User');

const admins = [
  { username: 'admin',     password: 'sheserves2025' },
  { username: 'AkVinluan', password: 'sheserves2025' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  for (const admin of admins) {
    const existing = await User.findOne({ username: admin.username });
    if (existing) {
      console.log(`User "${admin.username}" already exists. Skipping.`);
      continue;
    }
    const hashed = await bcrypt.hash(admin.password, 10);
    await User.create({ username: admin.username, password: hashed, role: 'admin' });
    console.log(`Admin user created: username=${admin.username}`);
  }

  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
