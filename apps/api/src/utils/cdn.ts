/**
 * CDN utilities for rewriting storage URLs to use CDN endpoints
 */

/**
 * Rewrite a storage URL to use the CDN host
 *
 * Example:
 * Input: https://storage-prg1.zerops.io/bucket/path/file.jpg
 * Output: https://storage.cdn.zerops.app/bucket/path/file.jpg
 */
export function rewriteUrlToCdn(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  const config = useRuntimeConfig();
  const cdnHost = config.cdnHost;

  // If no CDN host configured, return original URL
  if (!cdnHost) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    const cdnUrl = new URL(cdnHost);
    const s3Endpoint = config.s3Endpoint;

    // Only rewrite URLs that match our S3 storage endpoint
    if (s3Endpoint && !url.startsWith(s3Endpoint)) {
      return url;
    }

    // Replace the storage host with CDN host, keep path and query params
    urlObj.host = cdnUrl.host;
    urlObj.protocol = cdnUrl.protocol;

    return urlObj.toString();
  } catch {
    // If URL parsing fails, return original URL
    return url;
  }
}

/**
 * Rewrite multiple storage URLs to use the CDN host
 */
export function rewriteUrlsToCdn(urls: (string | null | undefined)[]): (string | null)[] {
  return urls.map((url) => rewriteUrlToCdn(url));
}

/**
 * Fields that typically contain image URLs and should be rewritten
 */
const IMAGE_URL_FIELDS = ['coverImage', 'coverImageThumb', 'image', 'avatar', 'avatarUrl'];

/**
 * Recursively rewrite all image URLs in an object to use CDN
 * This handles nested objects and arrays
 */
export function rewriteImageUrlsInObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => rewriteImageUrlsInObject(item)) as T;
  }

  // Handle objects
  if (typeof obj === 'object') {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // If this field is an image URL field and contains a string, rewrite it
      if (IMAGE_URL_FIELDS.includes(key) && typeof value === 'string') {
        result[key] = rewriteUrlToCdn(value);
      }
      // Date objects should pass through unchanged
      else if (value instanceof Date) {
        result[key] = value;
      }
      // Recursively process nested objects/arrays (but not Dates)
      else if (typeof value === 'object' && value !== null) {
        result[key] = rewriteImageUrlsInObject(value);
      }
      // Primitive values pass through unchanged
      else {
        result[key] = value;
      }
    }
    return result as T;
  }

  // Primitive values
  return obj;
}
