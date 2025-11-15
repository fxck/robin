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
# Generate new migration (from schema changes)
pnpm db:generate

# Review generated SQL
cat migrate/migrations/0001_*.sql

# Commit migrations to git
git add migrate/migrations/
git commit -m "feat: add migration"

# Migrations run automatically on Zerops deployment via execOnce
```

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
├── migrate/          # Standalone migration runtime
│   ├── drizzle.config.ts  # Migration config
│   ├── migrations/   # Generated SQL migrations (tracked in git)
│   └── node_modules/ # Isolated deps (ignored, installed in build)
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
- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - Implementation log and challenges
- **[TESTING_STATUS.md](TESTING_STATUS.md)** - Testing progress

## License

MIT
