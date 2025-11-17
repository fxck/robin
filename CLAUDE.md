# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Robin is a modern full-stack blog platform built with React 19, Nitropack, and Better Auth. The project uses an Nx monorepo with pnpm workspaces.

**Tech Stack:**
- **Frontend:** React 19 + Vite + TanStack Router + Radix UI
- **Backend:** Nitropack (v2) + H3 handlers
- **Database:** PostgreSQL via Drizzle ORM
- **Cache/Sessions:** Redis (via ioredis)
- **Storage:** S3-compatible object storage
- **Auth:** Better Auth (email/password + GitHub/Google OAuth)
- **Monorepo:** Nx 22 + pnpm workspaces

## Development Commands

### Starting the development environment

```bash
# Start both API and frontend in parallel
nx run-many --target=dev --projects=api,app

# Or individually:
nx dev api    # API server at http://localhost:3000
nx dev app    # Frontend at http://localhost:5173
```

### Building

```bash
# Build everything
nx run-many --target=build

# Build individually
nx build api  # Creates apps/api/.output/
nx build app  # Creates dist/apps/app/
```

### Testing

```bash
# Run all tests
nx run-many --target=test

# Test specific project
nx test api
nx test app

# Run tests in CI mode with coverage
nx test api --configuration=ci
```

### Linting

```bash
# Lint everything
nx run-many --target=lint

# Lint specific project
nx lint api
nx lint app
```

### Database Migrations

**Architecture:**
- **`packages/database/`** - Owns schema definitions and generates migrations
- **`migrate/`** - Runtime-only folder with isolated dependencies for deployment

```bash
# 1. Edit schema in packages/database/src/schema/*.ts
# 2. Generate migration SQL
pnpm db:generate

# 3. Review the generated SQL
cat packages/database/migrations/XXXX_*.sql

# 4. Commit migrations to git
git add packages/database/migrations/
git commit -m "feat: add migration"

# Migrations run automatically on deployment via zerops.yml
```

**How migrations work:**
- `packages/database/drizzle.config.ts` - Has schema paths, generates migrations to `./migrations/`
- `migrate/drizzle.config.ts` - Points to `../packages/database/migrations/`, runs migrations in production
- `migrate/` has isolated dependencies (drizzle-kit + postgres) with locked versions in `migrate/pnpm-lock.yaml`
- On deployment, Zerops deploys both `migrate/` and `packages/database/migrations/`
- Zerops runs `drizzle-kit migrate` from `migrate/` folder using `zsc execOnce` for idempotency
- No duplication, single source of truth: `packages/database/migrations/`

## Architecture

### Monorepo Structure

```
robin/
├── apps/
│   ├── api/          # Backend Nitropack application
│   └── app/          # Frontend React application
├── packages/
│   ├── database/     # Shared database client, schema, and migrations
│   │   ├── src/schema/           # Drizzle schema definitions
│   │   ├── migrations/           # Generated SQL migrations (committed)
│   │   └── drizzle.config.ts     # Schema + generation config
│   ├── auth/         # Shared auth configuration
│   ├── types/        # Shared TypeScript types
│   ├── utils/        # Shared utilities
│   └── config/       # Shared configuration
└── migrate/          # Runtime migration executor (isolated deps)
    ├── drizzle.config.ts         # Points to ../packages/database/migrations
    ├── package.json              # Isolated dependencies
    └── pnpm-lock.yaml            # Locked versions for production
```

### Backend Architecture (`apps/api/`)

**Framework:** Nitropack provides file-based routing with H3 handlers.

**Directory structure:**
- `src/routes/` - File-based API routes (e.g., `api/posts/[id].get.ts` → GET /api/posts/:id)
- `src/middleware/` - Global middleware (request-id, error-handler, http-logger, cors)
- `src/services/` - Singleton services (auth, db, redis, s3)
- `src/utils/` - Utilities (validation, auth-guard, logger)
- `src/jobs/` - Background jobs
- `src/plugins/` - Nitro plugins

**Key patterns:**
- Nitro auto-imports utilities from `utils/**` and `services/**` (configured in `nitro.config.ts`)
- `defineEventHandler` is auto-imported
- Database accessed via `db` singleton from `services/db.ts`
- Auth handled via Better Auth in `services/auth.ts`
- Redis used for session storage (Better Auth `secondaryStorage`) and view count caching
- S3 used for image uploads

