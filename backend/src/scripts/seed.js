import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const seedPath = path.resolve(__dirname, '../../database/seed.sql');

try {
  const sql = await readFile(seedPath, 'utf8');
  await db.query(sql);
  console.log('[db:seed] seed applied');
} catch (error) {
  console.error('[db:seed] failed:', error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
