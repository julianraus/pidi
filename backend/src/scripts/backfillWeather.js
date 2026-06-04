import 'dotenv/config';
import { pollWeatherData } from '../services/bmkgService.js';
import { db } from '../db.js';

try {
  await pollWeatherData();
  console.log('[weather:backfill] weather refresh completed');
} catch (error) {
  console.error('[weather:backfill] failed:', error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
