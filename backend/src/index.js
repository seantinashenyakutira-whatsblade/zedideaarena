const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const { db } = require('./config/firebase');
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      firebase: db ? 'connected' : 'missing_credentials',
      stripe: stripe ? 'initialized' : 'missing_credentials',
      didit: process.env.DIDIT_API_KEY ? 'keys_present' : 'missing_credentials'
    }
  });
});

// Mirror health under /api/health for external checks
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      firebase: db ? 'connected' : 'missing_credentials',
      stripe: stripe ? 'initialized' : 'missing_credentials',
      didit: process.env.DIDIT_API_KEY ? 'keys_present' : 'missing_credentials'
    }
  });
});

// Base Route
app.get('/', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Zed Idea Arena API - Ready to Run',
    version: '1.0.0'
  });
});

// Routes
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/kyc', require('./routes/kycRoutes'));
const ideaRoutes = require('./routes/ideaRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const voteRoutes = require('./routes/voteRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/ideas', ideaRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/competitions', require('./routes/competitionRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

app.listen(PORT, () => {
  console.log(`Server highly active on port ${PORT}`);
});
