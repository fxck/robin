# Robin

Modern full-stack application built with React 19, Nitropack, and Better Auth.

## Tech Stack

- **Frontend:** React 19 + Vite + TanStack Router + Radix UI
- **Backend:** Nitropack + H3 + Drizzle ORM + PostgreSQL
- **Auth:** Better Auth (email/password + OAuth)
- **Monorepo:** Nx + pnpm workspaces

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9.11+

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start both API and frontend
nx run-many --target=dev --projects=api,app

# Or start individually:
nx dev api    # API server at http://localhost:3000
nx dev app    # Frontend at http://localhost:5173
```

### Building

```bash
# Build everything
nx run-many --target=build

# Or build individually:
nx build api
nx build app
```

### Testing

```bash
# Run all tests
nx run-many --target=test

# Test specific app
nx test api
nx test app
```

### Linting

```bash
# Lint everything
nx run-many --target=lint

# Lint specific app
nx lint api
nx lint app
```

### Database Migrations

```bash
# 1. Edit schema
vim packages/database/src/schema/posts.ts

# 2. Generate migration SQL (from root - uses migrate/drizzle.config.ts)
pnpm db:generate

# 3. Review generated SQL
cat migrate/migrations/0001_*.sql

# 4. Commit migrations to git
git add migrate/
git commit -m "feat: add migration"

# 5. Deploy - migrations run automatically via Zerops execOnce
```

**How it works:**
- `pnpm db:generate` reads TypeScript schema and generates SQL files to `migrate/migrations/`
- `migrate/` folder has isolated dependencies (drizzle-kit + postgres) with locked versions
- On deployment, Zerops runs `drizzle-kit migrate` from the standalone `migrate/` folder
- No workspace dependencies or schema files are shipped to production

## Project Structure

```
robin/
├── apps/
│   ├── api/          # Backend API (Nitropack + H3)
│   └── app/          # Frontend (React 19 + Vite)
├── packages/
│   ├── database/     # Drizzle ORM + PostgreSQL
│   ├── auth/         # Better Auth configuration
│   ├── types/        # Shared TypeScript types
│   ├── utils/        # Shared utilities
│   └── config/       # Shared configuration
├── migrate/          # Standalone migration runtime (isolated deps)
│   ├── drizzle.config.ts  # Migration config (references ../packages/database/src/schema/)
│   ├── package.json       # Locked migration dependencies (drizzle-kit + postgres)
│   ├── pnpm-lock.yaml     # Lockfile (tracked in git)
│   ├── migrations/        # Generated SQL migrations (tracked in git)
│   └── node_modules/      # Isolated deps (gitignored, installed during build)
└── ...
```

## Environment Variables

Copy `.env.example` to `.env.development` and configure:

- Database URL (PostgreSQL)
- Redis URL
- S3 credentials
- Auth secrets
- OAuth client IDs (optional)

See [CLAUDE.md](CLAUDE.md) for detailed documentation.

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - Comprehensive project documentation for AI assistants

## License

MIT
