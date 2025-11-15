/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './packages/database/src/schema/index.ts',
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
