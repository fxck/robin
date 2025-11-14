import { consola } from 'consola';

// Create structured logger instance
export const logger = consola.create({
  level: process.env.NODE_ENV === 'production' ? 3 : 4,
  formatOptions: {
    date: true,
    colors: true,
    compact: process.env.NODE_ENV === 'production',
  },
});

// Export convenience methods
export const log = {
  info: (message: string, ...args: unknown[]) => logger.info(message, ...args),
  error: (message: string, ...args: unknown[]) => logger.error(message, ...args),
  warn: (message: string, ...args: unknown[]) => logger.warn(message, ...args),
  debug: (message: string, ...args: unknown[]) => logger.debug(message, ...args),
  success: (message: string, ...args: unknown[]) => logger.success(message, ...args),
  start: (message: string, ...args: unknown[]) => logger.start(message, ...args),
  ready: (message: string, ...args: unknown[]) => logger.ready(message, ...args),
};
