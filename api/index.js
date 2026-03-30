require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const authRoutes = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

app.use('/api', authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch(err => { console.error('MongoDB connection error:', err); process.exit(1); });
