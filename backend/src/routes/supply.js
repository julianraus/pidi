import { Router } from 'express';
import { query, queryOne } from '../db.js';
import { cached } from '../cache.js';
import { computeRedistributionPlan } from '../services/optimizationService.js';

const router = Router();

// GET /api/supply/regions?commodity=BERAS&month=2026-04
router.get('/regions', async (req, res, next) => {
  try {
    const { commodity = 'BERAS', month } = req.query;
    const periodMonth = month ? new Date(month) : new Date(new Date().setDate(1));
    const cacheKey = `supply:regions:${commodity}:${periodMonth.toISOString().slice(0, 7)}`;

    const data = await cached(cacheKey, async () => {
      return query(`
        WITH target_month AS (
          SELECT COALESCE(
            MAX(sd.period_month) FILTER (WHERE sd.period_month <= DATE_TRUNC('month', $2::TIMESTAMPTZ)),
            MAX(sd.period_month)
          ) AS period_month
          FROM supply_demand sd
          JOIN commodities c ON sd.commodity_id = c.id
          WHERE c.code = $1
        )
        SELECT
          r.id, r.code, r.name AS region_name, r.island, r.population,
          c.name AS commodity_name, c.unit,
          sd.period_month, sd.supply_ton, sd.demand_ton,
          sd.stock_ton, sd.production_ton, sd.production_source, sd.import_ton, sd.export_ton,
          ROUND(sd.supply_ton - sd.demand_ton, 2) AS balance_ton,
          ROUND((sd.supply_ton - sd.demand_ton) / NULLIF(sd.demand_ton,0) * 100, 1) AS balance_pct,
          CASE
            WHEN (sd.supply_ton - sd.demand_ton) > 10000 THEN 'surplus'
            WHEN (sd.supply_ton - sd.demand_ton) < -10000 THEN 'deficit'
            ELSE 'balanced'
          END AS status
        FROM supply_demand sd
        JOIN regions r ON sd.region_id = r.id
        JOIN commodities c ON sd.commodity_id = c.id
        CROSS JOIN target_month tm
        WHERE c.code = $1
          AND sd.period_month = tm.period_month
        ORDER BY r.id
      `, [commodity, periodMonth]);
    }, parseInt(process.env.CACHE_TTL_SUPPLY) || 1800);

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/supply/balance
router.get('/balance', async (req, res, next) => {
  try {
    const data = await cached('supply:balance:national', async () => {
      const rows = await query(`
        WITH latest_period AS (
          SELECT MAX(sd.period_month) AS period_month
          FROM supply_demand sd
          JOIN commodities c ON sd.commodity_id = c.id
          WHERE c.code = 'BERAS'
            AND sd.period_month <= DATE_TRUNC('month', NOW())
        )
        SELECT
          SUM(supply_ton) AS total_supply,
          SUM(demand_ton) AS total_demand,
          SUM(supply_ton - demand_ton) AS total_balance,
          COUNT(*) FILTER (WHERE supply_ton - demand_ton > 10000)  AS surplus_regions,
          COUNT(*) FILTER (WHERE supply_ton - demand_ton < -10000) AS deficit_regions,
          COUNT(*) FILTER (WHERE ABS(supply_ton - demand_ton) <= 10000) AS balanced_regions,
          MAX(sd.period_month) AS period_month
        FROM supply_demand sd
        JOIN commodities c ON sd.commodity_id = c.id
        CROSS JOIN latest_period lp
        WHERE c.code = 'BERAS'
          AND sd.period_month = lp.period_month
      `);
      return rows[0] || {};
    }, 1800);

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/supply/history/:regionCode
router.get('/history/:regionCode', async (req, res, next) => {
  try {
    const { regionCode } = req.params;
    const { commodity = 'BERAS', months = 6 } = req.query;

    const data = await query(`
      SELECT
        sd.period_month,
        sd.supply_ton,
        sd.demand_ton,
        ROUND(sd.supply_ton - sd.demand_ton, 2) AS balance_ton
      FROM supply_demand sd
      JOIN regions r ON sd.region_id = r.id
      JOIN commodities c ON sd.commodity_id = c.id
      WHERE r.code = $1 AND c.code = $2
        AND sd.period_month >= DATE_TRUNC('month', NOW() - ($3 || ' months')::INTERVAL)
      ORDER BY sd.period_month ASC
    `, [regionCode, commodity, months]);

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/supply/redistribute
router.post('/redistribute', async (req, res, next) => {
  try {
    const regionsData = await query(`
      WITH latest_period AS (
        SELECT MAX(sd.period_month) AS period_month
        FROM supply_demand sd
        JOIN commodities c ON sd.commodity_id = c.id
        WHERE c.code = 'BERAS'
          AND sd.period_month <= DATE_TRUNC('month', NOW())
      )
      SELECT r.code, r.name,
        ROUND(sd.supply_ton - sd.demand_ton) AS balance_ton
      FROM supply_demand sd
      JOIN regions r ON sd.region_id = r.id
      JOIN commodities c ON sd.commodity_id = c.id
      CROSS JOIN latest_period lp
      WHERE c.code = 'BERAS'
        AND sd.period_month = lp.period_month
    `);

    const routes = await query(`
      SELECT
        ro.code AS origin_code, rd.code AS destination_code,
        dr.distance_km, dr.duration_days, dr.cost_per_ton,
        dr.capacity_ton, dr.transport_mode
      FROM distribution_routes dr
      JOIN regions ro ON dr.origin_id = ro.id
      JOIN regions rd ON dr.destination_id = rd.id
      WHERE dr.is_active = TRUE
    `);

    const plan = computeRedistributionPlan(regionsData, routes);
    res.json({ success: true, data: plan });
  } catch (err) { next(err); }
});

export default router;
