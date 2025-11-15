# Production Logging Guide

> **Updated:** 2025-11-15
> **Stack:** Pino 9.x • Structured JSON Logging • Syslog-ng → Logstash Integration

---

## Overview

The Robin API uses **Pino** for production-grade structured logging with full syslog-ng → Logstash compatibility.

### Key Features

- ✅ **JSON-first** - Structured logging for Logstash parsing
- ✅ **Request correlation** - Automatic request ID tracking
- ✅ **HTTP logging** - All requests/responses logged with timing
- ✅ **Error tracking** - Structured error logs with stack traces
- ✅ **Security** - Automatic redaction of sensitive fields
- ✅ **Performance** - Async logging, minimal overhead
- ✅ **Syslog compatible** - Works with syslog-ng → Logstash pipeline

---

## Log Format

### Development
Pretty-printed, colorized output for human readability:
```
[10:45:32.123] INFO: Post created
    type: "post_created"
    postId: "01HF..."
    userId: "01HE..."
    requestId: "01HF..."
```

### Production
**JSON format** (one line per log entry) for Logstash ingestion:
```json
{
  "level": "info",
  "time": "2025-11-15T10:45:32.123Z",
  "pid": 1234,
  "hostname": "api-server-1",
  "env": "production",
  "service": "robin-api",
  "version": "0.0.1",
  "type": "post_created",
  "postId": "01HF...",
  "userId": "01HE...",
  "requestId": "01HF...",
  "msg": "Post created"
}
```

---

## Structured Fields

### Standard Fields (every log)
| Field | Description | Example |
|-------|-------------|---------|
| `level` | Log level | `"info"`, `"error"`, `"warn"`, `"debug"` |
| `time` | ISO timestamp | `"2025-11-15T10:45:32.123Z"` |
| `env` | Environment | `"production"`, `"development"` |
| `service` | Service name | `"robin-api"` |
| `version` | API version | `"0.0.1"` |
| `msg` | Human-readable message | `"Post created"` |

### Request Fields (HTTP logs)
| Field | Description | Example |
|-------|-------------|---------|
| `requestId` | Correlation ID | `"01HF..."` (ULID) |
| `method` | HTTP method | `"POST"` |
| `path` | Request path | `"/api/posts"` |
| `statusCode` | Response code | `200` |
| `duration` | Response time (ms) | `123` |
| `userId` | Authenticated user | `"01HE..."` |
| `query` | Query params | `"page=1&limit=20"` |

### Event-Specific Fields
Each event type includes relevant contextual fields:

**Post created:**
```json
{
  "type": "post_created",
  "postId": "01HF...",
  "userId": "01HE...",
  "status": "published",
  "slug": "my-new-post"
}
```

**Cache error:**
```json
{
  "type": "cache_get_error",
  "key": "posts:list:page:1",
  "error": {
    "message": "Connection timeout",
    "stack": "..."
  }
}
```

**S3 upload:**
```json
{
  "type": "s3_upload",
  "key": "posts/01HF...jpg",
  "bucket": "assets",
  "contentType": "image/jpeg",
  "size": 123456
}
```

---

## Log Levels

| Level | Use Case | Production? |
|-------|----------|-------------|
| `error` | Errors that need attention | ✅ Yes |
| `warn` | Warnings, degraded state | ✅ Yes |
| `info` | Important events | ✅ Yes |
| `debug` | Detailed debugging | ❌ No (dev only) |

**Configuration:**
- Development: `debug` level (all logs)
- Production: `info` level (excludes debug)
- Override: Set `LOG_LEVEL=debug` in production if needed

---

## Usage Examples

### Basic Logging
```typescript
import { log } from '~/utils/logger';

// Simple message
log.info('Server started');

// With structured fields
log.info('Post created', {
  type: 'post_created',
  postId: '01HF...',
  userId: '01HE...'
});

// Error with stack trace
log.error('Database error', {
  type: 'db_error',
  error: err instanceof Error ? {
    message: err.message,
    stack: err.stack
  } : err
});
```

### Request-Scoped Logging
```typescript
export default defineEventHandler(async (event) => {
  // Get request-scoped logger (includes requestId automatically)
  const logger = event.context.logger;

  logger.info('Processing request', {
    userId: event.context.session?.user?.id
  });
});
```

### Child Loggers
```typescript
// Create logger with persistent context
const userLogger = log.child({ userId: '01HE...', role: 'admin' });

userLogger.info('Action performed', { action: 'delete_post' });
// Output includes userId and role in every log
```

---

## Event Types

### HTTP Events
- `http_request` - Successful request/response
- `http_error` - Request error
- `unhandled_error` - Unhandled exception

### Auth Events
- `auth_required` - Unauthorized access attempt
- `user_authenticated` - Successful authentication

### Database Events
- `post_created` - Post created
- `post_updated` - Post updated
- `post_deleted` - Post deleted
- `post_liked` - Post liked/unliked

### Cache Events
- `cache_get_error` - Cache read error
- `cache_set_error` - Cache write error
- `cache_delete_error` - Cache delete error

