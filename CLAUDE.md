# Robin - AI Context

> **Updated:** 2025-11-15
> **Status:** Production-Ready Full-Stack Blogging Platform
> **Stack:** Nx Monorepo • React 19 • Nitro • PostgreSQL • Redis • S3

---

## Quick Overview

**Robin** is a modern full-stack blogging platform with authentication, posts management, file uploads, and caching.

### Core Features
- ✅ Authentication (email/password, OAuth ready, password reset)
- ✅ Posts CRUD (drafts, publishing, images, likes, views, trending)
- ✅ Redis caching & rate limiting
- ✅ S3 file uploads
- ✅ Full-text search
- ✅ Infinite scroll UI

---

## Tech Stack

### Frontend (`apps/app`)
- **Framework:** React 19 + Vite 7
- **Routing:** TanStack Router (file-based)
- **State:** TanStack Query
- **Forms:** TanStack Form + Zod
- **UI:** Radix UI Themes, TailwindCSS
- **Icons:** Lucide React

### Backend (`apps/api`)
- **Framework:** Nitropack 2.12 (H3)
- **Database:** Drizzle ORM + PostgreSQL
- **Auth:** Better Auth 1.4
- **Cache:** ioredis 5.8
- **Storage:** AWS S3 SDK
- **Email:** nodemailer + Mailpit for development

### Shared (`packages/*`)
- `@robin/database` - Drizzle schema & client
- `@robin/auth` - Auth config (server + client)
- `@robin/types` - Shared TypeScript types
- `@robin/utils` - Utilities (placeholder)
- `@robin/config` - Config (placeholder)

---

## Project Structure

```
robin/
├── apps/
│   ├── api/          # Backend (13 endpoints)
│   │   ├── routes/   # /health, /api/auth, /api/users, /api/posts, /api/upload
│   │   ├── services/ # db, auth, redis (412 LOC), s3 (175 LOC)
│   │   ├── middleware/ # cors, error-handler
│   │   └── utils/    # logger, validation, auth-guard
│   └── app/          # Frontend (11 routes)
│       ├── routes/   # /, /auth, /forgot-password, /reset-password, /dashboard, /posts/*, /admin/posts/*
│       ├── components/ # auth-form, error-boundary
│       └── lib/      # api-client, auth
├── packages/
│   ├── database/     # Drizzle schema (6 tables)
│   ├── auth/         # Better Auth config
│   ├── types/        # Shared types
│   ├── utils/        # Utilities
│   └── config/       # Config
└── .vscode/          # Debug config
```

---

## Database Schema

**Auth Tables:** users, sessions, accounts, verifications
**Content Tables:** posts (with full-text search), post_likes

**Key Features:**
- PostgreSQL tsvector for search
- Soft deletes (`deletedAt`)
- Optimistic locking (`version`)
- Unique constraints (slugs, likes)

---

## API Endpoints (13)

### Core
- `GET /health` - Health check

### Auth (Better Auth)
- `POST /api/auth/*` - signup, signin, signout, session, password reset

### Users
- `GET /api/users` - List users (paginated, searchable)
- `GET /api/users/me` - Current user (protected)

### Posts (7 endpoints)
- `POST /api/posts` - Create (protected, rate limited)
- `GET /api/posts` - List (cached 5min, search, filters)
- `GET /api/posts/:id` - Get (cached 15min, view counter)
- `PATCH /api/posts/:id` - Update (protected, version check)
- `DELETE /api/posts/:id` - Delete (protected, S3 cleanup)
- `POST /api/posts/:id/like` - Like/unlike (protected)
- `GET /api/posts/trending` - Trending (Redis sorted sets)

### Files
- `POST /api/upload` - Upload to S3 (protected, rate limited, 10MB max)
- `POST /api/test-email` - Test email (dev only)

---

## Frontend Routes (11)

### Public
- `/` - Home
- `/auth` - Login/signup
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset confirmation
- `/posts` - Posts feed (infinite scroll, trending toggle)
- `/posts/:id` - Post viewer

### Protected (Auth Required)
- `/dashboard` - User dashboard
- `/admin/posts` - Manage posts
- `/admin/posts/new` - Create post
- `/admin/posts/:id/edit` - Edit post

---

## Development

### Setup
```bash
pnpm install
nx run-many --target=dev  # Start both apps
```

### Commands
```bash
# Development
nx dev api        # Backend (port 3000)
nx dev app        # Frontend (port 5173)

# Build
nx build api
nx build app

# Testing
nx test api       # Jest (0% coverage - needs tests)
nx test app

# Linting
nx lint api
nx lint app

# Database
pnpm --filter @robin/database db:push  # Run migrations
```

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# S3
S3_ENDPOINT=https://...
S3_REGION=us-east-1
S3_BUCKET=...
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...

# Auth
AUTH_SECRET=...        # Min 32 chars
JWT_SECRET=...

# OAuth (optional)
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Email (Mailpit for dev - catches all emails)
SMTP_HOST=mailpit
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=noreply@robin.local
SMTP_SECURE=false

# URLs
API_BASE=http://localhost:3000
APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000
```

---

## Key Services

### Redis (`apps/api/src/services/redis.ts` - 412 LOC)
- Caching (get/set/delete with TTL)
- Rate limiting (sliding window)
- Pub/Sub (real-time events)
- Counters (views)
- Sorted sets (trending algorithm)

### S3 (`apps/api/src/services/s3.ts` - 175 LOC)
- File uploads (images only)
- Validation (type, size)
- URL generation
- Cleanup on delete

### Email (Mailpit)
- **Development:** Mailpit catches all outgoing emails (Web UI: http://mailpit:8025)
- **Test endpoint:** `POST /api/test-email` - Send test email
- **Features:** Password reset emails, HTML templates
- **No auth required:** SMTP on port 1025 (no username/password)

---

## Useful Links

- [Nx Docs](https://nx.dev)
- [Nitro Docs](https://nitro.unjs.io)
- [TanStack Router](https://tanstack.com/router)
- [Radix UI](https://www.radix-ui.com)
- [Drizzle ORM](https://orm.drizzle.team)

---

**Size:** ~1.1GB (node_modules)
**LOC:** ~6,000 TypeScript/TSX
**Package Manager:** pnpm 9.11
**Deployment Target:** Zerops (PostgreSQL, Redis, S3)
**Dev Email:** Mailpit (http://localhost:8025)
