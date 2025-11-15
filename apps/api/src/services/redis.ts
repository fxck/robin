import Redis from 'ioredis';
import { log } from '../utils/logger';

let redisClient: Redis | null = null;
let redisPubClient: Redis | null = null;
let redisSubClient: Redis | null = null;

/**
 * Get Redis client instance (singleton)
 */
export function getRedis(): Redis {
  if (!redisClient) {
    const config = useRuntimeConfig();
    const redisUrl = config.redisUrl || 'redis://localhost:6379';

    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      lazyConnect: false,
      enableReadyCheck: true,
    });

    redisClient.on('connect', () => {
      log.info('Redis client connected', { type: 'redis_connect', client: 'main' });
    });

    redisClient.on('error', (err) => {
      log.error('Redis client error', {
        type: 'redis_error',
        client: 'main',
        error: err instanceof Error ? { message: err.message, stack: err.stack } : err
      });
    });

    redisClient.on('ready', () => {
      log.info('Redis client ready', { type: 'redis_ready', client: 'main' });
    });
  }

  return redisClient;
}

/**
 * Get Redis Pub/Sub clients
 */
export function getRedisPubSub(): { pub: Redis; sub: Redis } {
  if (!redisPubClient || !redisSubClient) {
    const config = useRuntimeConfig();
    const redisUrl = config.redisUrl || 'redis://localhost:6379';

    redisPubClient = new Redis(redisUrl, {
      lazyConnect: false,
    });

    redisSubClient = new Redis(redisUrl, {
      lazyConnect: false,
    });

    redisPubClient.on('connect', () => {
      log.info('Redis pub client connected', { type: 'redis_connect', client: 'pub' });
    });

    redisSubClient.on('connect', () => {
      log.info('Redis sub client connected', { type: 'redis_connect', client: 'sub' });
    });
  }

  return { pub: redisPubClient, sub: redisSubClient };
}

/**
 * Close all Redis connections
 */
export async function closeRedis(): Promise<void> {
  const clients = [redisClient, redisPubClient, redisSubClient].filter(Boolean);

  await Promise.all(
    clients.map((client) => client?.quit())
  );

  redisClient = null;
  redisPubClient = null;
  redisSubClient = null;

  log.info('Redis connections closed', { type: 'redis_close', count: clients.length });
}

// ============================================================================
// CACHING UTILITIES
// ============================================================================

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

/**
 * Get cached value
 */
export async function getCache<T>(key: string, options?: CacheOptions): Promise<T | null> {
  const redis = getRedis();
  const fullKey = options?.prefix ? `${options.prefix}:${key}` : key;

  try {
    const value = await redis.get(fullKey);
    if (!value) return null;

    return JSON.parse(value) as T;
  } catch (error) {
    log.error('Cache get error', {
      type: 'cache_get_error',
      key: fullKey,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error
    });
    return null;
  }
}

/**
 * Set cached value
 */
export async function setCache<T>(
  key: string,
  value: T,
  options?: CacheOptions
): Promise<void> {
  const redis = getRedis();
  const fullKey = options?.prefix ? `${options.prefix}:${key}` : key;
  const ttl = options?.ttl || 300; // Default 5 minutes

  try {
    await redis.setex(fullKey, ttl, JSON.stringify(value));
  } catch (error) {
    log.error('Cache set error', {
      type: 'cache_set_error',
      key: fullKey,
      ttl,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error
    });
  }
}

/**
 * Delete cached value(s)
 */
