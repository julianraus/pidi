import { Router } from 'express';
import { query } from '../db.js';
import { cached } from '../cache.js';

const router = Router();

async function buildFallbackAlerts() {
  const rows = await query(`
    WITH latest_risk AS (
      SELECT DISTINCT ON (hrs.region_id, hrs.commodity_id)
        hrs.region_id,
        hrs.risk_score,
        hrs.risk_level,
        hrs.rainfall_dev,
        hrs.estimated_loss_ton,
        hrs.estimated_loss_pct,
        hrs.scored_at
      FROM harvest_risk_scores hrs
      JOIN commodities c ON hrs.commodity_id = c.id
      WHERE c.code = 'BERAS'
      ORDER BY hrs.region_id, hrs.commodity_id, hrs.scored_at DESC
    ),
    latest_weather AS (
      SELECT
        wf.region_id,
        AVG(wf.rainfall_mm) AS avg_rainfall_mm,
        MAX(wf.rainfall_mm) AS max_rainfall_mm
      FROM weather_forecasts wf
      WHERE wf.forecast_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 7
      GROUP BY wf.region_id
    )
    SELECT
      r.id AS region_id,
      r.code AS region_code,
      r.name AS region_name,
      lr.risk_score,
      lr.risk_level,
      lr.rainfall_dev,
      lr.estimated_loss_ton,
      lr.estimated_loss_pct,
      lr.scored_at,
      COALESCE(lw.avg_rainfall_mm, 0) AS avg_rainfall_mm,
      COALESCE(lw.max_rainfall_mm, 0) AS max_rainfall_mm
    FROM latest_risk lr
    JOIN regions r ON lr.region_id = r.id
    LEFT JOIN latest_weather lw ON lw.region_id = r.id
    WHERE lr.risk_level IN ('critical', 'high')
    ORDER BY lr.risk_score DESC
    LIMIT 3
  `);

  return rows.map((row, index) => {
    const isDry = +row.rainfall_dev < 0;
    const severity = +row.risk_score >= 70 ? 'emergency' : 'warning';
    const alertType = isDry ? 'drought' : 'flood';
    const headline = isDry ? 'Tekanan kekeringan' : 'Tekanan hujan ekstrem';
    const estimatedLoss = +row.estimated_loss_ton > 0
      ? `${Math.max(1, Math.round(row.estimated_loss_ton / 1000))}K ton`
      : `${(+row.estimated_loss_pct || 0).toFixed(1)}% produksi`;

    return {
      id: `derived-${row.region_code}-${index}`,
      region_code: row.region_code,
      region_name: row.region_name,
      alert_type: alertType,
      severity,
      title: `${headline} beras - ${row.region_name}`,
      description: isDry
        ? `Prakiraan hujan ${Math.round(Math.abs(row.rainfall_dev))}% di bawah normal dengan potensi tekanan produksi sekitar ${estimatedLoss}.`
        : `Puncak hujan mencapai ${Math.round(row.max_rainfall_mm)} mm/hari dengan potensi gangguan produksi sekitar ${estimatedLoss}.`,
      issued_at: row.scored_at,
      valid_until: row.scored_at,
      derived: true,
    };
  });
}

