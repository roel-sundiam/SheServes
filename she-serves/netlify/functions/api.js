const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const serverless = require('serverless-http');

const authRoutes          = require('./routes/auth');
const analyticsRoutes     = require('./routes/analytics');
const registrationsRoutes = require('./routes/registrations');

const app = express();

const allowedOrigins = [
  'http://localhost:4200',
  'https://she-serves-tc.netlify.app',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
}));
app.use(express.json());

// Mount at '/' not '/api' — Netlify strips the function name from the path.
// Angular calls /.netlify/functions/api/login, Express receives /login.
app.use('/', authRoutes);
app.use('/', analyticsRoutes);
app.use('/', registrationsRoutes);

let isConnected = false;
async function connectDb() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

const handler = serverless(app);
module.exports.handler = async (event, context) => {
  // Prevents function from waiting for Mongoose keep-alive timers before responding
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDb();
  return handler(event, context);
};
