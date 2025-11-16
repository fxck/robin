import { defineEventHandler, getRouterParam, createError } from 'h3';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { ulid } from 'ulidx';
import { db } from '../../../../services/db';
import { schema } from '@robin/database';
import { requireAuth } from '../../../../utils/auth-guard';
import { deleteCache, publish, incrementSortedSetScore } from '../../../../services/redis';
import { log } from '../../../../utils/logger';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Post ID is required',
    });
  }

  // Require authentication
  const user = await requireAuth(event);

  // Check if post exists
  const [post] = await db
    .select({ id: schema.posts.id })
    .from(schema.posts)
    .where(and(eq(schema.posts.id, id), isNull(schema.posts.deletedAt)))
    .limit(1);

  if (!post) {
    throw createError({
      statusCode: 404,
      message: 'Post not found',
    });
  }

  // Check if already liked
  const [existingLike] = await db
    .select()
    .from(schema.postLikes)
    .where(and(eq(schema.postLikes.postId, id), eq(schema.postLikes.userId, user.id)))
    .limit(1);

  let liked = false;

  if (existingLike) {
    // Unlike - remove the like
    await db.delete(schema.postLikes).where(eq(schema.postLikes.id, existingLike.id));

    // Decrement likes count
    await db
      .update(schema.posts)
      .set({
        likesCount: sql`${schema.posts.likesCount} - 1`,
        updatedAt: sql`now()`,
      })
      .where(eq(schema.posts.id, id));

    // Decrement trending score
    await incrementSortedSetScore('trending:posts', id, -1);

    log.debug(`Post unliked: ${id} by user ${user.id}`);
  } else {
    // Like - add the like
    await db.insert(schema.postLikes).values({
      id: ulid(),
      postId: id,
      userId: user.id,
    });

    // Increment likes count
    await db
      .update(schema.posts)
      .set({
        likesCount: sql`${schema.posts.likesCount} + 1`,
        updatedAt: sql`now()`,
      })
      .where(eq(schema.posts.id, id));

    // Increment trending score
    await incrementSortedSetScore('trending:posts', id, 1);

    liked = true;
    log.debug(`Post liked: ${id} by user ${user.id}`);
  }

  // Get the updated post to return the current like count
  const [updatedPost] = await db
    .select({ likesCount: schema.posts.likesCount })
    .from(schema.posts)
    .where(eq(schema.posts.id, id))
    .limit(1);

  // Invalidate cache
  await deleteCache(`post:${id}`);
  await deleteCache('posts:list:*');

  // Publish real-time update
  await publish('posts:like', {
    postId: id,
    userId: user.id,
    liked,
    likesCount: updatedPost?.likesCount || 0,
  });

  return {
    liked,
    likesCount: updatedPost?.likesCount || 0,
    message: liked ? 'Post liked' : 'Post unliked',
  };
});
