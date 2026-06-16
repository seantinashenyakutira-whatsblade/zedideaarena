const Redis = require('ioredis');

let redisClient = null;

const REDIS_URL = process.env.REDIS_URL;

if (REDIS_URL) {
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  redisClient.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message);
  });

  redisClient.on('connect', () => {
    console.log('[Redis] Connected');
  });

  redisClient.connect().catch((err) => {
    console.warn('[Redis] Connection failed, falling back to in-memory:', err.message);
    redisClient = null;
  });
} else {
  console.log('[Redis] REDIS_URL not set — using in-memory fallback');
}

function getRedis() {
  return redisClient;
}

function isRedisAvailable() {
  return redisClient !== null && redisClient.status === 'ready';
}

module.exports = { getRedis, isRedisAvailable };
