import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

db.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

// Standard query — always returns rows array directly
export async function query(sql, params = []) {
  const result = await db.query(sql, params);
  return result.rows;
}

// Single row shortcut
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}
