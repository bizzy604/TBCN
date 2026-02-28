# Program Seeding Runbook

## Purpose

Seed a local/dev database with baseline program, module, and lesson content for LMS testing.

## Prerequisites

- PostgreSQL is running and reachable by the API workspace.
- API dependencies are installed.
- Environment variables (or defaults) are available:
  - `DATABASE_HOST` (default: `localhost`)
  - `DATABASE_PORT` (default: `5433`)
  - `DATABASE_USERNAME` (default: `postgres`)
  - `DATABASE_PASSWORD` (default: `postgres`)
  - `DATABASE_NAME` (default: `brandcoach`)

## Command

Run from `apps/api`:

```bash
npm run seed:run
```

## What It Does

- Upserts each program by slug.
- Resolves canonical `program.id` from the database.
- Deletes existing modules/lessons for that program.
- Re-inserts the full module/lesson structure.

This makes seeding idempotent for curriculum shape and avoids foreign key conflicts.

## Validation

Expected output includes:

- `Seeding programs...`
- one success line per program
- `Programs seeded successfully!`

Optional DB checks:

```sql
SELECT COUNT(*) FROM programs;
SELECT COUNT(*) FROM program_modules;
SELECT COUNT(*) FROM lessons;
```

## Source Files

- `apps/api/src/common/database/seeds/run-seed.ts`
- `apps/api/src/common/database/seeds/seed-programs.ts`
