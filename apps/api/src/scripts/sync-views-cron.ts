#!/usr/bin/env node

/**
 * Cron entry point for syncing view counts from Redis to PostgreSQL
 *
 * This script is meant to be called by Zerops cron scheduler.
 * It imports and executes the sync job with proper error handling.
 */

import { syncViewCounts } from '../jobs/sync-views';

async function main() {
  try {
    await syncViewCounts();
    process.exit(0);
  } catch (error) {
    console.error('Fatal error in sync-views-cron:', error);
    process.exit(1);
  }
}

main();
