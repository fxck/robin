import postgres from 'postgres';
import { config } from 'dotenv';

config({ path: '../../.env', override: true });

const sql = postgres(process.env.DATABASE_URL);

async function drop() {
  await sql`DROP TABLE IF EXISTS accounts CASCADE`;
  await sql`DROP TABLE IF EXISTS sessions CASCADE`;
  await sql`DROP TABLE IF EXISTS users CASCADE`;
  console.log('✅ Tables dropped');
  await sql.end();
}

drop().catch(console.error);
