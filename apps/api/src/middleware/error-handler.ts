import { log } from '../utils/logger';

export default defineEventHandler(async (event) => {
  try {
    // Let other handlers run
    await Promise.resolve();
  } catch (error: unknown) {
    // Type guard for Error objects
    const err = error as Error & { statusCode?: number; status?: number };
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';

    // Use request-scoped logger if available, otherwise use global logger
    const requestLogger = event.context.logger || log;

    // Log error with structured fields for Logstash
    if (typeof requestLogger.error === 'function') {
      requestLogger.error('Request error', {
        type: 'unhandled_error',
        statusCode,
        error: {
          message: err.message,
          name: err.name,
          stack: err.stack,
        },
        path: event.path,
        method: event.method,
        requestId: event.context.requestId,
        userId: event.context.session?.user?.id,
      });
    }

    return {
      statusCode,
      message,
      error: process.env.NODE_ENV === 'development' ? {
        stack: err.stack,
        details: err,
      } : undefined,
      timestamp: new Date().toISOString(),
      path: event.path,
      requestId: event.context.requestId,
    };
  }
});