// GET /api/weather/forecast
router.get('/forecast', async (req, res, next) => {
  try {
    const { regionCode, days = 14 } = req.query;
    const cacheKey = `weather:forecast:${regionCode || 'all'}:${days}`;

    const data = await cached(cacheKey, async () => {
      if (regionCode) {
        return query(`
          SELECT r.code, r.name AS region_name, wf.forecast_date,
            wf.temperature_c, wf.rainfall_mm, wf.humidity_pct,
            wf.wind_speed_mps, wf.weather_code
          FROM weather_forecasts wf
          JOIN regions r ON wf.region_id = r.id
          WHERE r.code = $1
            AND wf.forecast_date BETWEEN CURRENT_DATE AND CURRENT_DATE + $2
          ORDER BY wf.forecast_date
        `, [regionCode, parseInt(days)]);
      }
      return query(`
        SELECT r.code, r.name AS region_name, wf.forecast_date,
          wf.temperature_c, wf.rainfall_mm, wf.humidity_pct,
          wf.wind_speed_mps, wf.weather_code
        FROM weather_forecasts wf
        JOIN regions r ON wf.region_id = r.id
        WHERE wf.forecast_date BETWEEN CURRENT_DATE AND CURRENT_DATE + $1
        ORDER BY r.id, wf.forecast_date
      `, [parseInt(days)]);
    }, parseInt(process.env.CACHE_TTL_WEATHER) || 21600);

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/weather/risk
router.get('/risk', async (req, res, next) => {
  try {
    const data = await cached('weather:risk:all', async () => {
      const rows = await query(`
        SELECT DISTINCT ON (hrs.region_id, hrs.commodity_id)
          r.code, r.name AS region_name, r.island,
          c.name AS commodity_name,
          hrs.risk_score, hrs.risk_level,
          hrs.rainfall_dev, hrs.drought_index, hrs.flood_risk,
          hrs.elnino_phase, hrs.estimated_loss_ton, hrs.estimated_loss_pct,
          hrs.notes, hrs.scored_at
        FROM harvest_risk_scores hrs
        JOIN regions r ON hrs.region_id = r.id
        JOIN commodities c ON hrs.commodity_id = c.id
        ORDER BY hrs.region_id, hrs.commodity_id, hrs.scored_at DESC
      `);

      const enriched = await Promise.all(rows.map(async (row) => {
        const weather = await query(`
          SELECT AVG(rainfall_mm) AS avg_rain, MAX(rainfall_mm) AS max_rain
          FROM weather_forecasts wf
          JOIN regions r ON wf.region_id = r.id
          WHERE r.code = $1
            AND forecast_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 14
        `, [row.code]);
        return {
          ...row,
          forecast_avg_rain_mm: parseFloat(weather[0]?.avg_rain || 0).toFixed(1),
          forecast_max_rain_mm: parseFloat(weather[0]?.max_rain || 0).toFixed(1),
        };
      }));

      return enriched.sort((a, b) => b.risk_score - a.risk_score);
    }, 3600);

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/weather/alerts
router.get('/alerts', async (req, res, next) => {
  try {
    const data = await cached('weather:alerts:active', async () => {
      const alerts = await query(`
        SELECT wa.id, r.code AS region_code, r.name AS region_name,
          wa.alert_type, wa.severity, wa.title, wa.description,
          wa.issued_at, wa.valid_until
        FROM weather_alerts wa
        JOIN regions r ON wa.region_id = r.id
        WHERE wa.is_active = TRUE
          AND (wa.valid_until IS NULL OR wa.valid_until > NOW())
        ORDER BY
          CASE wa.severity WHEN 'emergency' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END,
          wa.issued_at DESC
      `);

      if (alerts.length > 0) return alerts;
      return buildFallbackAlerts();
    }, 600);

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/weather/scenarios
router.get('/scenarios', async (req, res, next) => {
  try {
    const data = await cached('weather:scenarios', async () => {
      const baseline = await query(`
        WITH latest_period AS (
          SELECT MAX(sd.period_month) AS period_month
          FROM supply_demand sd
          JOIN commodities c ON sd.commodity_id = c.id
          WHERE c.code = 'BERAS'
            AND sd.period_month <= DATE_TRUNC('month', NOW())
        )
        SELECT SUM(supply_ton) AS total_supply
        FROM supply_demand sd
        JOIN commodities c ON sd.commodity_id = c.id
        CROSS JOIN latest_period lp
        WHERE c.code = 'BERAS'
          AND sd.period_month = lp.period_month
      `);

      const baseSupply = parseFloat(baseline[0]?.total_supply || 2960000);
      const months = ['Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep'];

      const scenarios = {
        optimistic:  months.map((m, i) => ({ month: m, value: Math.round(baseSupply * (1 + Math.sin(i/3) * 0.005 - i * 0.0002)) })),
        moderate:    months.map((m, i) => ({ month: m, value: Math.round(baseSupply * (1 - (i < 3 ? i * 0.03 : 0.07 - (i-3) * 0.02))) })),
        pessimistic: months.map((m, i) => ({ month: m, value: Math.round(baseSupply * (1 - (i < 3 ? i * 0.05 : 0.12 - (i-3) * 0.015))) })),
        demand:      months.map(() =>     ({ value: Math.round(baseSupply * 0.998) })),
      };

      return { scenarios, base_supply: baseSupply };
    }, 3600);

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
