import { defineEventHandler } from 'h3';
import { logger } from '../utils/logger';

/**
 * HTTP request/response logging middleware
 *
 * Logs all HTTP requests with:
 * - Request ID for correlation
 * - Method, path, query params
 * - Response status code
 * - Response time in milliseconds
 * - User ID (if authenticated)
 *
 * Integrates with syslog-ng → Logstash for centralized logging
 */
export default defineEventHandler(async (event) => {
  const startTime = Date.now();
  const method = event.method;
  const path = event.path;
  const requestId = event.context.requestId;

  // Create request-scoped logger with correlation ID
  const requestLogger = logger.child({
    requestId,
    method,
    path,
  });

  // Store logger in context for use in route handlers
  event.context.logger = requestLogger;

  try {
    // Wait for response
    await Promise.resolve();

    const duration = Date.now() - startTime;
    const statusCode = event.node.res.statusCode;
    const userId = event.context.session?.user?.id;

    // Log successful requests at info level
    requestLogger.info({
      type: 'http_request',
      statusCode,
      duration,
      userId,
      query: event.node.req.url?.split('?')[1] || undefined,
    }, `${method} ${path} ${statusCode} ${duration}ms`);

  } catch (error) {
    const duration = Date.now() - startTime;
    const err = error as Error & { statusCode?: number };
    const statusCode = err.statusCode || 500;

    // Log errors at error level
    requestLogger.error({
      type: 'http_error',
      statusCode,
      duration,
      error: {
        message: err.message,
        stack: err.stack,
        name: err.name,
      },
    }, `${method} ${path} ${statusCode} ${duration}ms - ${err.message}`);

    throw error;
  }
});
