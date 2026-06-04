import { Router } from 'express';
import { query } from '../db.js';
import { cached } from '../cache.js';
import { optimizeRoutes } from '../services/optimizationService.js';
import { buildLogisticsRecommendations } from '../services/googleRoutesService.js';

const router = Router();

// GET /api/logistics/recommendations
router.get('/recommendations', async (req, res, next) => {
  try {
    const commodity = String(req.query.commodity || 'BERAS').toUpperCase();
    const limit = Math.min(Math.max(parseInt(req.query.limit || '12', 10) || 12, 1), 30);

    const data = await cached(`logistics:recommendations:${commodity}:${limit}`, async () => {
      const routes = await query(`
        WITH selected_commodity AS (
          SELECT id, code
          FROM commodities
          WHERE code = $1
          LIMIT 1
        ),
        latest_month AS (
          SELECT MAX(sd.period_month) AS period_month
          FROM supply_demand sd
          JOIN selected_commodity sc ON sc.id = sd.commodity_id
        ),
        balance AS (
          SELECT
            r.id AS region_id,
            sd.period_month,
            sd.supply_ton,
            sd.demand_ton,
            sd.stock_ton,
            (sd.supply_ton - sd.demand_ton) AS balance_ton
          FROM regions r
          LEFT JOIN selected_commodity sc ON TRUE
          LEFT JOIN latest_month lm ON TRUE
          LEFT JOIN supply_demand sd
            ON sd.region_id = r.id
           AND sd.commodity_id = sc.id
           AND sd.period_month = lm.period_month
        )
        SELECT
          dr.id,
          dr.route_name,
          dr.transport_mode,
          dr.distance_km,
          dr.duration_days,
          dr.cost_per_ton,
          dr.capacity_ton,
          ro.code AS origin_code,
          ro.name AS origin_name,
          ro.latitude AS origin_latitude,
          ro.longitude AS origin_longitude,
          rd.code AS destination_code,
          rd.name AS destination_name,
          rd.latitude AS destination_latitude,
          rd.longitude AS destination_longitude,
          bo.period_month AS origin_period_month,
          bo.supply_ton AS origin_supply_ton,
          bo.demand_ton AS origin_demand_ton,
          bo.stock_ton AS origin_stock_ton,
          bo.balance_ton AS origin_balance_ton,
          bd.period_month AS destination_period_month,
          bd.supply_ton AS destination_supply_ton,
          bd.demand_ton AS destination_demand_ton,
          bd.stock_ton AS destination_stock_ton,
          bd.balance_ton AS destination_balance_ton,
          COALESCE(
            (SELECT ROUND(AVG(s.efficiency_pct), 1)
             FROM shipments s
             WHERE s.route_id = dr.id
               AND s.departure_date > CURRENT_DATE - 90),
            70
          ) AS avg_efficiency_pct
        FROM distribution_routes dr
        JOIN regions ro ON dr.origin_id = ro.id
        JOIN regions rd ON dr.destination_id = rd.id
        LEFT JOIN balance bo ON bo.region_id = ro.id
        LEFT JOIN balance bd ON bd.region_id = rd.id
        WHERE dr.is_active = TRUE
        ORDER BY dr.cost_per_ton ASC
        LIMIT $2
      `, [commodity, limit]);

      return buildLogisticsRecommendations(routes, { commodityCode: commodity });
    }, 300);

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/logistics/routes
router.get('/routes', async (req, res, next) => {
  try {
    const data = await cached('logistics:routes:all', async () => {
      return query(`
        SELECT
          dr.id,
          ro.code AS origin_code,   ro.name AS origin_name,
          rd.code AS destination_code, rd.name AS destination_name,
          dr.route_name, dr.transport_mode,
          dr.distance_km, dr.duration_days, dr.cost_per_ton, dr.capacity_ton,
          COALESCE(
            (SELECT ROUND(AVG(s.efficiency_pct), 1)
             FROM shipments s WHERE s.route_id = dr.id
               AND s.departure_date > CURRENT_DATE - 90),
            70
          ) AS avg_efficiency_pct,
          COALESCE(
            (SELECT COUNT(*) FROM shipments s WHERE s.route_id = dr.id
               AND s.status = 'in_transit'),
            0
          ) AS active_shipments
        FROM distribution_routes dr
        JOIN regions ro ON dr.origin_id = ro.id
        JOIN regions rd ON dr.destination_id = rd.id
        WHERE dr.is_active = TRUE
        ORDER BY dr.cost_per_ton ASC
      `);
    }, 600);

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/logistics/efficiency
router.get('/efficiency', async (req, res, next) => {
  try {
    const data = await cached('logistics:efficiency:summary', async () => {
      const summary = await query(`
        SELECT
          COUNT(DISTINCT dr.id) AS total_routes,
          ROUND(AVG(dr.cost_per_ton), 0) AS avg_cost_per_ton,
          ROUND(AVG(dr.duration_days), 1) AS avg_duration_days,
          SUM(dr.capacity_ton) AS total_capacity_ton
        FROM distribution_routes dr
        WHERE dr.is_active = TRUE
      `);

      const monthly = await query(`
        SELECT
          TO_CHAR(s.departure_date, 'Mon') AS month,
          ROUND(AVG(s.efficiency_pct), 1) AS avg_efficiency,
          SUM(s.volume_ton) AS total_volume,
          COUNT(*) AS shipment_count
        FROM shipments s
        WHERE s.departure_date > CURRENT_DATE - 180
        GROUP BY TO_CHAR(s.departure_date, 'Mon'), DATE_TRUNC('month', s.departure_date)
        ORDER BY DATE_TRUNC('month', s.departure_date)
      `);

      return { summary: summary[0] || {}, monthly };
    }, 1800);

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/logistics/optimize
router.post('/optimize', async (req, res, next) => {
  try {
    const { requirements } = req.body;

    const routes = await query(`
      SELECT
        ro.code AS origin, rd.code AS destination,
        dr.transport_mode, dr.distance_km, dr.duration_days,
        dr.cost_per_ton, dr.capacity_ton
      FROM distribution_routes dr
      JOIN regions ro ON dr.origin_id = ro.id
      JOIN regions rd ON dr.destination_id = rd.id
      WHERE dr.is_active = TRUE
    `);

    const plan = optimizeRoutes(requirements || [], routes);
    res.json({ success: true, data: plan });
  } catch (err) { next(err); }
});

// GET /api/logistics/shipments
router.get('/shipments', async (req, res, next) => {
  try {
    const { status } = req.query;
    const statusFilter = status ? `AND s.status = $1` : '';
    const params = status ? [status] : [];

    const data = await query(`
      SELECT
        s.id,
        ro.name AS origin_name, rd.name AS destination_name,
        c.name AS commodity_name,
        s.volume_ton, s.departure_date, s.arrival_date,
        s.status, s.efficiency_pct, s.actual_cost
      FROM shipments s
      JOIN distribution_routes dr ON s.route_id = dr.id
      JOIN regions ro ON dr.origin_id = ro.id
      JOIN regions rd ON dr.destination_id = rd.id
      JOIN commodities c ON s.commodity_id = c.id
      WHERE s.departure_date > CURRENT_DATE - 90
      ${statusFilter}
      ORDER BY s.departure_date DESC
      LIMIT 50
    `, params);

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
