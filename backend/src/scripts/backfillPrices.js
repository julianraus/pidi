import 'dotenv/config';
import { pollPriceData } from '../services/priceService.js';
import { db } from '../db.js';

const lookbackDays = Number(process.argv[2] || process.env.PRICE_LOOKBACK_DAYS || 30);

try {
  const result = await pollPriceData({ lookbackDays, forceReal: true });
  console.log(`[prices:backfill] inserted/updated ${result.updated} rows from ${result.provider}`);
} catch (error) {
  console.error('[prices:backfill] failed:', error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
