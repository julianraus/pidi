import axios from 'axios';
import { query } from '../db.js';
import { invalidate } from '../cache.js';
import { fetchNationalBiChartPriceSeries, fetchRegionalBiPriceSeries, fetchRegionalBiProducerPriceSeries } from './biPriceService.js';

const USE_MOCK = process.env.USE_MOCK_DATA === 'true';
const USE_REAL_PRICE_DATA = process.env.USE_REAL_PRICE_DATA === 'true';
const ALLOW_SYNTHETIC_FALLBACK = process.env.ALLOW_SYNTHETIC_FALLBACK === 'true';

// BPS commodity variable IDs for price data
// See: https://webapi.bps.go.id/v1/api/list/model/data/lang/ind/domain/0000/var/...
const BPS_COMMODITY_VARS = {
  BERAS:   '2212',
  JAGUNG:  '2214',
  KEDELAI: '2215',
  CABAI:   '2220',
  BAWANG:  '2218',
  MINYAK:  '2224',
  GULA:    '2223',
  DAGING:  '2229',
};

// Base prices for explicitly enabled synthetic forecast fallback (Rp/unit)
const SYNTHETIC_BASE_PRICES = {
  BERAS:   14800,
  JAGUNG:  6400,
  KEDELAI: 12100,
  CABAI:   38500,
  BAWANG:  28000,
  MINYAK:  14000,
  GULA:    15500,
  DAGING:  130000,
};

// Seasonal & trend factors per commodity
const PRICE_FACTORS = {
  CABAI:  { trend: 0.0008, seasonal_amp: 0.15, volatility: 0.06 },
  BAWANG: { trend: 0.0004, seasonal_amp: 0.08, volatility: 0.04 },
  BERAS:  { trend: 0.0002, seasonal_amp: 0.02, volatility: 0.01 },
  JAGUNG: { trend: 0.0001, seasonal_amp: 0.04, volatility: 0.02 },
};

function generateSyntheticPrice(commodityCode, regionModifier = 1.0) {
  const base = SYNTHETIC_BASE_PRICES[commodityCode] || 10000;
  const factor = PRICE_FACTORS[commodityCode] || { trend: 0.0001, seasonal_amp: 0.03, volatility: 0.02 };
  const doy = Math.floor((Date.now() / 86400000) % 365);

  const price = base * regionModifier * (
    1 +
    (factor.trend * doy) +
    (Math.sin(doy / 30) * factor.seasonal_amp) +
    ((Math.random() - 0.5) * factor.volatility * 2)
  );

  return Math.round(price);
}

async function fetchBPSPrices(commodityCode) {
  if (USE_MOCK && ALLOW_SYNTHETIC_FALLBACK) {
    return generateSyntheticBpsPrices(commodityCode);
  }

  try {
    const varId = BPS_COMMODITY_VARS[commodityCode];
    if (!varId || !process.env.BPS_API_URL || !process.env.BPS_API_KEY) return [];

    const url = `${process.env.BPS_API_URL}/list/model/data/lang/ind/domain/0000/var/${varId}/th/2026/key/${process.env.BPS_API_KEY}`;
    // BPS WebAPI's WAF blocks requests without a browser-like User-Agent,
    // independent of key validity (verified 2026-07-18).
    const resp = await axios.get(url, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FoodSecurityBot/1.0)' } });
    return parseBPSResponse(resp.data, commodityCode);
  } catch (err) {
    console.warn(`[BPS] Failed for ${commodityCode}:`, err.message);
    return [];
  }
}

async function generateSyntheticBpsPrices(commodityCode) {
  const regions = await query('SELECT id, code FROM regions');
  return regions.map(r => ({
    region_id: r.id,
    price_idr: generateSyntheticPrice(commodityCode, r.code === 'PM' ? 1.18 : r.code === 'NT' ? 1.12 : 1.0),
    price_source: 'forecast',
  }));
}

function parseBPSResponse(data, commodityCode) {
  // BPS API returns nested JSON with province-level data
  // Structure: { data: [{ kd_prop, nm_prop, value }] }
  if (!data?.data) return [];

  const provinceToRegion = {
    '31': 'JW', '32': 'JW', '33': 'JW', '34': 'JW', // Jabodetabek, Jabar, Jateng, Jogja
    '35': 'JW', '36': 'JW',                          // Jatim, Banten
    '11': 'SM', '12': 'SM', '13': 'SM', '14': 'SM',  // Aceh, Sumut, Sumbar, Riau
    '61': 'KL', '62': 'KL', '63': 'KL', '64': 'KL', // Kalbar, Kalteng, Kalsel, Kaltim
    '71': 'SL', '72': 'SL', '73': 'SL',              // Sulut, Sulteng, Sulsel
    '51': 'NT', '52': 'NT', '53': 'NT',              // Bali, NTB, NTT
    '81': 'PM', '82': 'PM', '91': 'PM',              // Maluku, MalUt, Papua
  };

  return data.data.map(item => ({
    region_code: provinceToRegion[item.kd_prop?.toString().slice(0, 2)] || 'JW',
    price_idr: parseFloat(item.value) || 0,
    price_source: 'bps',
  }));
}

function getDateRange(lookbackDays = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - Math.max(lookbackDays - 1, 0));
  return { startDate, endDate };
}

async function fetchBiPrices({ lookbackDays = 7 }) {
  const { startDate, endDate } = getDateRange(lookbackDays);
  return fetchRegionalBiPriceSeries({ startDate, endDate });
}

async function fetchBiProducerPrices({ lookbackDays = 7 }) {
  const { startDate, endDate } = getDateRange(lookbackDays);
  return fetchRegionalBiProducerPriceSeries({ startDate, endDate });
}

