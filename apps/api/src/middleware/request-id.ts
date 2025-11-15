import { ulid } from 'ulidx';
import { defineEventHandler } from 'h3';

/**
 * Request ID middleware
 *
 * Generates or extracts correlation IDs for request tracing
 * Sets X-Request-ID header on both request and response
 *
 * Priority order:
 * 1. X-Request-ID header (from client/load balancer)
 * 2. X-Correlation-ID header (alternative header)
 * 3. Generate new ULID
 */
export default defineEventHandler((event) => {
  const existingId =
    event.node.req.headers['x-request-id'] ||
    event.node.req.headers['x-correlation-id'];

  const requestId = (Array.isArray(existingId) ? existingId[0] : existingId) || ulid();

  // Store in event context for use in handlers
  event.context.requestId = requestId;

  // Set response header for client tracing
  event.node.res.setHeader('X-Request-ID', requestId);
});