### Redis Events
- `redis_connect` - Redis connection established
- `redis_ready` - Redis client ready
- `redis_error` - Redis client error
- `redis_close` - Redis connections closed

### S3 Events
- `s3_init` - S3 client initialized
- `s3_upload` - File uploaded
- `s3_upload_error` - Upload failed
- `s3_delete` - File deleted
- `s3_delete_error` - Delete failed
- `s3_delete_invalid_url` - Invalid URL format

---

## Security & Redaction

Sensitive fields are **automatically redacted** from logs:

**Redacted fields:**
- `password`
- `token`, `accessToken`, `refreshToken`
- `authorization`
- `cookie`
- `secret`
- Any nested field matching these patterns (`user.password`, etc.)

**Example:**
```typescript
log.info('User login', {
  email: 'user@example.com',
  password: 'secret123' // ❌ Automatically removed
});

// Output:
{
  "msg": "User login",
  "email": "user@example.com"
  // password field removed
}
```

---

## Syslog-ng → Logstash Integration

### How It Works

1. **Pino** writes JSON logs to **stdout**
2. **Syslog-ng** captures stdout and forwards to **Logstash**
3. **Logstash** parses JSON and sends to Elasticsearch/etc.

### Logstash Configuration

```ruby
input {
  syslog {
    port => 514
    type => "robin-api"
  }
}

filter {
  if [type] == "robin-api" {
    json {
      source => "message"
    }

    # Extract fields
    mutate {
      add_field => {
        "[@metadata][index]" => "robin-api-%{+YYYY.MM.dd}"
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "%{[@metadata][index]}"
  }
}
```

### Querying Logs (Elasticsearch)

**Find all errors for a user:**
```json
{
  "query": {
    "bool": {
      "must": [
        { "term": { "level": "error" } },
        { "term": { "userId": "01HE..." } }
      ]
    }
  }
}
```

**Find slow requests:**
```json
{
  "query": {
    "bool": {
      "must": [
        { "term": { "type": "http_request" } },
        { "range": { "duration": { "gte": 1000 } } }
      ]
    }
  }
}
```

**Trace a request:**
```json
{
  "query": {
    "term": { "requestId": "01HF..." }
  }
}
```

---

## Environment Variables

```bash
# Log level (default: "info" in prod, "debug" in dev)
LOG_LEVEL=info

# Service name (default: "robin-api")
SERVICE_NAME=robin-api

# Environment (auto-detected from NODE_ENV)
NODE_ENV=production
```

---

## Middleware Order

Middleware is executed in this order (defined in Nitro config):

1. **request-id.ts** - Generate/extract request ID
2. **http-logger.ts** - Log all HTTP requests/responses
3. **cors.ts** - Handle CORS
4. **error-handler.ts** - Catch and log errors

This ensures every log has a `requestId` for correlation.

---

## Performance

**Pino benchmarks:**
- 5x faster than Winston
- 2x faster than Bunyan
- Async logging (non-blocking)
- Minimal CPU overhead (~1%)

**Best practices:**
- Use `debug` level sparingly (disabled in production)
- Avoid logging large objects (log IDs instead)
- Use child loggers for persistent context
- Let middleware handle HTTP logging (don't duplicate)

---

## Monitoring & Alerting

### Recommended Alerts

**Error rate spike:**
```
level:error AND service:robin-api
Count > 10 in 5 minutes
```

**Slow requests:**
```
type:http_request AND duration:>2000
Count > 5 in 1 minute
```

**Redis errors:**
```
type:redis_error
Count > 3 in 1 minute
```

**S3 upload failures:**
```
type:s3_upload_error
Count > 1 in 1 minute
```

---

## Troubleshooting

### Logs not appearing in Logstash?

1. Check stdout is not being buffered:
   ```bash
   # Force unbuffered output
   NODE_ENV=production node --unhandled-rejections=strict .output/server/index.mjs
   ```

2. Verify JSON format:
   ```bash
   # Should output valid JSON
   curl http://localhost:3000/health 2>&1 | grep -o '{.*}'
   ```

3. Check syslog-ng is capturing stdout:
   ```bash
   journalctl -u robin-api -f
   ```

### Too many logs in development?

Lower the log level:
```bash
LOG_LEVEL=info npm run dev
```

### Missing request IDs?

Ensure `request-id.ts` middleware loads first in Nitro config.

---

## Migration from Consola

**Old (Consola):**
```typescript
import { log } from './utils/logger';

log.info('Post created: ' + postId + ' by user ' + userId);
log.error('Cache error:', error);
```

**New (Pino):**
```typescript
import { log } from './utils/logger';

log.info('Post created', {
  type: 'post_created',
  postId,
  userId
});

log.error('Cache error', {
  type: 'cache_error',
  error: error instanceof Error ? {
    message: error.message,
    stack: error.stack
  } : error
});
```

---

## References

- [Pino Documentation](https://getpino.io)
- [Logstash JSON Codec](https://www.elastic.co/guide/en/logstash/current/plugins-codecs-json.html)
- [Elasticsearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)
- [ULID Spec](https://github.com/ulid/spec)

---

**Questions?** Check the [Pino docs](https://getpino.io) or contact the platform team.
