const rateLimit = require('express-rate-limit');

const keyGenerator = (req) => req.user?.uid || req.ip || 'unknown';

const voteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator,
  message: { status: 'error', message: 'Too many votes. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const ideaLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator,
  message: { status: 'error', message: 'Too many idea submissions. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { status: 'error', message: 'Too many auth attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { voteLimiter, ideaLimiter, authLimiter };
