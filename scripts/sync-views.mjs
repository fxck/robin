#!/usr/bin/env node

/**
 * Standalone script to sync Redis view counts to PostgreSQL
 *
 * Runs directly via Zerops cron - no HTTP bullshit.
 * Zerops provides idempotency via execOnce and single-container execution.
 *
 * Usage: node scripts/sync-views.mjs
 */

import { syncViewCounts } from '../apps/api/.output/server/chunks/jobs/sync-views.mjs';

try {
  await syncViewCounts();
  process.exit(0);
} catch (error) {
  console.error('Sync failed:', error);
  process.exit(1);
}
