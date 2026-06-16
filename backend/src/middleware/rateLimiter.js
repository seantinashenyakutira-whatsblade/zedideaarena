const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const { getRedis, isRedisAvailable } = require('../config/redis');

function createStore() {
  if (process.env.REDIS_URL) {
    const client = getRedis();
    if (client) {
      return new RedisStore({
        sendCommand: (...args) => client.call(...args),
      });
    }
  }
  return undefined;
}

const store = createStore();

const voteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?.uid || 'anon-' + (req.ip || 'unknown'),
  validate: { keyGeneratorIpFallback: false, xForwardedForHeader: false },
  message: { success: false, error: 'Too many votes. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  store,
});

const ideaLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.user?.uid || 'anon-' + (req.ip || 'unknown'),
  validate: { keyGeneratorIpFallback: false, xForwardedForHeader: false },
  message: { success: false, error: 'Too many idea submissions. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  store,
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.ip || req.connection?.remoteAddress || 'unknown',
  validate: { keyGeneratorIpFallback: false, xForwardedForHeader: false },
  message: { success: false, error: 'Too many auth attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  store,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.ip || req.connection?.remoteAddress || 'unknown',
  validate: { keyGeneratorIpFallback: false, xForwardedForHeader: false },
  message: { success: false, error: 'Too many password reset requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  store,
});

module.exports = { voteLimiter, ideaLimiter, authLimiter, forgotPasswordLimiter };