**Route handlers:**
- Located in `src/routes/` with naming convention: `[path].[method].ts`
- Example: `api/posts/index.get.ts` → GET /api/posts
- Example: `api/posts/[id].patch.ts` → PATCH /api/posts/:id
- Use `getRouterParam(event, 'id')` for route parameters
- Use `readBody(event)` for request body
- Use `validateBody(event, schema)` for validation (custom util)

### Frontend Architecture (`apps/app/`)

**Framework:** React 19 with Vite and TanStack Router v8.

**Directory structure:**
- `src/routes/` - File-based routes (TanStack Router convention)
- `src/components/` - Reusable React components
- `src/lib/` - Frontend utilities (api-client, auth)
- `src/hooks/` - Custom React hooks
- `src/app/` - App setup

**Key patterns:**
- TanStack Router uses file-based routing from `src/routes/`
- Route files export `Route = createFileRoute('/path')` or `createRootRoute()`
- Radix UI used for components with dark theme (purple accent)
- TanStack Query for data fetching and caching
- Authentication via Better Auth client (`@robin/auth/client`)
- API calls use `api.get()`, `api.post()`, etc. from `lib/api-client.ts`
- All API requests include `credentials: 'include'` for cross-domain cookies

**TanStack Router specifics:**
- `__root.tsx` - Root layout with QueryClientProvider, Theme, Navigation
- Route files in `src/routes/` with naming like `posts.$id.tsx` for `/posts/:id`
- `routeTree.gen.ts` is auto-generated by TanStack Router plugin

### Shared Packages

**`@robin/database`:**
- Drizzle ORM client factory (`getDb(connectionString)`)
- Schema definitions in `src/schema/` (users, sessions, accounts, verifications, posts)
- Export all tables and types

**`@robin/auth`:**
- Server-side: `createAuth(db, config)` factory (Better Auth instance)
- Client-side: Import from `@robin/auth/client` in React components
- Configured for cross-domain cookies (SameSite=lax for same domain)
- Redis-backed session storage for performance
- Email verification required - users must verify email before signing in
- Auto-signin after email verification enabled

**`@robin/types`:**
- Shared TypeScript types

**`@robin/utils`:**
- Shared utilities

**`@robin/config`:**
- Shared configuration

### Authentication Flow

1. Better Auth handles routes at `/api/auth/*` (catch-all handler in `api/routes/api/auth/[...all].ts`)
2. Auth instance created in `api/services/auth.ts` with:
   - Database adapter (Drizzle)
   - Redis secondary storage for sessions
   - Email/password + OAuth (GitHub, Google)
   - Email verification with nodemailer
3. Frontend auth via `@robin/auth/client` and TanStack Query
4. Cookies configured for SameSite=lax (same domain deployment)

**Sign Up Flow:**
1. User creates account via email/password
2. Account created but user is NOT signed in
3. Verification email sent with token
4. User must click verification link in email
5. Upon verification, user is automatically signed in
6. Welcome email sent only after successful verification
7. User redirected to Content Manager

**Sign In Flow:**
1. User attempts to sign in with email/password
2. If email not verified, sign in fails with error message
3. If verified, user is signed in and redirected to Content Manager

### Redis Usage

- **Session storage:** Better Auth uses Redis as `secondaryStorage` for faster session lookups
- **View count caching:** Post views tracked in Redis, synced to PostgreSQL every 5 minutes via cron job
- Connection managed by singleton in `api/services/redis.ts`

### S3 Storage

- Image uploads handled via `/api/upload` endpoint
- Uses AWS SDK v3 with S3-compatible storage (Zerops)
- Multipart upload support via `@aws-sdk/lib-storage`
- Configured in `api/services/s3.ts`

### Nitro Configuration

Key aspects in `apps/api/nitro.config.ts`:
- **Alias resolution:** Workspace packages resolved via absolute paths
- **Auto-imports:** `utils/**` and `services/**` directories globally imported
- **Runtime config:** Environment variables mapped to `useRuntimeConfig()`
- **Experimental features:** `asyncContext: true`, `typescriptBundlerResolution: true`

### Environment Variables

All environment variables for the API use the `NITRO_` prefix in production (Zerops deployment).