export async function deleteCache(pattern: string, options?: CacheOptions): Promise<void> {
  const redis = getRedis();
  const fullPattern = options?.prefix ? `${options.prefix}:${pattern}` : pattern;

  try {
    // If pattern contains wildcards, use scan
    if (fullPattern.includes('*')) {
      const keys = await scanKeys(fullPattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      await redis.del(fullPattern);
    }
  } catch (error) {
    log.error('Cache delete error', {
      type: 'cache_delete_error',
      pattern: fullPattern,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error
    });
  }
}

/**
 * Scan for keys matching pattern
 */
async function scanKeys(pattern: string): Promise<string[]> {
  const redis = getRedis();
  const keys: string[] = [];
  let cursor = '0';

  do {
    const [newCursor, scannedKeys] = await redis.scan(
      cursor,
      'MATCH',
      pattern,
      'COUNT',
      100
    );
    cursor = newCursor;
    keys.push(...scannedKeys);
  } while (cursor !== '0');

  return keys;
}

// ============================================================================
// COUNTER UTILITIES
// ============================================================================

/**
 * Increment counter
 */
export async function incrementCounter(key: string, by = 1): Promise<number> {
  const redis = getRedis();
  return await redis.incrby(key, by);
}

/**
 * Get counter value
 */
export async function getCounter(key: string): Promise<number> {
  const redis = getRedis();
  const value = await redis.get(key);
  return value ? parseInt(value, 10) : 0;
}

/**
 * Set counter value with optional TTL
 */
export async function setCounter(key: string, value: number, ttl?: number): Promise<void> {
  const redis = getRedis();

  if (ttl) {
    await redis.setex(key, ttl, value);
  } else {
    await redis.set(key, value);
  }
}

// ============================================================================
// RATE LIMITING
// ============================================================================

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit using sliding window
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const redis = getRedis();
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  try {
    // Remove old entries outside the window
    await redis.zremrangebyscore(key, 0, windowStart);

    // Count entries in current window
    const count = await redis.zcard(key);

    if (count >= limit) {
      // Get oldest entry to calculate reset time
      const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES');
      const resetAt = oldest.length > 1
        ? parseInt(oldest[1]) + windowSeconds * 1000
        : now + windowSeconds * 1000;

      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    // Add current request
    await redis.zadd(key, now, `${now}-${Math.random()}`);
    await redis.expire(key, windowSeconds);

    return {
      allowed: true,
      remaining: limit - count - 1,
      resetAt: now + windowSeconds * 1000,
    };
  } catch (error) {
    log.error(`Rate limit error for key ${key}:`, error);
    // Fail open - allow request on error
    return {
      allowed: true,
      remaining: limit,
      resetAt: now + windowSeconds * 1000,
    };
  }
}

// ============================================================================
// SORTED SETS (for trending, leaderboards, etc.)
// ============================================================================

/**
 * Add member to sorted set
 */
export async function addToSortedSet(
  key: string,
  score: number,
  member: string,
  ttl?: number
): Promise<void> {
  const redis = getRedis();
  await redis.zadd(key, score, member);

  if (ttl) {
    await redis.expire(key, ttl);
  }
}

/**
 * Get top members from sorted set
 */
export async function getTopFromSortedSet(
  key: string,
  count = 10,
  withScores = false
): Promise<string[] | Array<{ member: string; score: number }>> {
  const redis = getRedis();

  if (withScores) {
    const results = await redis.zrevrange(key, 0, count - 1, 'WITHSCORES');
    const parsed: Array<{ member: string; score: number }> = [];

    for (let i = 0; i < results.length; i += 2) {
      parsed.push({
        member: results[i],
        score: parseFloat(results[i + 1]),
      });
    }

    return parsed;
  }

  return await redis.zrevrange(key, 0, count - 1);
}

/**
 * Increment score in sorted set
 */
export async function incrementSortedSetScore(
  key: string,
  member: string,
  increment = 1
): Promise<number> {
  const redis = getRedis();
  const newScore = await redis.zincrby(key, increment, member);
  return parseFloat(newScore);
}

/**
 * Remove member from sorted set
 */
export async function removeFromSortedSet(key: string, member: string): Promise<void> {
  const redis = getRedis();
  await redis.zrem(key, member);
}

// ============================================================================
// PUB/SUB
// ============================================================================

export type MessageHandler = (channel: string, message: any) => void | Promise<void>;

/**
 * Publish message to channel
 */
export async function publish(channel: string, message: any): Promise<void> {
  const { pub } = getRedisPubSub();

  try {
    await pub.publish(channel, JSON.stringify(message));
  } catch (error) {
    log.error(`Pub/Sub publish error on channel ${channel}:`, error);
  }
}

/**
 * Subscribe to channel
 */
export async function subscribe(channel: string, handler: MessageHandler): Promise<void> {
  const { sub } = getRedisPubSub();

  sub.subscribe(channel, (err) => {
    if (err) {
      log.error(`Pub/Sub subscribe error on channel ${channel}:`, err);
    } else {
      log.info(`Subscribed to channel: ${channel}`);
    }
  });

  sub.on('message', async (ch, msg) => {
    if (ch === channel) {
      try {
        const parsed = JSON.parse(msg);
        await handler(ch, parsed);
      } catch (error) {
        log.error(`Pub/Sub message handler error on channel ${channel}:`, error);
      }
    }
  });
}

/**
 * Unsubscribe from channel
 */
export async function unsubscribe(channel: string): Promise<void> {
  const { sub } = getRedisPubSub();
  await sub.unsubscribe(channel);
  log.info(`Unsubscribed from channel: ${channel}`);
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * Check Redis health
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const redis = getRedis();
    const result = await redis.ping();
    return result === 'PONG';
  } catch (error) {
    log.error('Redis health check failed:', error);
    return false;
  }
}
