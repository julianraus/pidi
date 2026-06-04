import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, '../../database/schema.sql');

try {
  const sql = await readFile(schemaPath, 'utf8');
  await db.query(sql);
  console.log('[db:migrate] schema applied');
} catch (error) {
  console.error('[db:migrate] failed:', error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
