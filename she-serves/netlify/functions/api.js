const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const serverless = require('serverless-http');

const authRoutes          = require('./routes/auth');
const analyticsRoutes     = require('./routes/analytics');
const registrationsRoutes = require('./routes/registrations');
const announcementsRoutes = require('./routes/announcements');
const scheduleRoutes      = require('./routes/schedule');
const financeRoutes          = require('./routes/finance');
const servicePaymentsRoutes  = require('./routes/service-payments');
const { router: pushRoutes } = require('./routes/push');
const coinsRoutes            = require('./routes/coins');

const app = express();

const allowedOrigins = [
  'http://localhost:4200',
  'https://she-serves-tc.netlify.app',
  'https://bo2tsundi.netlify.app',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
}));
// Raw body parser — reads the stream directly so serverless-http's
// stream emulation can't interfere with express.json().
app.use((req, res, next) => {
  let data = '';
  req.on('data', chunk => { data += chunk; });
  req.on('end', () => {
    if (data) {
      try { req.body = JSON.parse(data); } catch (e) { req.body = {}; }
    } else {
      req.body = {};
    }
    next();
  });
  req.on('error', () => { req.body = {}; next(); });
});

app.use('/api', authRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', registrationsRoutes);
app.use('/api', announcementsRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', financeRoutes);
app.use('/api', servicePaymentsRoutes);
app.use('/api', pushRoutes);
app.use('/api', coinsRoutes);

let isConnected = false;
async function connectDb() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

// basePath strips '/.netlify/functions/api' so Express receives '/api/login' etc.
const handler = serverless(app, { basePath: '/.netlify/functions/api' });
module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDb();
  return handler(event, context);
};
