const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const { getRedis } = require('../config/redis');

const REDIS_PLACEHOLDER = 'redis://default:password@host:port';

function isRedisConfigured() {
  return process.env.REDIS_URL && process.env.REDIS_URL !== REDIS_PLACEHOLDER;
}

function createStore(prefix) {
  if (isRedisConfigured()) {
    const client = getRedis();
    if (client) {
      return new RedisStore({
        prefix,
        sendCommand: (...args) => client.call(...args),
      });
    }
  }
  return undefined;
}

const voteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?.uid || 'anon-' + (req.ip || 'unknown'),
  validate: { keyGeneratorIpFallback: false, xForwardedForHeader: false },
  message: { success: false, error: 'Too many votes. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('rl:vote:'),
});

const ideaLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.user?.uid || 'anon-' + (req.ip || 'unknown'),
  validate: { keyGeneratorIpFallback: false, xForwardedForHeader: false },
  message: { success: false, error: 'Too many idea submissions. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('rl:idea:'),
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.ip || req.connection?.remoteAddress || 'unknown',
  validate: { keyGeneratorIpFallback: false, xForwardedForHeader: false },
  message: { success: false, error: 'Too many auth attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('rl:auth:'),
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.ip || req.connection?.remoteAddress || 'unknown',
  validate: { keyGeneratorIpFallback: false, xForwardedForHeader: false },
  message: { success: false, error: 'Too many password reset requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore('rl:forgotpwd:'),
});

module.exports = { voteLimiter, ideaLimiter, authLimiter, forgotPasswordLimiter };
