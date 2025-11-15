import { getRedis } from '../services/redis';
import { db } from '../services/db';
import { schema } from '@robin/database';
import { eq, sql } from 'drizzle-orm';
import { log } from '../utils/logger';

/**
 * Syncs view counts from Redis to PostgreSQL database
 *
 * This job:
 * 1. Scans all Redis keys matching `post:*:views`
 * 2. Batches updates to PostgreSQL
 * 3. Keeps Redis as source of truth for real-time counts
 * 4. Runs every 5 minutes by default
 */
export async function syncViewCounts() {
  const startTime = Date.now();
  const redis = getRedis();

  try {
    log.info('Starting view count sync job', { type: 'sync_views_start' });

    // Find all view counter keys
    const pattern = 'post:*:views';
    const keys = await redis.keys(pattern);

    if (keys.length === 0) {
      log.debug('No view counters found to sync', { type: 'sync_views_empty' });
      return;
    }

    log.info(`Found ${keys.length} view counters to sync`, {
      type: 'sync_views_found',
      count: keys.length
    });

    // Get all values in a pipeline for efficiency
    const pipeline = redis.pipeline();
    keys.forEach(key => pipeline.get(key));
    const results = await pipeline.exec();

    if (!results) {
      log.warn('Pipeline execution returned null', { type: 'sync_views_pipeline_error' });
      return;
    }

    // Prepare batch updates
    const updates: Array<{ postId: string; views: number }> = [];

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const [err, value] = results[i];

      if (err) {
        log.error(`Error reading Redis key: ${key}`, {
          type: 'sync_views_redis_error',
          key,
          error: err instanceof Error ? { message: err.message } : err
        });
        continue;
      }

      // Extract post ID from key format: "post:{id}:views"
      const match = key.match(/^post:([^:]+):views$/);
      if (!match) {
        log.warn(`Invalid key format: ${key}`, { type: 'sync_views_invalid_key', key });
        continue;
      }

      const postId = match[1];
      const views = parseInt(value as string, 10);

      if (isNaN(views) || views < 0) {
        log.warn(`Invalid view count for post ${postId}: ${value}`, {
          type: 'sync_views_invalid_count',
          postId,
          value
        });
        continue;
      }

      updates.push({ postId, views });
    }

    if (updates.length === 0) {
      log.info('No valid updates to perform', { type: 'sync_views_no_updates' });
      return;
    }

    // Batch update database
    // Using a transaction for atomicity
    let updatedCount = 0;

    await db.transaction(async (tx) => {
      for (const { postId, views } of updates) {
        try {
          const result = await tx
            .update(schema.posts)
            .set({ views })
            .where(eq(schema.posts.id, postId))
            .execute();

          // Check if update affected any rows (Drizzle doesn't return rowCount directly)
          // We'll log success if no error thrown
          updatedCount++;

          log.debug(`Updated views for post ${postId}: ${views}`, {
            type: 'sync_views_update',
            postId,
            views
          });
        } catch (err) {
          log.error(`Failed to update post ${postId}`, {
            type: 'sync_views_update_error',
            postId,
            error: err instanceof Error ? { message: err.message, stack: err.stack } : err
          });
        }
      }
    });

    const duration = Date.now() - startTime;

    log.info('View count sync completed', {
      type: 'sync_views_complete',
      duration,
      totalKeys: keys.length,
      validUpdates: updates.length,
      updatedCount
    });

  } catch (error) {
    const duration = Date.now() - startTime;

    log.error('View count sync failed', {
      type: 'sync_views_error',
      duration,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error
    });

    // Don't throw - we don't want to crash the scheduler
    // The error is logged and we'll retry on next interval
  }
}
