import { defineEventHandler, getRouterParam, readBody, createError } from 'h3';
import { z } from 'zod';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../../../services/db';
import { schema } from '@robin/database';
import { requireAuth } from '../../../utils/auth-guard';
import { deleteCache, publish } from '../../../services/redis';
import { log } from '../../../utils/logger';

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(50000).optional(),
  coverImage: z.string().url().optional(),
  status: z.enum(['draft', 'published']).optional(),
  version: z.number().int(), // For optimistic locking
});

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

  // Parse and validate body
  const body = await readBody(event);
  const data = updatePostSchema.parse(body);

  // Fetch post to check ownership and version
  const [existingPost] = await db
    .select()
    .from(schema.posts)
    .where(and(eq(schema.posts.id, id), isNull(schema.posts.deletedAt)))
    .limit(1);

  if (!existingPost) {
    throw createError({
      statusCode: 404,
      message: 'Post not found',
    });
  }

  // Check ownership
  if (existingPost.userId !== user.id) {
    throw createError({
      statusCode: 403,
      message: 'You do not have permission to edit this post',
    });
  }

  // Optimistic locking check
  if (existingPost.version !== data.version) {
    throw createError({
      statusCode: 409,
      message: 'Post has been modified by another process. Please refresh and try again.',
    });
  }

  // Prepare update data
  const updateData: any = {
    version: existingPost.version + 1,
    updatedAt: new Date(),
  };

  if (data.title !== undefined) {
    updateData.title = data.title;
    // Regenerate slug if title changed
    updateData.slug = generateSlug(data.title);
  }

  if (data.content !== undefined) {
    updateData.content = data.content;
    updateData.excerpt = data.content.substring(0, 200).trim() + (data.content.length > 200 ? '...' : '');
  }

  if (data.coverImage !== undefined) {
    updateData.coverImage = data.coverImage;
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
    // Set publishedAt when publishing for first time
    if (data.status === 'published' && !existingPost.publishedAt) {
      updateData.publishedAt = new Date();
    }
  }

  // Update post
  const [updatedPost] = await db
    .update(schema.posts)
    .set(updateData)
    .where(eq(schema.posts.id, id))
    .returning();

  // Invalidate cache
  await deleteCache(`post:${id}`);
  await deleteCache('posts:list:*');
  await deleteCache(`posts:user:${user.id}:*`);

  // Publish real-time update
  await publish('posts:updated', {
    id: updatedPost.id,
    title: updatedPost.title,
    slug: updatedPost.slug,
    userId: user.id,
    updatedAt: updatedPost.updatedAt,
  });

  log.info(`Post updated: ${id} by user ${user.id}`);

  return {
    post: {
      ...updatedPost,
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    },
  };
});

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}
