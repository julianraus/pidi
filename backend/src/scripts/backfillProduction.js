import 'dotenv/config';
import { query } from '../db.js';
import { fetchBpsMonthlyProduction } from '../services/bpsProductionService.js';

// Updates production_ton on existing supply_demand rows with real BPS
// monthly production data, labelling those rows production_source='bps'.
// Deliberately does not INSERT new rows: supply_ton/demand_ton are NOT NULL
// and not sourced from BPS, so fabricating them alongside real production
// data would reintroduce exactly the kind of unlabelled synthetic mixing
// this project's data policy forbids. Rows for periods BPS covers but that
// have no existing supply_demand entry are skipped and logged.
const COMMODITIES = ['BERAS', 'JAGUNG'];

async function run() {
  const commodities = await query('SELECT id, code FROM commodities');
  const regions = await query('SELECT id, code FROM regions');
  const commodityMap = Object.fromEntries(commodities.map((c) => [c.code, c.id]));
  const regionMap = Object.fromEntries(regions.map((r) => [r.code, r.id]));

  let updated = 0;
  let skipped = 0;

  for (const commodityCode of COMMODITIES) {
    const commodityId = commodityMap[commodityCode];
    if (!commodityId) continue;

    const records = await fetchBpsMonthlyProduction(commodityCode);
    console.log(`[bps:production] ${commodityCode}: fetched ${records.length} region-month records`);

    for (const record of records) {
      const regionId = regionMap[record.region_code];
      if (!regionId) continue;

      const result = await query(
        `UPDATE supply_demand
         SET production_ton = $1, production_source = 'bps'
         WHERE region_id = $2 AND commodity_id = $3 AND period_month = $4
         RETURNING id`,
        [record.production_ton, regionId, commodityId, record.period_month]
      );

      if (result.length > 0) {
        updated++;
      } else {
        skipped++;
      }
    }
  }

  console.log(`[bps:production] updated ${updated} existing supply_demand rows, skipped ${skipped} (no matching period in DB)`);
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('[bps:production] failed:', error.message);
    process.exit(1);
  });
