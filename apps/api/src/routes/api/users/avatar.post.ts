import { requireAuth } from '~/utils/auth-guard';
import { uploadFile, validateImageFile, validateFileSize } from '~/services/s3';
import { checkRateLimit } from '~/services/redis';
import { db } from '~/services/db';
import { schema } from '@robin/database';
import { eq } from 'drizzle-orm';
import { log } from '~/utils/logger';
import { rewriteImageUrlsInObject } from '~/utils/cdn';

export default defineEventHandler(async (event) => {
  // Require authentication
  const user = await requireAuth(event);

  // Rate limiting: 10 avatar uploads per hour per user
  const rateLimitKey = `rate-limit:avatar:${user.id}`;
  const rateLimit = await checkRateLimit(rateLimitKey, 10, 3600);

  if (!rateLimit.allowed) {
    throw createError({
      statusCode: 429,
      message: `Avatar upload rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000 / 60)} minutes.`,
    });
  }

  // Parse multipart form data
  const formData = await readMultipartFormData(event);

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'No file uploaded',
    });
  }

  const file = formData[0];

  if (!file || !file.data) {
    throw createError({
      statusCode: 400,
      message: 'Invalid file data',
    });
  }

  // Validate file type
  const contentType = file.type || 'application/octet-stream';
  if (!validateImageFile(contentType)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
    });
  }

  // Validate file size (5 MB max for avatars)
  if (!validateFileSize(file.data.length, 5)) {
    throw createError({
      statusCode: 400,
      message: 'File size exceeds 5 MB limit',
    });
  }

  try {
    // Upload to S3 in avatars folder
    const url = await uploadFile({
      buffer: file.data,
      contentType,
      folder: 'avatars',
    });

    // Update user's avatar in database
    const [updatedUser] = await db
      .update(schema.users)
      .set({
        image: url,
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

    log.info(`Avatar uploaded by user ${user.id}: ${url}`);

    return rewriteImageUrlsInObject({
      url,
      user: updatedUser,
    });
  } catch (error) {
    log.error('Avatar upload error:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to upload avatar',
    });
  }
});
