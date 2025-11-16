import { defineEventHandler, readBody, createError } from 'h3';
import { z } from 'zod';
import { ulid } from 'ulidx';
import { db } from '../../../services/db';
import { schema } from '@robin/database';
import { requireAuth } from '../../../utils/auth-guard';
import { checkRateLimit, deleteCache, publish } from '../../../services/redis';
import { log } from '../../../utils/logger';
import { generateExcerpt } from '../../../utils/markdown';

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(50000),
  coverImage: z.string().url().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
});

export default defineEventHandler(async (event) => {
  // Require authentication
  const user = await requireAuth(event);

  // Rate limiting: 10 posts per hour per user
  const rateLimitKey = `rate-limit:posts:create:${user.id}`;
  const rateLimit = await checkRateLimit(rateLimitKey, 10, 3600);

  if (!rateLimit.allowed) {
    throw createError({
      statusCode: 429,
      message: `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000 / 60)} minutes.`,
    });
  }

  // Parse and validate body
  const body = await readBody(event);
  const data = createPostSchema.parse(body);

  // Generate slug from title
  const slug = generateSlug(data.title);

  // Create post
  const postId = ulid();

  const excerpt = generateExcerpt(data.content, 200);

  const [post] = await db
    .insert(schema.posts)
    .values({
      id: postId,
      userId: user.id,
      title: data.title,
      slug,
      content: data.content,
      excerpt,
      coverImage: data.coverImage,
      status: data.status,
      publishedAt: data.status === 'published' ? new Date() : null,
    })
    .returning();

  // Invalidate cache
  await deleteCache('posts:list:*');
  await deleteCache(`posts:user:${user.id}:*`);

  // Publish real-time update if published
  if (data.status === 'published') {
    await publish('posts:new', {
      id: post.id,
      title: post.title,
      slug: post.slug,
      userId: user.id,
      createdAt: post.createdAt,
    });
  }

  log.info('Post created', {
    type: 'post_created',
    postId,
    userId: user.id,
    status: data.status,
    slug,
    requestId: event.context.requestId
  });

  return {
    post: {
      ...post,
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
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 100); // Limit length
}
