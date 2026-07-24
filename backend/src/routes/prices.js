import { Router } from 'express';
import { query } from '../db.js';
import { cached } from '../cache.js';
import { readProvincePriceSnapshot, refreshProvincePriceSnapshot } from '../services/biProvinceSnapshot.js';

const router = Router();

// GET /api/prices/commodities
router.get('/commodities', async (req, res, next) => {
  try {
    const data = await cached('prices:commodities:latest', async () => {
      return query(`
        WITH latest_time AS (
          SELECT MAX(time) AS max_time FROM commodity_prices
        ),
        latest AS (
          SELECT DISTINCT ON (commodity_id)
            commodity_id,
            price_idr,
            price_source,
            time
          FROM commodity_prices
          WHERE time >= (SELECT max_time FROM latest_time) - INTERVAL '7 days'
            AND price_level = 'consumer'
          ORDER BY commodity_id, time DESC
        ),
        national_avg AS (
          SELECT commodity_id, AVG(price_idr) AS avg_price
          FROM commodity_prices
          WHERE time >= (SELECT max_time FROM latest_time) - INTERVAL '7 days'
            AND price_level = 'consumer'
          GROUP BY commodity_id
        ),
        prev_month AS (
          SELECT commodity_id, AVG(price_idr) AS avg_price_prev
          FROM commodity_prices
          WHERE time BETWEEN (SELECT max_time FROM latest_time) - INTERVAL '37 days'
            AND (SELECT max_time FROM latest_time) - INTERVAL '30 days'
            AND price_level = 'consumer'
          GROUP BY commodity_id
        ),
        prev_year AS (
          SELECT commodity_id, AVG(price_idr) AS avg_price_yoy
          FROM commodity_prices
          WHERE time BETWEEN (SELECT max_time FROM latest_time) - INTERVAL '365 days'
            AND (SELECT max_time FROM latest_time) - INTERVAL '358 days'
            AND price_level = 'consumer'
          GROUP BY commodity_id
        )
        SELECT
          c.id, c.code, c.name, c.unit, c.category, c.het_price,
          ROUND(na.avg_price, 0) AS current_price,
          ROUND(((na.avg_price - pm.avg_price_prev) / NULLIF(pm.avg_price_prev,0)) * 100, 1) AS change_mom_pct,
          ROUND(((na.avg_price - py.avg_price_yoy) / NULLIF(py.avg_price_yoy,0)) * 100, 1) AS change_yoy_pct,
          ROUND((na.avg_price / NULLIF(c.het_price,0)) * 100, 1) AS pct_of_het,
          l.price_source,
          l.time AS price_time
        FROM national_avg na
        JOIN commodities c ON na.commodity_id = c.id
        LEFT JOIN latest l ON na.commodity_id = l.commodity_id
        LEFT JOIN prev_month pm ON na.commodity_id = pm.commodity_id
        LEFT JOIN prev_year py  ON na.commodity_id = py.commodity_id
        ORDER BY ABS(COALESCE(((na.avg_price - pm.avg_price_prev) / NULLIF(pm.avg_price_prev,0)) * 100, 0)) DESC
      `);
    }, parseInt(process.env.CACHE_TTL_PRICES) || 3600);

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/prices/inflation
router.get('/inflation', async (req, res, next) => {
  try {
    const data = await cached('prices:inflation:monthly', async () => {
      const rows = await query(`
        WITH monthly_avg AS (
          SELECT
            DATE_TRUNC('month', time) AS month,
            commodity_id,
            AVG(price_idr) AS avg_price
          FROM commodity_prices
          WHERE time > NOW() - INTERVAL '13 months'
            AND price_level = 'consumer'
          GROUP BY DATE_TRUNC('month', time), commodity_id
        ),
        baseline AS (
          SELECT commodity_id, AVG(price_idr) AS base_price
          FROM commodity_prices
          WHERE time BETWEEN NOW() - INTERVAL '13 months' AND NOW() - INTERVAL '12 months'
            AND price_level = 'consumer'
          GROUP BY commodity_id
        )
        SELECT
          TO_CHAR(ma.month, 'Mon YYYY') AS month_label,
          ma.month,
          c.name AS commodity_name,
          c.code AS commodity_code,
          ROUND(ma.avg_price, 0) AS avg_price,
          ROUND(((ma.avg_price - b.base_price) / NULLIF(b.base_price,0)) * 100, 2) AS index_vs_baseline
        FROM monthly_avg ma
        JOIN commodities c ON ma.commodity_id = c.id
        LEFT JOIN baseline b ON ma.commodity_id = b.commodity_id
        ORDER BY ma.month, c.id
      `);

      const months = [...new Set(rows.map(r => r.month_label))];
      const byCommodity = rows.reduce((acc, row) => {
        if (!acc[row.commodity_code]) acc[row.commodity_code] = { name: row.commodity_name, data: [] };
        acc[row.commodity_code].data.push({
          month: row.month_label,
          price: parseFloat(row.avg_price),
          index: parseFloat(row.index_vs_baseline),
        });
        return acc;
      }, {});

      return { months, series: byCommodity };
    }, 3600);

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/prices/history/:code
router.get('/history/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { days = 90 } = req.query;

    const data = await cached(`prices:history:${code}:${days}`, async () => {
      return query(`
        SELECT
          DATE_TRUNC('day', cp.time) AS date,
          AVG(cp.price_idr) AS avg_national,
          MIN(cp.price_idr) AS min_price,
          MAX(cp.price_idr) AS max_price
        FROM commodity_prices cp
        JOIN commodities c ON cp.commodity_id = c.id
        WHERE c.code = $1
          AND cp.time > NOW() - ($2 || ' days')::INTERVAL
          AND cp.price_level = 'consumer'
        GROUP BY DATE_TRUNC('day', cp.time)
        ORDER BY date ASC
      `, [code, parseInt(days)]);
    }, 3600);

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/prices/regional/:code
router.get('/regional/:code', async (req, res, next) => {
  try {
    const { code } = req.params;

    const data = await cached(`prices:regional:${code}`, async () => {
      return query(`
        SELECT DISTINCT ON (cp.region_id)
          r.code AS region_code, r.name AS region_name,
          ROUND(cp.price_idr, 0) AS price_idr,
          cp.time AS price_time,
          cp.price_source,
          c.het_price,
          ROUND((cp.price_idr / NULLIF(c.het_price,0)) * 100, 1) AS pct_of_het
        FROM commodity_prices cp
        JOIN regions r ON cp.region_id = r.id
        JOIN commodities c ON cp.commodity_id = c.id
        WHERE c.code = $1
          AND cp.price_level = 'consumer'
        ORDER BY cp.region_id, cp.time DESC
      `, [code]);
    }, 1800);

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/prices/producer-margin
// Gap between producer-level and consumer-level (pasar tradisional) prices,
// both sourced live from BI Harga Pangan (price_type_id 4 vs 1). A large gap
// signals distribution/logistics inefficiency between farmer and market.
router.get('/producer-margin', async (req, res, next) => {
  try {
    const data = await cached('prices:producer-margin', async () => {
      return query(`
        SELECT
          region_code, region_name, commodity_code, commodity_name,
          producer_price_idr, consumer_price_idr, margin_idr, margin_pct, as_of
        FROM v_producer_retail_margin
        ORDER BY margin_pct DESC NULLS LAST
      `);
    }, parseInt(process.env.CACHE_TTL_PRICES) || 3600);

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/prices/provinces?commodity=BERAS
// Per-province latest price snapshot (BI Harga Pangan, no aggregation) used to
// colour the national choropleth. Reads from province_price_snapshot; returns
// populated:false gracefully when the table is empty so the map falls back to
// region-level colouring. Includes a pressure tone vs the national median.
router.get('/provinces', async (req, res, next) => {
  try {
    const commodity = (req.query.commodity || 'BERAS').toUpperCase();
    const rows = await cached(`prices:provinces:${commodity}`, async () => {
      try {
        return await readProvincePriceSnapshot(commodity);
      } catch (err) {
        // Table may not exist yet (never refreshed) - treat as empty, not error.
        if (/relation .* does not exist/i.test(err.message)) return [];
        throw err;
      }
    }, 1800);

    if (!rows.length) {
      return res.json({ success: true, data: { commodity, populated: false, provinces: [] } });
    }

    const prices = rows.map((r) => Number(r.price_idr)).sort((a, b) => a - b);
    const median = prices[Math.floor(prices.length / 2)];
    // Tone by deviation from national median: cheaper = less pressure (positive),
    // pricier = more pressure (danger). +/-4% band counts as balanced (warning).
    const provinces = rows.map((r) => {
      const price = Number(r.price_idr);
      const dev = median ? (price - median) / median : 0;
      const tone = dev > 0.04 ? 'danger' : dev < -0.04 ? 'positive' : 'warning';
      return {
        province: r.province,
        price_idr: price,
        as_of: r.as_of,
        dev_from_median_pct: Math.round(dev * 1000) / 10,
        tone,
      };
    });

    res.json({ success: true, data: { commodity, populated: true, national_median: median, provinces } });
  } catch (err) { next(err); }
});

// POST /api/prices/provinces/refresh  (token-guarded write)
// Triggers a live BI scrape of all provinces and upserts the snapshot table.
// Guarded by ADMIN_REFRESH_TOKEN so it can be run against the deployed backend
// (where the DB is reachable) even from networks where port 5432 is blocked.
router.post('/provinces/refresh', async (req, res, next) => {
  try {
    const token = process.env.ADMIN_REFRESH_TOKEN;
    const provided = req.get('x-admin-token') || req.query.token;
    if (!token || provided !== token) {
      return res.status(401).json({ success: false, error: 'unauthorized' });
    }
    const commodity = (req.query.commodity || 'BERAS').toUpperCase();
    const written = await refreshProvincePriceSnapshot({ commodityCode: commodity });
    res.json({ success: true, data: { commodity, written } });
  } catch (err) { next(err); }
});

export default router;