async function fetchBiNationalChartPrices({ lookbackDays = 7 }) {
  const { startDate, endDate } = getDateRange(lookbackDays);
  return fetchNationalBiChartPriceSeries({ startDate, endDate });
}

export async function pollPriceData(options = {}) {
  const commodities = await query('SELECT id, code FROM commodities');
  const regions = await query('SELECT id, code FROM regions');
  const commodityMap = Object.fromEntries(commodities.map(c => [c.code, c.id]));
  const regionMap = Object.fromEntries(regions.map(r => [r.code, r.id]));
  let updated = 0;
  const lookbackDays = Number(options.lookbackDays || process.env.PRICE_LOOKBACK_DAYS || 7);
  const shouldUseReal = options.forceReal || USE_REAL_PRICE_DATA;
  let provider = shouldUseReal ? 'bi' : 'bps';

  try {
    if (shouldUseReal) {
      let prices = [];
      try {
        prices = await fetchBiPrices({ lookbackDays });
      } catch (error) {
        console.warn(`[prices] BI regional scraper failed, trying national chart scraper: ${error.message}`);
      }

      if (prices.length === 0) {
        const nationalPrices = await fetchBiNationalChartPrices({ lookbackDays });
        provider = nationalPrices.length > 0 ? 'bi_chart_national' : provider;

        for (const price of nationalPrices) {
          const commodityId = commodityMap[price.commodity_code];
          if (!commodityId || !price.price_idr) continue;

          for (const region of regions) {
            await query(`
              INSERT INTO commodity_prices (time, region_id, commodity_id, price_idr, price_source, price_level)
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (time, region_id, commodity_id, price_level) DO UPDATE SET
                price_idr = EXCLUDED.price_idr,
                price_source = EXCLUDED.price_source
            `, [price.time, region.id, commodityId, price.price_idr, price.price_source, price.price_level || 'consumer']);
            updated++;
          }
        }
      }

      for (const price of prices) {
        const regionId = regionMap[price.region_code];
        const commodityId = commodityMap[price.commodity_code];
        if (!regionId || !commodityId || !price.price_idr) continue;

        await query(`
          INSERT INTO commodity_prices (time, region_id, commodity_id, price_idr, price_source, price_level)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (time, region_id, commodity_id, price_level) DO UPDATE SET
            price_idr = EXCLUDED.price_idr,
            price_source = EXCLUDED.price_source
        `, [price.time, regionId, commodityId, price.price_idr, price.price_source, price.price_level || 'consumer']);
        updated++;
      }

      // Producer-level price (BI price_type_id=4) as a secondary, independent
      // signal used for the producer-retail margin view. Failure here must
      // not affect consumer price polling above.
      try {
        const producerPrices = await fetchBiProducerPrices({ lookbackDays });
        for (const price of producerPrices) {
          const regionId = regionMap[price.region_code];
          const commodityId = commodityMap[price.commodity_code];
          if (!regionId || !commodityId || !price.price_idr) continue;

          await query(`
            INSERT INTO commodity_prices (time, region_id, commodity_id, price_idr, price_source, price_level)
            VALUES ($1, $2, $3, $4, $5, 'producer')
            ON CONFLICT (time, region_id, commodity_id, price_level) DO UPDATE SET
              price_idr = EXCLUDED.price_idr,
              price_source = EXCLUDED.price_source
          `, [price.time, regionId, commodityId, price.price_idr, price.price_source]);
          updated++;
        }
      } catch (error) {
        console.warn(`[prices] Producer-level BI fetch failed, skipping margin data: ${error.message}`);
      }
    } else {
      const now = new Date();
      for (const commodity of commodities) {
        const prices = await fetchBPSPrices(commodity.code);

        for (const price of prices) {
          const regionId = price.region_id || regionMap[price.region_code];
          if (!regionId || !price.price_idr) continue;
          const source = price.price_source || 'forecast';

          await query(`
            INSERT INTO commodity_prices (time, region_id, commodity_id, price_idr, price_source, price_level)
            VALUES ($1, $2, $3, $4, $5, 'consumer')
            ON CONFLICT (time, region_id, commodity_id, price_level) DO UPDATE SET
              price_idr = EXCLUDED.price_idr,
              price_source = EXCLUDED.price_source
          `, [now, regionId, commodity.id, price.price_idr, source]);
          updated++;
        }
      }
    }
  } catch (err) {
    if (!ALLOW_SYNTHETIC_FALLBACK) {
      console.warn(`[prices] Real provider failed and synthetic fallback is disabled: ${err.message}`);
      return { updated: 0, provider: 'unavailable', error: err.message };
    }

    provider = 'forecast-fallback';
    console.warn(`[prices] Real provider failed, using explicitly enabled forecast fallback: ${err.message}`);

    const now = new Date();
    for (const commodity of commodities) {
      const prices = await fetchBPSPrices(commodity.code);

      for (const price of prices) {
        const regionId = price.region_id || regionMap[price.region_code];
        if (!regionId || !price.price_idr) continue;

        await query(`
          INSERT INTO commodity_prices (time, region_id, commodity_id, price_idr, price_source, price_level)
            VALUES ($1, $2, $3, $4, 'forecast', 'consumer')
          ON CONFLICT (time, region_id, commodity_id, price_level) DO UPDATE SET
            price_idr = EXCLUDED.price_idr,
            price_source = 'forecast'
        `, [now, regionId, commodity.id, price.price_idr]);
        updated++;
      }
    }
  }

  if (updated === 0 && shouldUseReal) provider = 'unavailable';

  await invalidate('prices:*');
  console.log(`[prices] Updated ${updated} price records via ${provider}`);
  return { updated, provider };
}
