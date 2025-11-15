/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import { resolve } from 'path';

// Only load .env in local development (not in Zerops runtime)
if (process.env.NODE_ENV !== 'production') {
  config({ path: resolve(__dirname, '../../.env'), override: true });
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema/index.ts',
  out: './migrations',
  dbCredentials: {
    url: process.env.NITRO_DATABASE_URL!,
  },
  verbose: true,
  strict: true,
  migrations: {
    table: '__drizzle_migrations',
    schema: 'public',
  },
});
