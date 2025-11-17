import { defineEventHandler, readBody, createError } from 'h3';
import { z } from 'zod';
import { ulid } from 'ulidx';
import { sql, eq, and } from 'drizzle-orm';
import { db } from '../../../services/db';
import { schema } from '@robin/database';
import { requireAuth } from '../../../utils/auth-guard';
import { checkRateLimit, deleteCache, publish } from '../../../services/redis';
import { log } from '../../../utils/logger';
import { generateExcerpt } from '../../../utils/markdown';

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(50000).default(''),
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

  // Generate unique slug from title
  const baseSlug = generateSlug(data.title);
  const slug = await generateUniqueSlug(user.id, baseSlug);

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
      publishedAt: data.status === 'published' ? sql`now()` : null,
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

/**
 * Generate a unique slug for a user by appending a counter if needed
 */
async function generateUniqueSlug(userId: string, baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  // Check if slug exists for this user
  while (true) {
    const existing = await db
      .select({ id: schema.posts.id })
      .from(schema.posts)
      .where(and(eq(schema.posts.userId, userId), eq(schema.posts.slug, slug)))
      .limit(1);

    if (existing.length === 0) {
      return slug;
    }

    // Append counter and try again
    slug = `${baseSlug}-${counter}`;
    counter++;

    // Safety limit to prevent infinite loops
    if (counter > 100) {
      throw createError({
        statusCode: 500,
        message: 'Unable to generate unique slug',
      });
    }
  }
}
