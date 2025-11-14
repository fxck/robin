import { defineEventHandler, getRouterParam, createError } from 'h3';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../../../services/db';
import { schema } from '@robin/database';
import { getCache, setCache, incrementCounter } from '../../../services/redis';
import { log } from '../../../utils/logger';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Post ID is required',
    });
  }

  // Try to get from cache
  const cacheKey = `post:${id}`;
  const cached = await getCache<any>(cacheKey);

  if (cached) {
    // Still increment view count
    await incrementCounter(`post:${id}:views`);
    log.debug(`Cache hit for post: ${id}`);
    return cached;
  }

  // Fetch post with author info
  const [post] = await db
    .select({
      id: schema.posts.id,
      userId: schema.posts.userId,
      title: schema.posts.title,
      slug: schema.posts.slug,
      content: schema.posts.content,
      excerpt: schema.posts.excerpt,
      coverImage: schema.posts.coverImage,
      coverImageThumb: schema.posts.coverImageThumb,
      status: schema.posts.status,
      views: schema.posts.views,
      likesCount: schema.posts.likesCount,
      publishedAt: schema.posts.publishedAt,
      createdAt: schema.posts.createdAt,
      updatedAt: schema.posts.updatedAt,
      version: schema.posts.version,
      author: {
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        image: schema.users.image,
      },
    })
    .from(schema.posts)
    .innerJoin(schema.users, eq(schema.posts.userId, schema.users.id))
    .where(and(eq(schema.posts.id, id), isNull(schema.posts.deletedAt)))
    .limit(1);

  if (!post) {
    throw createError({
      statusCode: 404,
      message: 'Post not found',
    });
  }

  // Increment view counter in Redis
  await incrementCounter(`post:${id}:views`);

  const result = { post };

  // Cache for 15 minutes
  await setCache(cacheKey, result, { ttl: 900 });

  log.debug(`Post fetched: ${id}`);

  return result;
});
