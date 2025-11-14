export default defineEventHandler(async (event) => {
  try {
    // Let other handlers run
    await Promise.resolve();
  } catch (error: unknown) {
    // Type guard for Error objects
    const err = error as Error & { statusCode?: number; status?: number };
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';

    console.error('[Error Handler]', {
      statusCode,
      message,
      stack: err.stack,
      path: event.path,
      method: event.method,
    });

    return {
      statusCode,
      message,
      error: process.env.NODE_ENV === 'development' ? {
        stack: err.stack,
        details: err,
      } : undefined,
      timestamp: new Date().toISOString(),
      path: event.path,
    };
  }
});
