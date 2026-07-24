import 'dotenv/config';
import { db } from '../db.js';
import { refreshProvincePriceSnapshot } from '../services/biProvinceSnapshot.js';

// Populates province_price_snapshot with latest per-province rice prices from
// BI Harga Pangan (no aggregation). Separate from the 6-region commodity_prices
// pipeline so it never disturbs the stable aggregate flow. Idempotent upsert.
//
// Run: node src/scripts/populateProvincePrices.js [COMMODITY_CODE]
// NOTE: requires outbound access to the database (port 5432). If run from a
// network where 5432 is blocked, trigger POST /api/prices/provinces/refresh
// on the deployed backend instead.
const commodity = process.argv[2] || 'BERAS';

try {
  console.log(`[province-prices] refreshing ${commodity} from BI...`);
  const written = await refreshProvincePriceSnapshot({ commodityCode: commodity });
  console.log(written > 0
    ? `[province-prices] upserted ${written} provinces for ${commodity}`
    : '[province-prices] BI returned no filled prices - table left untouched');
} catch (error) {
  console.error('[province-prices] failed:', error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
