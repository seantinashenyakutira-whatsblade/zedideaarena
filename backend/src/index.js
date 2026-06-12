const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

const { supabase } = require('./config/supabase');
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      supabase: process.env.SUPABASE_URL ? 'configured' : 'missing_credentials',
      stripe: stripe ? 'initialized' : 'missing_credentials',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      supabase: process.env.SUPABASE_URL ? 'configured' : 'missing_credentials',
      stripe: stripe ? 'initialized' : 'missing_credentials',
    },
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Zed Idea Arena API - Ready to Run',
    version: '2.0.0',
  });
});

app.use('/api/webhooks', require('./routes/webhookRoutes'));

app.use(express.json());

app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/ideas', require('./routes/ideaRoutes'));
app.use('/api/media', require('./routes/mediaRoutes'));
app.use('/api/votes', require('./routes/voteRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/competitions', require('./routes/competitionRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/voter', require('./routes/voterRoutes'));
app.use('/api/withdrawals', require('./routes/withdrawalRoutes'));
app.use('/api/arena', require('./routes/arenaRoutes'));
app.use('/api/ads', require('./routes/adsRoutes'));

app.use((err, req, res, next) => {
  console.error('[UNHANDLED_ERROR]', err);
  if (res.headersSent) return next(err);
  const isDev = process.env.NODE_ENV === 'development';
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(isDev && { detail: err.message }),
  });
});

app.listen(PORT, () => {
  console.log(`Server active on port ${PORT}`);
});
