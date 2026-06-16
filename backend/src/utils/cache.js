const { getRedis, isRedisAvailable } = require('../config/redis');

const memoryStore = new Map();
const TTLS = new Map();

function set(key, value, ttlSeconds = 60) {
  if (isRedisAvailable()) {
    getRedis().set(`cache:${key}`, JSON.stringify(value), 'EX', ttlSeconds).catch(() => {});
    return;
  }
  memoryStore.set(key, JSON.stringify(value));
  TTLS.set(key, Date.now() + ttlSeconds * 1000);
}

function get(key) {
  if (isRedisAvailable()) {
    return getRedis().get(`cache:${key}`).then((data) => {
      if (!data) return null;
      try { return JSON.parse(data); } catch { return null; }
    });
  }
  const raw = memoryStore.get(key);
  if (!raw) return null;
  if (Date.now() > (TTLS.get(key) || 0)) {
    memoryStore.delete(key);
    TTLS.delete(key);
    return null;
  }
  try { return JSON.parse(raw); } catch { return null; }
}

function del(key) {
  if (isRedisAvailable()) {
    getRedis().del(`cache:${key}`).catch(() => {});
    return;
  }
  memoryStore.delete(key);
  TTLS.delete(key);
}

function delPattern(pattern) {
  if (isRedisAvailable()) {
    getRedis().keys(`cache:${pattern}`).then((keys) => {
      if (keys.length) getRedis().del(...keys);
    }).catch(() => {});
    return;
  }
  for (const key of memoryStore.keys()) {
    if (key.includes(pattern.replace('*', ''))) {
      memoryStore.delete(key);
      TTLS.delete(key);
    }
  }
}

module.exports = { set, get, del, delPattern };
