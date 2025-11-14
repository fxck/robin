import { defineEventHandler, getRouterParam, createError } from 'h3';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../../../services/db';
import { schema } from '@robin/database';
import { requireAuth } from '../../../utils/auth-guard';
import { deleteCache, publish, removeFromSortedSet } from '../../../services/redis';
import { deleteFile } from '../../../services/s3';
import { log } from '../../../utils/logger';

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

  // Fetch post to check ownership
  const [post] = await db
    .select()
    .from(schema.posts)
    .where(and(eq(schema.posts.id, id), isNull(schema.posts.deletedAt)))
    .limit(1);

  if (!post) {
    throw createError({
      statusCode: 404,
      message: 'Post not found',
    });
  }

  // Check ownership
  if (post.userId !== user.id) {
    throw createError({
      statusCode: 403,
      message: 'You do not have permission to delete this post',
    });
  }

  // Soft delete the post
  await db
    .update(schema.posts)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.posts.id, id));

  // Delete cover image from S3 if exists
  if (post.coverImage) {
    await deleteFile(post.coverImage);
  }

  if (post.coverImageThumb) {
    await deleteFile(post.coverImageThumb);
  }

  // Invalidate cache
  await deleteCache(`post:${id}`);
  await deleteCache('posts:list:*');
  await deleteCache(`posts:user:${user.id}:*`);

  // Remove from trending
  await removeFromSortedSet('trending:posts', id);

  // Publish real-time update
  await publish('posts:deleted', {
    id: post.id,
    userId: user.id,
  });

  log.info(`Post deleted: ${id} by user ${user.id}`);

  return {
    success: true,
    message: 'Post deleted successfully',
  };
});
