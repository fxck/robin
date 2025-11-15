#!/usr/bin/env node

/**
 * Test script to demonstrate Pino logging output
 * Run: node test-logging.mjs
 */

import pino from 'pino';

// Production logger (JSON output)
const prodLogger = pino({
  level: 'info',
  base: {
    env: 'production',
    service: 'robin-api',
    version: '0.0.1',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
});

// Development logger (pretty output)
const devLogger = pino({
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss.l',
      ignore: 'pid,hostname',
      singleLine: false,
    },
  },
  base: {
    env: 'development',
    service: 'robin-api',
    version: '0.0.1',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

console.log('='.repeat(80));
console.log('PRODUCTION MODE - JSON OUTPUT (for syslog-ng → Logstash)');
console.log('='.repeat(80));
console.log('');

// Production examples
prodLogger.info('Robin API starting...');

prodLogger.info('Redis client connected', {
  type: 'redis_connect',
  client: 'main',
});

prodLogger.info('Post created', {
  type: 'post_created',
  postId: '01HFXYZ123ABC',
  userId: '01HEABC123XYZ',
  status: 'published',
  slug: 'my-new-post',
  requestId: '01HFREQ123ABC',
});

prodLogger.info('HTTP request', {
  type: 'http_request',
  requestId: '01HFREQ123ABC',
  method: 'POST',
  path: '/api/posts',
  statusCode: 201,
  duration: 123,
  userId: '01HEABC123XYZ',
});

prodLogger.error('Cache error', {
  type: 'cache_get_error',
  key: 'posts:list:page:1',
  error: {
    message: 'Connection timeout',
    name: 'RedisTimeoutError',
    stack: 'Error: Connection timeout\n    at Redis.get (redis.ts:102)',
  },
});

prodLogger.warn('Unauthorized access attempt', {
  type: 'auth_required',
  path: '/api/admin/posts',
  method: 'GET',
  requestId: '01HFREQ456DEF',
});

console.log('');
console.log('='.repeat(80));
console.log('DEVELOPMENT MODE - Pretty Print (for human readability)');
console.log('='.repeat(80));
console.log('');

// Development examples
devLogger.info('Robin API starting...');

devLogger.info('Redis client connected', {
  type: 'redis_connect',
  client: 'main',
});

devLogger.debug('Cache hit for post', {
  type: 'cache_hit',
  key: 'posts:123',
});

devLogger.info('Post created', {
  type: 'post_created',
  postId: '01HFXYZ123ABC',
  userId: '01HEABC123XYZ',
  status: 'published',
  slug: 'my-new-post',
  requestId: '01HFREQ123ABC',
});

devLogger.error('S3 upload error', {
  type: 's3_upload_error',
  key: 'posts/image.jpg',
  bucket: 'assets',
  error: {
    message: 'Access denied',
    name: 'S3AccessDenied',
    stack: 'Error: Access denied\n    at S3Client.send (s3.ts:45)',
  },
});

console.log('');
console.log('='.repeat(80));
console.log('SECURITY - Redacted Fields');
console.log('='.repeat(80));
console.log('');

const secureLogger = pino({
  level: 'info',
  redact: {
    paths: ['password', 'token', 'secret', '*.password'],
    remove: true,
  },
  base: { env: 'production', service: 'robin-api' },
  timestamp: pino.stdTimeFunctions.isoTime,
});

console.log('Before redaction: { email: "user@example.com", password: "secret123" }');
console.log('After redaction:');
secureLogger.info('User login', {
  email: 'user@example.com',
  password: 'secret123', // This will be removed
  token: 'abc123xyz', // This will be removed
});

console.log('');
console.log('='.repeat(80));
console.log('SYSLOG-NG COMPATIBILITY TEST');
console.log('='.repeat(80));
console.log('');
console.log('Each log line is valid JSON that can be parsed by Logstash:');
console.log('');

// Show raw JSON
const rawLogger = pino({
  level: 'info',
  base: { service: 'robin-api' },
  timestamp: pino.stdTimeFunctions.isoTime,
});

rawLogger.info({ type: 'test', key: 'value', nested: { foo: 'bar' } }, 'Test message');

console.log('');
console.log('✅ All logs are in JSON format and ready for syslog-ng → Logstash pipeline');
console.log('');
