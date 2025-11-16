import { defineEventHandler, getRouterParam, createError } from 'h3';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../../../services/db';
import { schema } from '@robin/database';
import { getCache, setCache, incrementCounter, getCounter } from '../../../services/redis';
import { log } from '../../../utils/logger';
import { rewriteImageUrlsInObject } from '../../../utils/cdn';
import { optionalAuth } from '../../../utils/auth-guard';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Post ID is required',
    });
  }

  // Check if user is authenticated (optional)
  const user = await optionalAuth(event);

  // Try to get from cache
  const cacheKey = `post:${id}`;
  const cached = await getCache<any>(cacheKey);

  if (cached) {
    // Still increment view count and get the updated value
    await incrementCounter(`post:${id}:views`);
    const currentViews = await getCounter(`post:${id}:views`);

    // Check if current user has liked this post
    let isLiked = false;
    if (user) {
      const [like] = await db
        .select({ id: schema.postLikes.id })
        .from(schema.postLikes)
        .where(and(eq(schema.postLikes.postId, id), eq(schema.postLikes.userId, user.id)))
        .limit(1);
      isLiked = !!like;
    }

    log.debug(`Cache hit for post: ${id}`);

    // Return cached post with real-time view count from Redis and CDN URLs
    return rewriteImageUrlsInObject({
      ...cached,
      post: {
        ...cached.post,
        views: currentViews,
        isLiked,
      }
    });
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

  // Increment view counter in Redis and get the updated count
  const currentViews = await incrementCounter(`post:${id}:views`);

  // Check if current user has liked this post
  let isLiked = false;
  if (user) {
    const [like] = await db
      .select({ id: schema.postLikes.id })
      .from(schema.postLikes)
      .where(and(eq(schema.postLikes.postId, id), eq(schema.postLikes.userId, user.id)))
      .limit(1);
    isLiked = !!like;
  }

  // Return post with real-time view count from Redis
  const result = {
    post: {
      ...post,
      views: currentViews,
      isLiked,
    }
  };

  // Cache for 15 minutes (note: views will be updated from Redis on cache hits)
  await setCache(cacheKey, result, { ttl: 900 });

  log.debug(`Post fetched: ${id}`);

  return rewriteImageUrlsInObject(result);
});
