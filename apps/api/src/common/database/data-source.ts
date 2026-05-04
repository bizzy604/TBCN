/**
 * Standalone TypeORM DataSource for the CLI (migration:generate / run / revert).
 * Never import this from application code — use DatabaseModule instead.
 */
import 'reflect-metadata';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { DataSource } from 'typeorm';

// ── load .env / .env.local (no external deps) ────────────────────────────
// process.cwd() is apps/api when the script is run via pnpm workspace filter.
function loadDotEnv(): void {
  for (const file of ['.env', '.env.local']) {
    const filePath = resolve(process.cwd(), file);
    if (!existsSync(filePath)) continue;
    for (const raw of readFileSync(filePath, 'utf-8').split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq < 0) continue;
      const key = line.slice(0, eq).trim();
      const val = line.slice(eq + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
      if (process.env[key] === undefined) process.env[key] = val;
    }
  }
}
loadDotEnv();

// ── DataSource ────────────────────────────────────────────────────────────
const AppDataSource = new DataSource({
  type: 'postgres',

  host:     process.env.DATABASE_HOST     ?? 'localhost',
  port:     Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USERNAME ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? 'postgres',
  database: process.env.DATABASE_NAME     ?? 'brandcoach',

  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,

  entities:   ['src/modules/**/*.entity.ts',
               'src/modules/**/*.entity.js',
               'src/common/entities/**/*.entity.ts',
               'src/common/entities/**/*.entity.js'],
  migrations: ['src/common/database/migrations/*.ts',
               'src/common/database/migrations/*.js'],

  migrationsTableName: '_migrations',
  synchronize: false,
  logging: process.env.DATABASE_LOGGING === 'true',
});

export default AppDataSource;
