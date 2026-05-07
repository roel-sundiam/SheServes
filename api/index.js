require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const authRoutes          = require('./routes/auth');
const analyticsRoutes     = require('./routes/analytics');
const registrationsRoutes = require('./routes/registrations');
const announcementsRoutes = require('./routes/announcements');
const scheduleRoutes      = require('./routes/schedule');
const financeRoutes          = require('./routes/finance');
const servicePaymentsRoutes  = require('./routes/service-payments');
const coinsRoutes                    = require('./routes/coins');
const tournamentRegistrationsRoutes  = require('./routes/tournament-registrations');

const app  = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:4200',
  'https://she-serves-tc.netlify.app'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', registrationsRoutes);
app.use('/api', announcementsRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', financeRoutes);
app.use('/api', servicePaymentsRoutes);
app.use('/api', coinsRoutes);
app.use('/api', tournamentRegistrationsRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch(err => { console.error('MongoDB connection error:', err); process.exit(1); });
