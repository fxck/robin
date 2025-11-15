import { z } from 'zod';
import { requireAuth } from '~/utils/auth-guard';
import { db } from '~/services/db';
import { schema } from '@robin/database';
import { eq } from 'drizzle-orm';
import { log } from '~/utils/logger';

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().nullable().optional(),
});

export default defineEventHandler(async (event) => {
  // Require authentication
  const user = await requireAuth(event);

  // Validate request body
  const body = await readBody(event);
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid request body',
      data: parsed.error.errors,
    });
  }

  const updates = parsed.data;

  // Check if there are any updates
  if (Object.keys(updates).length === 0) {
    throw createError({
      statusCode: 400,
      message: 'No updates provided',
    });
  }

  try {
    // Update user profile
    const [updatedUser] = await db
      .update(schema.users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, user.id))
      .returning({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        image: schema.users.image,
        emailVerified: schema.users.emailVerified,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
      });

    log.info(`User ${user.id} updated profile`, {
      updates: Object.keys(updates),
      requestId: event.context.requestId,
    });

    return updatedUser;
  } catch (error) {
    log.error('Failed to update user profile', {
      error,
      userId: user.id,
      requestId: event.context.requestId,
    });

    throw createError({
      statusCode: 500,
      message: 'Failed to update profile',
    });
  }
});
