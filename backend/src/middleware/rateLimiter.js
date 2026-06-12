const rateLimit = require('express-rate-limit');

const voteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?.uid || 'anon-' + (req.ip || 'unknown'),
  validate: { keyGeneratorIpFallback: false, xForwardedForHeader: false },
  message: { status: 'error', message: 'Too many votes. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const ideaLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.user?.uid || 'anon-' + (req.ip || 'unknown'),
  validate: { keyGeneratorIpFallback: false, xForwardedForHeader: false },
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
