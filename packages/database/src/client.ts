import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let connection: postgres.Sql;
let db: ReturnType<typeof drizzle>;

export function getDb(connectionString: string) {
  if (!connection) {
    connection = postgres(connectionString, {
      max: 10,
      idle_timeout: 30,
      connect_timeout: 10,
    });
    db = drizzle(connection, { schema });
  }
  return db;
}

export { schema };
export type Database = typeof db;
