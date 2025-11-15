import pino from 'pino';

/**
 * Production-grade structured logger using Pino
 *
 * Features:
 * - JSON output for Logstash/syslog-ng integration
 * - Structured fields for filtering and aggregation
 * - Request correlation IDs
 * - Performance optimized (async logging)
 * - Pretty printing in development
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  // Production: JSON to stdout (captured by syslog-ng → Logstash)
  // Development: Pretty print for human readability
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss.l',
      ignore: 'pid,hostname',
      singleLine: false,
    },
  } : undefined,

  // Base fields included in every log
  base: {
    env: process.env.NODE_ENV || 'development',
    service: 'robin-api',
    version: process.env.npm_package_version || '0.0.1',
  },

  // Timestamp in ISO format (required for Logstash)
  timestamp: pino.stdTimeFunctions.isoTime,

  // Format errors properly
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      pid: bindings.pid,
      hostname: bindings.hostname,
    }),
  },

  // Redact sensitive fields
  redact: {
    paths: [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
      'cookie',
      'secret',
      '*.password',
      '*.token',
      '*.secret',
    ],
    remove: true,
  },
});

/**
 * Convenience wrapper with structured logging support
 *
 * Usage:
 *   log.info('User created', { userId: '123', email: 'user@example.com' })
 *   log.error('DB error', { error, userId: '123' })
 */
export const log = {
  /**
   * Log informational message with optional structured fields
   */
  info: (message: string, fields?: Record<string, unknown>) => {
    if (fields) {
      logger.info(fields, message);
    } else {
      logger.info(message);
    }
  },

  /**
   * Log error with optional error object and structured fields
   */
  error: (message: string, fields?: Record<string, unknown>) => {
    if (fields) {
      logger.error(fields, message);
    } else {
      logger.error(message);
    }
  },

  /**
   * Log warning with optional structured fields
   */
  warn: (message: string, fields?: Record<string, unknown>) => {
    if (fields) {
      logger.warn(fields, message);
    } else {
      logger.warn(message);
    }
  },

  /**
   * Log debug message with optional structured fields
   */
  debug: (message: string, fields?: Record<string, unknown>) => {
    if (fields) {
      logger.debug(fields, message);
    } else {
      logger.debug(message);
    }
  },

  /**
   * Create child logger with persistent context
   * Useful for adding request-scoped fields
   */
  child: (fields: Record<string, unknown>) => logger.child(fields),
};
