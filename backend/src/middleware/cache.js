const cache = require('../utils/cache');

function cacheMiddleware(ttlSeconds = 60) {
  return (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = req.originalUrl;

    const cached = cache.get(key);
    if (cached && typeof cached.then === 'function') {
      cached.then((data) => {
        if (data) return res.json(data);
        next();
      }).catch(() => next());
      return;
    }

    if (cached) return res.json(cached);

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      cache.set(key, body, ttlSeconds);
      originalJson(body);
    };

    next();
  };
}

function invalidate(pattern) {
  cache.delPattern(pattern);
}

module.exports = { cacheMiddleware, invalidate };
