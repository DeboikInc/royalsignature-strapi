'use strict';

const buckets = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const LIMIT = 8;

module.exports = () => async (ctx, next) => {
  const now = Date.now();
  const key = ctx.request.ip || ctx.ip || 'unknown';
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }
  if (bucket.count >= LIMIT) {
    ctx.status = 429;
    ctx.body = { error: 'Too many submissions. Please try again later.' };
    return;
  }
  bucket.count += 1;
  return next();
};