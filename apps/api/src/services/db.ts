import { getDb } from '@robin/database';

const config = useRuntimeConfig();
export const db = getDb(config.databaseUrl);
