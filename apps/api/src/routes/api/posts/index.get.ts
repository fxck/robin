import { defineEventHandler, getQuery } from 'h3';
import { z } from 'zod';
import { eq, desc, and, isNull, sql } from 'drizzle-orm';
import { db } from '../../../services/db';
import { schema } from '@robin/database';
import { getCache, setCache, getCounter, setCounter } from '../../../services/redis';
import { log } from '../../../utils/logger';
import { rewriteImageUrlsInObject } from '../../../utils/cdn';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['draft', 'published', 'all']).default('published'),
  userId: z.string().optional(),
  search: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  // Parse and validate query params
  const query = getQuery(event);
  const params = querySchema.parse(query);

  const offset = (params.page - 1) * params.limit;

  // Build cache key
  const cacheKey = `posts:list:${params.page}:${params.limit}:${params.status}:${params.userId || 'all'}:${params.search || 'none'}`;

  // Try to get from cache
  const cached = await getCache<any>(cacheKey);
  if (cached) {
    log.debug(`Cache hit for posts list: ${cacheKey}`);
    return rewriteImageUrlsInObject(cached);
  }

  // Build query conditions
  const conditions = [isNull(schema.posts.deletedAt)];

  if (params.status !== 'all') {
    conditions.push(eq(schema.posts.status, params.status));
  }

  if (params.userId) {
    conditions.push(eq(schema.posts.userId, params.userId));
  }

  if (params.search) {
    // Full-text search using PostgreSQL tsvector
    const searchCondition = sql`to_tsvector('english', ${schema.posts.title} || ' ' || ${schema.posts.content}) @@ plainto_tsquery('english', ${params.search})`;
    conditions.push(searchCondition);
  }

  // Fetch posts with author info
  const posts = await db
    .select({
      id: schema.posts.id,
      title: schema.posts.title,
      slug: schema.posts.slug,
      excerpt: schema.posts.excerpt,
      coverImage: schema.posts.coverImage,
      coverImageThumb: schema.posts.coverImageThumb,
      status: schema.posts.status,
      views: schema.posts.views,
      likesCount: schema.posts.likesCount,
      publishedAt: schema.posts.publishedAt,
      createdAt: schema.posts.createdAt,
      updatedAt: schema.posts.updatedAt,
      author: {
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        image: schema.users.image,
      },
    })
    .from(schema.posts)
    .innerJoin(schema.users, eq(schema.posts.userId, schema.users.id))
    .where(and(...conditions))
    .orderBy(desc(schema.posts.publishedAt), desc(schema.posts.createdAt))
    .limit(params.limit)
    .offset(offset);

  // Get total count for pagination
  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(schema.posts)
    .where(and(...conditions));

  // Fetch real-time view counts from Redis
  const postsWithRealTimeViews = await Promise.all(
    posts.map(async (post) => {
      const redisKey = `post:${post.id}:views`;
      let viewCount = await getCounter(redisKey);

      // If Redis doesn't have the counter, initialize it from the database value
      if (viewCount === 0 && post.views > 0) {
        await setCounter(redisKey, post.views);
        viewCount = post.views;
      }

      return {
        ...post,
        views: viewCount,
      };
    })
  );

  const result = {
    posts: postsWithRealTimeViews,
    pagination: {
      page: params.page,
      limit: params.limit,
      total: count,
      totalPages: Math.ceil(count / params.limit),
    },
  };

  // Cache for 1 minute (shorter TTL since we have real-time views)
  await setCache(cacheKey, result, { ttl: 60 });

  log.debug(`Posts list fetched: ${posts.length} posts with real-time views`);

  return rewriteImageUrlsInObject(result);
});
