const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,https://zedideaarena.com,https://www.zedideaarena.com,https://hub.zedideaarena.com').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, false);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

const { supabase } = require('./config/supabase');

const PaymentService = require('./services/payments/PaymentService');
const PawapayProvider = require('./services/payments/providers/PawapayProvider');

const paymentService = new PaymentService();
const pawapay = new PawapayProvider();
paymentService.registerProvider(pawapay);

global.__paymentService = paymentService;

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      supabase: process.env.SUPABASE_URL ? 'configured' : 'missing_credentials',
      payments: paymentService.getAvailableProviders().length > 0 ? 'initialized' : 'no_providers',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      supabase: process.env.SUPABASE_URL ? 'configured' : 'missing_credentials',
      payments: paymentService.getAvailableProviders().length > 0 ? 'initialized' : 'no_providers',
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
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/notification-preferences', require('./routes/notificationPreferenceRoutes'));
app.use('/api/waitlist', require('./routes/waitlistRoutes'));

const { error: sendError } = require('./utils/response');

app.use((err, req, res, next) => {
  console.error('[UNHANDLED_ERROR]', err);
  if (res.headersSent) return next(err);
  sendError(res, 'Internal server error', 500, process.env.NODE_ENV === 'development' ? err.message : null);
});

app.listen(PORT, () => {
  console.log(`Server active on port ${PORT}`);
});
