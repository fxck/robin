import { defineEventHandler, readMultipartFormData, createError } from 'h3';
import { requireAuth } from '../../utils/auth-guard';
import { uploadFile, validateImageFile, validateFileSize } from '../../services/s3';
import { checkRateLimit } from '../../services/redis';
import { log } from '../../utils/logger';

export default defineEventHandler(async (event) => {
  // Require authentication
  const user = await requireAuth(event);

  // Rate limiting: 20 uploads per hour per user
  const rateLimitKey = `rate-limit:upload:${user.id}`;
  const rateLimit = await checkRateLimit(rateLimitKey, 20, 3600);

  if (!rateLimit.allowed) {
    throw createError({
      statusCode: 429,
      message: `Upload rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetAt - Date.now()) / 1000 / 60)} minutes.`,
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

  // Validate file size (10 MB max)
  if (!validateFileSize(file.data.length, 10)) {
    throw createError({
      statusCode: 400,
      message: 'File size exceeds 10 MB limit',
    });
  }

  try {
    // Upload to S3
    const url = await uploadFile({
      buffer: file.data,
      contentType,
      folder: 'posts/covers',
    });

    log.info(`File uploaded by user ${user.id}: ${url}`);

    return {
      url,
      contentType,
      size: file.data.length,
    };
  } catch (error) {
    log.error('Upload error:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to upload file',
    });
  }
});
