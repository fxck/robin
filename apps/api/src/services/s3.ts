import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { ulid } from 'ulidx';
import { log } from '../utils/logger';

let s3Client: S3Client | null = null;

/**
 * Get S3 client instance (singleton)
 */
export function getS3Client(): S3Client {
  if (!s3Client) {
    const config = useRuntimeConfig();
    s3Client = new S3Client({
      endpoint: config.s3Endpoint,
      region: config.s3Region || 'us-east-1',
      credentials: {
        accessKeyId: config.s3AccessKeyId || '',
        secretAccessKey: config.s3SecretAccessKey || '',
      },
      forcePathStyle: true, // Required for Minio
    });

    log.info('S3 client initialized', {
      type: 's3_init',
      region: config.s3Region || 'us-east-1',
      bucket: config.s3Bucket || 'assets'
    });
  }

  return s3Client;
}

/**
 * Upload file to S3
 */
export interface UploadOptions {
  buffer: Buffer;
  contentType: string;
  folder?: string;
  filename?: string;
}

export async function uploadFile(options: UploadOptions): Promise<string> {
  const config = useRuntimeConfig();
  const client = getS3Client();
  const bucket = config.s3Bucket || 'assets';
  const filename = options.filename || `${ulid()}.${getExtensionFromMimeType(options.contentType)}`;
  const key = options.folder ? `${options.folder}/${filename}` : filename;

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: options.buffer,
        ContentType: options.contentType,
      })
    );

    // Return storage URL (will be rewritten to CDN on read)
    const endpoint = config.s3Endpoint || '';
    const storageUrl = `${endpoint}/${bucket}/${key}`;

    log.info('File uploaded to S3', {
      type: 's3_upload',
      key,
      bucket,
      contentType: options.contentType,
      size: options.buffer.length,
      url: storageUrl
    });
    return storageUrl;
  } catch (error) {
    log.error('S3 upload error', {
      type: 's3_upload_error',
      key,
      bucket,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error
    });
    throw new Error('Failed to upload file to S3');
  }
}

/**
 * Delete file from S3
 */
export async function deleteFile(url: string): Promise<void> {
  const client = getS3Client();
  const config = useRuntimeConfig();
  const bucket = config.s3Bucket || 'assets';

  try {
    // Extract key from URL
    const key = extractKeyFromUrl(url);
    if (!key) {
      log.warn('Could not extract key from URL', {
        type: 's3_delete_invalid_url',
        url
      });
      return;
    }

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    log.info('File deleted from S3', {
      type: 's3_delete',
      key,
      bucket
    });
  } catch (error) {
    log.error('S3 delete error', {
      type: 's3_delete_error',
      url,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error
    });
    // Don't throw - deletion failures shouldn't break the app
  }
}

/**
 * Delete multiple files from S3
 */
export async function deleteFiles(urls: string[]): Promise<void> {
  await Promise.all(urls.map((url) => deleteFile(url)));
}

/**
 * Extract S3 key from public URL
 */
function extractKeyFromUrl(url: string): string | null {
  try {
    const config = useRuntimeConfig();
  const bucket = config.s3Bucket || 'assets';
    const parts = url.split(`/${bucket}/`);
    return parts.length > 1 ? parts[1] : null;
  } catch {
    return null;
  }
}

/**
 * Get file extension from MIME type
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
  };

  return mimeMap[mimeType] || 'bin';
}

/**
 * Validate file type for images
 */
export function validateImageFile(mimeType: string): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(mimeType);
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, maxSizeMB = 10): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return size <= maxBytes;
}

/**
 * Check S3 health
 */
export async function checkS3Health(): Promise<boolean> {
  try {
    const client = getS3Client();
    const config = useRuntimeConfig();
  const bucket = config.s3Bucket || 'assets';

    // Try to list objects (limit 1 for efficiency)
    await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: '.health-check', // Dummy key that doesn't need to exist
      })
    );

    return true;
  } catch (error: any) {
    // NoSuchKey error is actually good - means we can connect
    if (error.name === 'NoSuchKey') {
      return true;
    }
    log.error('S3 health check failed:', error);
    return false;
  }
}
