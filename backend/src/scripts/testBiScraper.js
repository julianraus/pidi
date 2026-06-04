import 'dotenv/config';
import { fetchNationalBiChartPriceSeries, fetchRegionalBiPriceSeries } from '../services/biPriceService.js';

const firstArg = process.argv[2];
const secondArg = process.argv[3];
const explicitDateRange = /^\d{4}-\d{2}-\d{2}$/.test(firstArg || '') && /^\d{4}-\d{2}-\d{2}$/.test(secondArg || '');
const lookbackDays = Number(firstArg || process.env.PRICE_LOOKBACK_DAYS || 7);
const endDate = explicitDateRange ? new Date(`${secondArg}T00:00:00.000Z`) : new Date();
const startDate = explicitDateRange ? new Date(`${firstArg}T00:00:00.000Z`) : new Date();

if (!explicitDateRange) {
  startDate.setDate(endDate.getDate() - Math.max(lookbackDays - 1, 0));
}

function summarize(records) {
  const sources = [...new Set(records.map((record) => record.price_source).filter(Boolean))];
  const commodities = [...new Set(records.map((record) => record.commodity_code).filter(Boolean))];
  const dates = records.map((record) => record.time?.toISOString?.().slice(0, 10)).filter(Boolean).sort();

  return {
    records: records.length,
    sources,
    commodities,
    first_date: dates[0] || null,
    last_date: dates[dates.length - 1] || null,
    sample: records.slice(0, 5).map((record) => ({
      date: record.time?.toISOString?.().slice(0, 10),
      region_code: record.region_code || 'NATIONAL',
      commodity_code: record.commodity_code,
      price_idr: record.price_idr,
      price_source: record.price_source,
    })),
  };
}

console.log(`[bi:scraper:test] Date range ${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}`);

try {
  const regional = await fetchRegionalBiPriceSeries({ startDate, endDate });
  console.log('[bi:scraper:test] Regional grid result:');
  console.log(JSON.stringify(summarize(regional), null, 2));
} catch (error) {
  console.warn(`[bi:scraper:test] Regional grid failed: ${error.message}`);
}

try {
  const national = await fetchNationalBiChartPriceSeries({ startDate, endDate });
  console.log('[bi:scraper:test] National chart result:');
  console.log(JSON.stringify(summarize(national), null, 2));
} catch (error) {
  console.warn(`[bi:scraper:test] National chart failed: ${error.message}`);
  process.exitCode = 1;
}
