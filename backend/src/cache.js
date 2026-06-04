import 'dotenv/config';
import Redis from 'ioredis';

export const isRedisEnabled = process.env.DISABLE_REDIS !== 'true';

export const redis = isRedisEnabled
  ? new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  })
  : null;

if (redis) {
  redis.on('error', (err) => console.error('[Redis] Error:', err.message));
  redis.on('connect', () => console.log('[Redis] Connected'));
}

const DEFAULT_TTL = 300; // 5 minutes

/**
 * Get value from cache or compute it with the given fetcher function.
 * @param {string} key - Cache key
 * @param {Function} fetcher - Async function that returns the value if cache miss
 * @param {number} ttl - Time-to-live in seconds
 */
export async function cached(key, fetcher, ttl = DEFAULT_TTL) {
  if (!redis) return fetcher();

  try {
    const hit = await redis.get(key);
    if (hit) return JSON.parse(hit);

    const value = await fetcher();
    await redis.setex(key, ttl, JSON.stringify(value));
    return value;
  } catch (err) {
    console.warn(`[Cache] Error for key "${key}", falling back to live fetch:`, err.message);
    return fetcher();
  }
}

export async function invalidate(pattern) {
  if (!redis) return;

  const keys = await redis.keys(pattern);
  if (keys.length > 0) await redis.del(...keys);
}
