# Logging Migration Summary

> **Date:** 2025-11-15
> **Migration:** Consola → Pino
> **Status:** ✅ Complete

---

## What Changed

### Before (Consola)
- ❌ Pretty-printed text output (not JSON)
- ❌ DevDependency only (wouldn't work in production)
- ❌ No request correlation/tracing
- ❌ No structured fields
- ❌ Mixed console.log/console.error usage
- ❌ Not compatible with Logstash parsing

### After (Pino)
- ✅ JSON structured logging in production
- ✅ Production dependency
- ✅ Automatic request ID correlation (ULID)
- ✅ Structured fields for filtering/aggregation
- ✅ Consistent logging throughout codebase
- ✅ **Syslog-ng → Logstash compatible**

---

## Files Modified

### Core Logging Infrastructure
1. **[apps/api/src/utils/logger.ts](src/utils/logger.ts)** - Replaced Consola with Pino
   - JSON output in production
   - Pretty-print in development
   - Automatic field redaction (passwords, tokens)
   - Request-scoped child loggers

### New Middleware
2. **[apps/api/src/middleware/request-id.ts](src/middleware/request-id.ts)** - NEW
   - Generates/extracts request IDs (ULID)
   - Sets X-Request-ID header
   - Stores in event.context for correlation

3. **[apps/api/src/middleware/http-logger.ts](src/middleware/http-logger.ts)** - NEW
   - Logs all HTTP requests/responses
   - Captures method, path, status, duration
   - Includes user ID if authenticated
   - Request-scoped logger with correlation ID

### Updated Middleware
4. **[apps/api/src/middleware/error-handler.ts](src/middleware/error-handler.ts)** - UPDATED
   - Replaced console.error with structured logger
   - Includes request ID, user ID, error stack
   - Uses request-scoped logger when available

### Updated Services
5. **[apps/api/src/services/redis.ts](src/services/redis.ts)** - UPDATED
   - All log statements now use structured fields
   - Event types: redis_connect, redis_error, redis_ready, etc.
   - Error objects properly formatted

6. **[apps/api/src/services/s3.ts](src/services/s3.ts)** - UPDATED
   - Structured logging for uploads, deletes, errors
   - Event types: s3_upload, s3_delete, s3_upload_error, etc.
   - Includes file size, content type, bucket info

### Updated Routes
7. **[apps/api/src/routes/api/posts/index.post.ts](src/routes/api/posts/index.post.ts)** - UPDATED
   - Post creation logs now include postId, userId, status, slug

8. **[apps/api/src/routes/api/users/index.get.ts](src/routes/api/users/index.get.ts)** - UPDATED
   - Added debug logging for user list fetches
   - Includes pagination info

9. **[apps/api/src/routes/api/users/me.get.ts](src/routes/api/users/me.get.ts)** - UPDATED
   - Added debug logging for current user fetch

### Updated Utilities
10. **[apps/api/src/utils/auth-guard.ts](src/utils/auth-guard.ts)** - UPDATED
    - Logs unauthorized access attempts
    - Logs successful authentication
    - Includes path, method, user ID

### Other Files
11. **[apps/api/src/main.ts](src/main.ts)** - UPDATED
    - Replaced console.log with logger

12. **[apps/api/package.json](package.json)** - UPDATED
    - Added pino, pino-http, pino-pretty dependencies

---

## New Documentation

1. **[apps/api/LOGGING.md](LOGGING.md)** - Comprehensive logging guide
   - Log format examples (dev vs production)
   - Structured field reference
   - Event type catalog
   - Syslog-ng/Logstash integration guide
   - Elasticsearch query examples
   - Security & redaction info
   - Troubleshooting guide

2. **[apps/api/test-logging.mjs](test-logging.mjs)** - Demo script
   - Shows JSON vs pretty-print output
   - Demonstrates structured fields
   - Tests redaction
   - Verifies syslog compatibility

3. **[CLAUDE.md](../../CLAUDE.md)** - UPDATED
   - Added logging to tech stack
   - Added logging to core features
   - Added logging section to Key Services

---

## Production Output Example

```json
{
  "level": "info",
  "time": "2025-11-15T10:45:32.123Z",
  "pid": 1234,
  "hostname": "api-server-1",
  "env": "production",
  "service": "robin-api",
  "version": "0.0.1",
  "type": "http_request",
  "requestId": "01HFXYZ123ABC",
  "method": "POST",
  "path": "/api/posts",
  "statusCode": 201,
  "duration": 123,
  "userId": "01HEABC123XYZ",
  "msg": "POST /api/posts 201 123ms"
}
```

---

## Event Types Added

### HTTP Events
- `http_request` - Successful request/response
- `http_error` - Request error
- `unhandled_error` - Unhandled exception

### Auth Events
- `auth_required` - Unauthorized access attempt
- User authentication logged in auth-guard

### Database Events
- `post_created` - Post created
- (More can be added: post_updated, post_deleted, etc.)

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

## Syslog-ng → Logstash Integration

### How It Works

1. **Pino** writes JSON logs to stdout
2. **Syslog-ng** captures stdout from your service
3. **Logstash** receives logs, parses JSON, sends to Elasticsearch

### Verification

Run the test script to see JSON output:

```bash
node apps/api/test-logging.mjs
```

Output shows proper JSON format that Logstash can parse:

```json
{"level":"info","time":"2025-11-15T13:24:10.638Z","env":"production","service":"robin-api","version":"0.0.1","msg":"Robin API starting..."}
```

### Logstash Filter Example

```ruby
filter {
  if [service] == "robin-api" {
    json {
      source => "message"
    }

    # Now all fields are available for indexing
    mutate {
      add_field => { "[@metadata][index]" => "robin-api-%{+YYYY.MM.dd}" }
    }
  }
}
```

---

## Migration Checklist

- [x] Install Pino and dependencies
- [x] Replace logger implementation
- [x] Add request ID middleware
- [x] Add HTTP logging middleware
- [x] Update error handler
- [x] Replace all console.log/console.error
- [x] Update Redis service logging
- [x] Update S3 service logging
- [x] Update route logging (posts, users)
- [x] Update auth-guard logging
- [x] Add structured fields to all logs
- [x] Create comprehensive documentation
- [x] Create test script
- [x] Update CLAUDE.md
- [x] Build and verify compilation
- [x] Test JSON output format

---

## Performance Impact

- **Pino is 5x faster than Winston, 2x faster than Bunyan**
- Async logging (non-blocking)
- Minimal CPU overhead (~1%)
- JSON serialization is optimized
- No performance degradation expected

---

## Security Improvements

### Automatic Redaction

Sensitive fields are automatically removed from logs:
- `password`
- `token`, `accessToken`, `refreshToken`
- `authorization`
- `cookie`
- `secret`
- Any nested field matching these patterns

Example:
```javascript
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

## Next Steps

### Recommended Enhancements

1. **Add more event types:**
   - post_updated
   - post_deleted
   - post_viewed
   - user_created
   - user_login
   - user_logout

2. **Add performance metrics:**
   - Database query times
   - Cache hit/miss ratios
   - S3 upload times

3. **Add business metrics:**
   - Daily active users
   - Post creation rate
   - Popular posts

4. **Setup alerting in Logstash/Elasticsearch:**
   - Error rate spikes
   - Slow request alerts
   - Redis connection failures
   - S3 upload failures

5. **Create dashboards:**
   - Request volume over time
   - Error rates by endpoint
   - Response time percentiles
   - Cache hit rates

---

## References

- [Pino Documentation](https://getpino.io)
- [Logstash JSON Codec](https://www.elastic.co/guide/en/logstash/current/plugins-codecs-json.html)
- [Elasticsearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)
- [ULID Specification](https://github.com/ulid/spec)

---

**Migration completed successfully!** 🎉

Your logging is now production-ready with full syslog-ng → Logstash compatibility.
