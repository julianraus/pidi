import 'dotenv/config';
import { db } from '../db.js';

// One-off migration: adds production_source to supply_demand on an existing
// database. Safe to run multiple times.
const statements = [
  `ALTER TABLE supply_demand ADD COLUMN IF NOT EXISTS production_source VARCHAR(20) NOT NULL DEFAULT 'seed'`,
];

try {
  for (const sql of statements) {
    await db.query(sql);
    console.log('[migrate:production-source] OK:', sql.trim().slice(0, 70));
  }
  console.log('[migrate:production-source] done');
} catch (error) {
  console.error('[migrate:production-source] failed:', error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