**Required:**
- `NITRO_DATABASE_URL` - PostgreSQL connection string
- `NITRO_REDIS_URL` - Redis connection string
- `NITRO_S3_ENDPOINT` - S3 endpoint
- `NITRO_S3_REGION` - S3 region
- `NITRO_S3_BUCKET` - S3 bucket name
- `NITRO_S3_ACCESS_KEY_ID` - S3 access key
- `NITRO_S3_SECRET_ACCESS_KEY` - S3 secret key
- `AUTH_SECRET` - Better Auth secret (32+ chars)
- `NITRO_PUBLIC_API_BASE` - API base URL (e.g., https://api.robin.app)
- `NITRO_PUBLIC_APP_URL` - Frontend URL (e.g., https://robin.app)

**Optional:**
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` - GitHub OAuth
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Google OAuth
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`, `SMTP_SECURE` - Email configuration

**Frontend:**
- `VITE_API_URL` - API base URL (defaults to `http://localhost:3000`)

### Deployment (Zerops)

Configuration in `zerops.yml`:

**API (`apiprod` setup):**
- Build: Install deps, build API, install isolated migration deps
- Deploy files: `apps/api/.output`, `migrate/`, `scripts/`
- Init: Run migrations once per version with `zsc execOnce`
- Start: `node apps/api/.output/server/index.mjs`
- Cron: Sync view counts every 5 minutes via `scripts/sync-views.mjs`
- Health check: GET `/health`

**App (`appprod` setup):**
- Build: Install deps, build static React app
- Deploy files: `dist/apps/app/` contents
- Run: Static file server

### Path Aliases

**Backend (Nitro):**
- `@robin/database` → `packages/database/src/index.ts`
- `@robin/auth` → `packages/auth/src/index.ts`
- `@robin/types` → `packages/types/src/index.ts`
- `@robin/utils` → `packages/utils/src/index.ts`
- `@robin/config` → `packages/config/src/index.ts`

**Frontend (Vite):**
- `@/` → `apps/app/src/`
- Workspace packages via `@robin/*`

### Testing Strategy

- Jest configured for both backend and frontend
- Backend tests: `apps/api/jest.config.ts`
- Frontend tests: React Testing Library + jsdom environment
- Run individual tests: `nx test api --testFile=path/to/test.spec.ts`

### Cron Jobs

Defined in `zerops.yml` under `run.crontab`:
- **Sync views:** `*/5 * * * *` (every 5 minutes) - Syncs Redis view counts to PostgreSQL
- Runs on single container only (Zerops handles idempotency)
- Script: `scripts/sync-views.mjs`

## Common Patterns

### Adding a new API endpoint

1. Create file in `apps/api/src/routes/api/` following naming convention
2. Export default `defineEventHandler(async (event) => { ... })`
3. Use auto-imported utilities: `getRouterParam`, `readBody`, `getQuery`
4. Access database via `db` from `services/db`
5. Use `validateBody(event, schema)` for request validation
6. Return JSON directly (Nitro handles serialization)

### Adding a new database table

1. Create schema file in `packages/database/src/schema/`
2. Export table definition using Drizzle syntax
3. Export from `packages/database/src/schema/index.ts`
4. Generate migration: `pnpm db:generate`
5. Review SQL in `migrate/migrations/`
6. Commit migration files

### Adding a new frontend route

1. Create file in `apps/app/src/routes/` following TanStack Router convention
2. Export `Route = createFileRoute('/path')({ component: MyComponent })`
3. Use TanStack Query hooks for data fetching
4. Access auth state via `useSession()` from `@robin/auth/client`
5. Make API calls via `api.get()`, `api.post()`, etc.

### Working with Better Auth

**Backend:**
- Auth instance is singleton in `services/auth.ts`
- Add auth handlers to routes via `auth.handler(toWebRequest(event))`
- Check auth via `auth.api.getSession({ headers: event.headers })`

**Frontend:**
- Import hooks from `@robin/auth/client`
- Use `useSession()` for current user
- Use `signIn.email()`, `signUp.email()`, `signOut()`, etc.
- Social auth via `signIn.social({ provider: 'github' })`

## Important Notes

- **Nitro auto-imports:** `defineEventHandler`, utilities from `utils/**`, services from `services/**` are globally available in API code
- **Migration isolation:** The `migrate/` folder has its own `package.json` and `pnpm-lock.yaml` - never modify these manually
- **Cross-domain cookies:** Auth cookies use `SameSite=none; Secure; Partitioned` for cross-domain support
- **Redis as cache:** View counts are cached in Redis and synced to PostgreSQL periodically
- **TanStack Router v8:** Uses file-based routing with auto-generated route tree
- **Radix UI theming:** Dark mode with purple accent is configured in `__root.tsx`
