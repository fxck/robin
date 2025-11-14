import { defineEventHandler, getQuery } from 'h3';
import { z } from 'zod';
import { inArray, isNull, and, eq } from 'drizzle-orm';
import { db } from '../../../services/db';
import { schema } from '@robin/database';
import { getTopFromSortedSet } from '../../../services/redis';
import { log } from '../../../utils/logger';

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const params = querySchema.parse(query);

  // Get trending post IDs from Redis sorted set
  const trendingIds = await getTopFromSortedSet('trending:posts', params.limit);

  if (trendingIds.length === 0) {
    return {
      posts: [],
    };
  }

  // Fetch posts from database
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
      author: {
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        image: schema.users.image,
      },
    })
    .from(schema.posts)
    .innerJoin(schema.users, eq(schema.posts.userId, schema.users.id))
    .where(and(inArray(schema.posts.id, trendingIds as string[]), isNull(schema.posts.deletedAt)))
    .limit(params.limit);

  // Sort posts by original trending order
  const postsMap = new Map(posts.map((p) => [p.id, p]));
  const sortedPosts = trendingIds.map((id) => postsMap.get(id as string)).filter(Boolean);

  log.debug(`Trending posts fetched: ${sortedPosts.length} posts`);

  return {
    posts: sortedPosts,
  };
});
