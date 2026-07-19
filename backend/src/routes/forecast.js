import { Router } from 'express';
import { query } from '../db.js';
import { cached, invalidate } from '../cache.js';
import { generateForecast, generateAlert, generateRedistributionAnalysis } from '../services/aiService.js';

const router = Router();

const MACRO_CONTEXT = {
  as_of: '2026-07-17',
  usd_idr: 17944,
  usd_idr_change_ptp_pct: 1.4,
  bi_rate_pct: 5.75,
  headline_inflation_yoy_pct: 3.34,
  headline_inflation_mtm_pct: 0.44,
  volatile_food_yoy_pct: 5.58,
  volatile_food_mtm_pct: 0.14,
  food_group_mtm_pct: 0.39,
  food_group_mtm_contribution_pct: 0.12,
  import_growth_yoy_pct: 14.44,
  import_value_jan_feb_usd_billion: 42.09,
  key_food_drivers: ['Cabai merah', 'Bawang merah', 'Bawang putih', 'Beras', 'Ayam ras'],
  sources: [
    {
      label: 'BPS Inflasi Juni 2026',
      url: 'https://www.bps.go.id/en/pressrelease/2026/07/01/2590/inflasi-year-on-year--y-on-y--pada-juni-2026-sebesar-3-34-persen-.html',
    },
    {
      label: 'BI RDG 17-18 Juni 2026 - BI-Rate naik ke 5,75%',
      url: 'https://www.bi.go.id/id/publikasi/ruang-media/news-release/Pages/sp_2812626.aspx',
    },
    {
      label: 'Kurs JISDOR BI, 17 Juli 2026',
      url: 'https://databoks.katadata.co.id/pasar/statistik/6a5a3cf30e232/rupiah-bi-jisdor-menguat-menjadi-17944-per-dolar-as-jumat-17-juli-2026',
    },
    {
      label: 'BPS Ekspor-Impor Februari 2026',
      url: 'https://www.bps.go.id/assets/pressrelease/2026/04/01/2557/ekspor-dan-impor-indonesia-februari-2026-masing-masing-tercatat-usd-22-17-miliar-dan-usd-20-89-miliar-.html',
    },
    {
      label: 'Bapanas Peraturan 9/2025',
      url: 'https://peraturan.go.id/filespengundangan/peraturan-bapanas-no-9-tahun-2025.pdf',
    },
  ],
};

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function resilienceLevel(score) {
  if (score >= 78) return 'aman';
  if (score >= 65) return 'waspada';
  if (score >= 52) return 'siaga_1';
  if (score >= 40) return 'siaga_2';
  return 'kritis';
}

const REAL_PRICE_SOURCES = new Set(['bi', 'bi_chart_national', 'bapanas', 'bps', 'market']);

const DATA_REQUIREMENTS = [
  {
    dataset: 'Supply-demand dan stok pangan',
    status: 'unavailable',
    needed_fields: 'commodity_code, region_code, period_date, production_ton, stock_ton, demand_ton, warehouse_id, last_updated_at',
    preferred_source: 'Bapanas, Bulog, Dinas Pangan, dashboard gudang/logistik daerah',
    reason: 'Data stok operasional dan neraca wilayah tidak tersedia sebagai API publik real-time yang stabil.',
  },
  {
    dataset: 'Rute dan biaya logistik aktual',
    status: 'unavailable',
    needed_fields: 'origin_region, destination_region, mode, capacity_ton, cost_per_ton, lead_time_days, carrier, congestion_status, last_updated_at',
    preferred_source: 'Bulog, operator pelabuhan, perusahaan logistik, API tarif/kapasitas mitra',
    reason: 'Tarif dan kapasitas rute aktual biasanya bersifat operasional/mitra, bukan open data publik.',
  },
  {
    dataset: 'Harga pangan harian',
    status: 'real-time-capable',
    needed_fields: 'commodity_code, province_or_market_code, price_idr, level, observed_at, source_url',
    preferred_source: 'BI Harga Pangan scraper, Bapanas Panel Harga, atau API Bapanas bila akses diberikan',
    reason: 'Panel Harga Bapanas memuat harga harian, tetapi endpoint publik stabil perlu dikonfirmasi; BI Harga Pangan sudah disiapkan sebagai scraper/API source.',
  },
  {
    dataset: 'Cuaca dan risiko panen',
    status: 'real-time-capable',
    needed_fields: 'adm4_code, forecast_datetime, weather_desc, rainfall_proxy_mm, temperature_c, humidity_pct, wind_speed_mps, source_url',
    preferred_source: 'BMKG Open Data prakiraan-cuaca API',
    reason: 'BMKG menyediakan prakiraan cuaca terbuka per kode wilayah adm4; risiko panen tetap hasil model dari data cuaca.',
  },
];

function classifyPriceData(priceData) {
  const sources = [...new Set(priceData.map((row) => row.price_source).filter(Boolean))];
  const hasReal = sources.some((source) => REAL_PRICE_SOURCES.has(String(source).toLowerCase()));
  const isNationalChart = sources.includes('bi_chart_national');

  return {
    status: hasReal ? 'real-time' : 'forecast',
    source: hasReal
      ? `Scraped/API source: ${sources.join(', ')}${isNationalChart ? ' (agregat nasional BI, bukan harga regional detail)' : ''}`
      : 'Forecast/proxy karena harga aktual belum berhasil tersambung',
    freshness: priceData[0]?.price_time || null,
    method: hasReal ? 'scraping/api ingestion' : 'model-derived fallback, bukan data transaksi asli',
  };
}

function buildDataProvenance({ priceData }) {
  const priceStatus = classifyPriceData(priceData);

  return [
    {
      dataset: 'Harga pangan',
      ...priceStatus,
      expected_data: 'Harga harian per komoditas dan provinsi/pasar dari BI Harga Pangan atau Bapanas Panel Harga.',
    },
    {
      dataset: 'Cuaca',
      status: process.env.USE_REAL_WEATHER_DATA === 'true' ? 'real-time' : 'forecast',
      source: process.env.USE_REAL_WEATHER_DATA === 'true' ? 'BMKG Open Data prakiraan-cuaca API' : 'Forecast model, BMKG belum diaktifkan',
      freshness: process.env.USE_REAL_WEATHER_DATA === 'true' ? '3-day BMKG forecast window' : 'model-derived',
      method: process.env.USE_REAL_WEATHER_DATA === 'true' ? 'API polling/scraping' : 'forecast assumption',
      expected_data: 'Prakiraan cuaca per adm4, rainfall proxy, suhu, kelembapan, angin.',
    },
    {
      dataset: 'Risiko panen',
      status: 'forecast',
      source: 'Model Kepang AI dari data BMKG + baseline produksi',
      freshness: 'generated from latest available weather context',
      method: 'model-derived, bukan observasi lapangan langsung',
      expected_data: 'Produksi aktual, fase tanam/panen, luas panen, laporan OPT, dan verifikasi lapangan.',
    },
    {
      dataset: 'Supply-demand dan stok',
      status: 'unavailable',
      source: 'Belum ada source real-time publik yang terhubung',
      freshness: 'requires institutional integration',
      method: 'excluded from real-data claim; used only as forecast requirement',
      expected_data: DATA_REQUIREMENTS[0].needed_fields,
    },
    {
      dataset: 'Rute logistik dan biaya',
      status: 'unavailable',
      source: 'Belum ada API operasional mitra yang terhubung',
      freshness: 'requires partner integration',
      method: 'excluded from real-data claim; used only as forecast requirement',
      expected_data: DATA_REQUIREMENTS[1].needed_fields,
    },
    {
      dataset: 'Makro rupiah dan inflasi',
      status: 'official-release',
      source: 'BPS, Bank Indonesia, dan rilis berita resmi/terverifikasi',
      freshness: MACRO_CONTEXT.as_of,
      method: 'official release reference, bukan streaming tick data',
      expected_data: 'BI rate, USD/IDR, inflasi yoy/mtm, volatile food, nilai impor, tanggal rilis.',
    },
  ];
}

function buildDecisionPlan({ supplyData, riskData, priceData, routes }) {
  const deficits = supplyData
    .filter((region) => Number(region.balance_ton || 0) < -10000)
    .sort((a, b) => Number(a.balance_ton) - Number(b.balance_ton));
  const topRisk = [...riskData].sort((a, b) => Number(b.risk_score || 0) - Number(a.risk_score || 0))[0];
  const volatile = [...priceData].sort((a, b) => Math.abs(Number(b.change_mom_pct || 0)) - Math.abs(Number(a.change_mom_pct || 0)))[0];
  const cheapestRoute = [...routes].sort((a, b) => Number(a.cost_per_ton || 0) - Number(b.cost_per_ton || 0))[0];
  const plan = [];

  if (deficits[0]) {
    plan.push({
      priority: 1,
      title: `Pre-positioning stok ke ${deficits[0].region_name}`,
      rationale: `Defisit beras sekitar ${Math.round(Math.abs(Number(deficits[0].balance_ton)) / 1000)}K ton membutuhkan redistribusi sebelum tekanan harga lokal membesar.`,
      owner: 'Bulog, TPID, Dinas Pangan',
      timeframe: '0-14 hari',
      expected_metric: 'Gap pasokan wilayah turun minimal 30%',
      type: 'redistribution',
    });
  }

  if (topRisk) {
    plan.push({
      priority: 2,
      title: `Mitigasi risiko panen di ${topRisk.region_name}`,
      rationale: `Skor risiko ${Math.round(Number(topRisk.risk_score || 0))}% mengindikasikan potensi gangguan produksi yang perlu ditutup dengan buffer stok dan respons lapangan.`,
      owner: 'Dinas Pertanian, BMKG, penyuluh',
      timeframe: '0-21 hari',
      expected_metric: 'Alert risiko tervalidasi dan rencana mitigasi aktif',
      type: 'climate',
    });
  }

  if (volatile) {
    plan.push({
      priority: 3,
      title: `Pantau dan intervensi ${volatile.name}`,
      rationale: 'Komoditas ini menjadi sinyal volatilitas harga. Intervensi dapat berupa operasi pasar, penguatan pasokan, atau inspeksi rantai distribusi.',
      owner: 'TPID, Bapanas, Disperindag',
      timeframe: '0-7 hari',
      expected_metric: 'Anomali harga turun atau pasokan pasar bertambah',
      type: 'price',
    });
  }

  if (cheapestRoute) {
    plan.push({
      priority: 4,
      title: 'Optimalkan rute biaya rendah dan backhaul',
      rationale: `Rute ${cheapestRoute.origin_name || cheapestRoute.origin} ke ${cheapestRoute.destination_name || cheapestRoute.destination} memiliki biaya relatif rendah untuk mengurangi tekanan logistik saat rupiah dan energi melemah.`,
      owner: 'Operator logistik, Bulog, pelabuhan',
      timeframe: '14-30 hari',
      expected_metric: 'Biaya distribusi per ton turun 5-10%',
      type: 'logistics',
    });
  }

  return plan;
}

router.get('/resilience', async (req, res, next) => {
  try {
    const data = await cached('ai:forecast:resilience', async () => {
      const [supplyData, riskData, priceData, routes] = await Promise.all([
        query(`
          WITH latest_period AS (
            SELECT MAX(sd.period_month) AS period_month
            FROM supply_demand sd
            JOIN commodities c ON sd.commodity_id = c.id
            WHERE c.code = 'BERAS'
              AND sd.period_month <= DATE_TRUNC('month', NOW())
          )
          SELECT r.id, r.name AS region_name, r.code,
            sd.supply_ton, sd.demand_ton,
            ROUND(sd.supply_ton - sd.demand_ton) AS balance_ton,
            CASE
              WHEN (sd.supply_ton - sd.demand_ton) > 10000 THEN 'surplus'
              WHEN (sd.supply_ton - sd.demand_ton) < -10000 THEN 'deficit'
              ELSE 'balanced'
            END AS status
          FROM supply_demand sd
          JOIN regions r ON sd.region_id = r.id
          JOIN commodities c ON sd.commodity_id = c.id
          CROSS JOIN latest_period lp
          WHERE c.code = 'BERAS'
            AND sd.period_month = lp.period_month
          ORDER BY sd.supply_ton - sd.demand_ton ASC
        `),
        query(`
          SELECT DISTINCT ON (hrs.region_id)
            r.name AS region_name, r.code,
            hrs.risk_score, hrs.risk_level,
            hrs.rainfall_dev, hrs.estimated_loss_ton
          FROM harvest_risk_scores hrs
          JOIN regions r ON hrs.region_id = r.id
          ORDER BY hrs.region_id, hrs.scored_at DESC
        `),
        query(`
          WITH latest_time AS (
            SELECT MAX(time) AS max_time FROM commodity_prices
          ),
          latest AS (
            SELECT DISTINCT ON (commodity_id)
              commodity_id, price_idr, price_source, time
            FROM commodity_prices
            WHERE time >= (SELECT max_time FROM latest_time) - INTERVAL '7 days'
            ORDER BY commodity_id, time DESC
          ),
          avg_current AS (
            SELECT cp.commodity_id, AVG(cp.price_idr) AS avg_price
            FROM commodity_prices cp
            WHERE cp.time >= (SELECT max_time FROM latest_time) - INTERVAL '7 days'
            GROUP BY cp.commodity_id
          ),
          prev_month AS (
            SELECT cp.commodity_id, AVG(cp.price_idr) AS avg_price_prev
            FROM commodity_prices cp
            WHERE cp.time BETWEEN (SELECT max_time FROM latest_time) - INTERVAL '37 days'
              AND (SELECT max_time FROM latest_time) - INTERVAL '30 days'
            GROUP BY cp.commodity_id
          )
          SELECT c.name, c.code, c.category, c.het_price,
            ROUND(ac.avg_price, 0) AS current_price,
            ROUND(((ac.avg_price - pm.avg_price_prev) / NULLIF(pm.avg_price_prev,0)) * 100, 1) AS change_mom_pct,
            ROUND((ac.avg_price / NULLIF(c.het_price,0)) * 100, 1) AS pct_of_het,
            l.price_source,
            l.time AS price_time
          FROM avg_current ac
          JOIN latest l ON ac.commodity_id = l.commodity_id
          JOIN commodities c ON ac.commodity_id = c.id
          LEFT JOIN prev_month pm ON ac.commodity_id = pm.commodity_id
          ORDER BY ABS(COALESCE(((ac.avg_price - pm.avg_price_prev) / NULLIF(pm.avg_price_prev,0)) * 100, 0)) DESC
        `),
        query(`
          SELECT
            dr.id,
            ro.code AS origin_code, ro.name AS origin_name,
            rd.code AS destination_code, rd.name AS destination_name,
            dr.cost_per_ton, dr.duration_days, dr.capacity_ton, dr.transport_mode
          FROM distribution_routes dr
          JOIN regions ro ON dr.origin_id = ro.id
          JOIN regions rd ON dr.destination_id = rd.id
          WHERE dr.is_active = TRUE
        `),
      ]);

      const totalDemand = supplyData.reduce((sum, row) => sum + Number(row.demand_ton || 0), 0);
      const totalBalance = supplyData.reduce((sum, row) => sum + Number(row.balance_ton || 0), 0);
      const deficitRegions = supplyData.filter((row) => Number(row.balance_ton || 0) < -10000).length;
      const highRiskRegions = riskData.filter((row) => Number(row.risk_score || 0) >= 60).length;
      const maxRisk = riskData.reduce((max, row) => Math.max(max, Number(row.risk_score || 0)), 0);
      const overHet = priceData.filter((row) => Number(row.pct_of_het || 0) > 100).length;
      const avgLogisticsCost = routes.length
        ? routes.reduce((sum, row) => sum + Number(row.cost_per_ton || 0), 0) / routes.length
        : 0;

      const supplyPressure = clamp(deficitRegions * 9 + Math.max(0, -totalBalance / Math.max(totalDemand, 1)) * 100);
      const climatePressure = clamp(maxRisk * 0.7 + highRiskRegions * 5);
      const pricePressure = clamp(MACRO_CONTEXT.volatile_food_yoy_pct * 4 + overHet * 5);
      const macroPressure = clamp((MACRO_CONTEXT.usd_idr_change_ptp_pct * 7) + (MACRO_CONTEXT.import_growth_yoy_pct * 1.2) + 18);
      const logisticsPressure = clamp(avgLogisticsCost ? ((avgLogisticsCost - 220000) / 5000) : 20);
      const pressureIndex = clamp(
        supplyPressure * 0.24 +
        climatePressure * 0.22 +
        pricePressure * 0.22 +
        macroPressure * 0.2 +
        logisticsPressure * 0.12
      );
      const resilienceScore = clamp(100 - pressureIndex);

      return {
        macro: MACRO_CONTEXT,
        summary: {
          resilience_score: Math.round(resilienceScore),
          resilience_level: resilienceLevel(resilienceScore),
          pressure_index: Math.round(pressureIndex),
          total_balance_ton: Math.round(totalBalance),
          deficit_regions: deficitRegions,
          high_risk_regions: highRiskRegions,
          over_het_commodities: overHet,
          avg_logistics_cost_per_ton: Math.round(avgLogisticsCost),
        },
        pressure_breakdown: [
          { key: 'supply', label: 'Supply-demand gap', value: Math.round(supplyPressure), evidence: `${deficitRegions} wilayah defisit` },
          { key: 'climate', label: 'Risiko cuaca dan panen', value: Math.round(climatePressure), evidence: `Skor risiko maksimum ${Math.round(maxRisk)}%` },
          { key: 'price', label: 'Volatile food', value: Math.round(pricePressure), evidence: `VF ${MACRO_CONTEXT.volatile_food_yoy_pct}% yoy` },
          { key: 'macro', label: 'Rupiah dan imported inflation', value: Math.round(macroPressure), evidence: `USD/IDR Rp${MACRO_CONTEXT.usd_idr.toLocaleString('id-ID')}` },
          { key: 'logistics', label: 'Biaya distribusi', value: Math.round(logisticsPressure), evidence: `Rata-rata Rp${Math.round(avgLogisticsCost).toLocaleString('id-ID')}/ton` },
        ],
        import_exposure: [
          { commodity: 'Kedelai', exposure: 82, reason: 'Bahan baku banyak bergantung impor dan sensitif kurs', mitigation: 'Prioritaskan buffer stok dan substitusi sumber pasok domestik' },
          { commodity: 'Bawang putih', exposure: 88, reason: 'Ketergantungan impor tinggi dan sensitif biaya logistik', mitigation: 'Pantau stok importir dan jadwal kedatangan' },
          { commodity: 'Minyak goreng', exposure: 58, reason: 'Dipengaruhi CPO, energi, dan biaya distribusi', mitigation: 'Perkuat distribusi ke wilayah defisit harga' },
          { commodity: 'Daging sapi', exposure: 65, reason: 'Sebagian pasokan dan pakan rentan kurs', mitigation: 'Atur jadwal impor dan distribusi cold chain' },
          { commodity: 'Beras', exposure: 28, reason: 'Relatif domestik, tetapi tetap sensitif cuaca dan logistik', mitigation: 'Optimalkan CPP dan redistribusi antarwilayah' },
        ],
        decision_plan: buildDecisionPlan({ supplyData, riskData, priceData, routes }),
        scenario_defaults: {
          weaker_rupiah_pct: 5,
          logistics_cost_up_pct: 8,
          harvest_loss_pct: 4,
        },
        data_policy: {
          principle: 'Kepang AI tidak mengklaim data proxy/seed sebagai data asli. Setiap nilai diberi label real-time, official-release, forecast, atau unavailable.',
          real_time_rule: 'Hanya data dari API/scraper resmi/terverifikasi yang diberi status real-time.',
          forecast_rule: 'Score, risiko panen, imported inflation exposure, scenario shock, dan action plan adalah output model yang harus divalidasi dengan data operasional.',
        },
        data_requirements: DATA_REQUIREMENTS,
        data_provenance: buildDataProvenance({ priceData }),
      };
    }, 1800);

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/forecast/overview — AI analysis of current national food security status
router.get('/overview', async (req, res, next) => {
  try {
    const cacheKey = 'ai:forecast:overview';
    const data = await cached(cacheKey, async () => {
      // Gather all context data
      const [supplyData, riskData, priceData, alertData] = await Promise.all([
        query(`
          WITH latest_period AS (
            SELECT MAX(sd.period_month) AS period_month
            FROM supply_demand sd
            JOIN commodities c ON sd.commodity_id = c.id
            WHERE c.code = 'BERAS'
              AND sd.period_month <= DATE_TRUNC('month', NOW())
          )
          SELECT r.name AS region_name, r.code,
            sd.supply_ton, sd.demand_ton,
            ROUND(sd.supply_ton - sd.demand_ton) AS balance_ton,
            CASE
              WHEN (sd.supply_ton - sd.demand_ton) > 10000 THEN 'surplus'
              WHEN (sd.supply_ton - sd.demand_ton) < -10000 THEN 'deficit'
              ELSE 'balanced'
            END AS status
          FROM supply_demand sd
          JOIN regions r ON sd.region_id = r.id
          JOIN commodities c ON sd.commodity_id = c.id
          CROSS JOIN latest_period lp
          WHERE c.code = 'BERAS'
            AND sd.period_month = lp.period_month
          ORDER BY sd.supply_ton - sd.demand_ton ASC
        `),
        query(`
          SELECT DISTINCT ON (hrs.region_id)
            r.name AS region_name, r.code,
            hrs.risk_score, hrs.risk_level,
            hrs.rainfall_dev, hrs.estimated_loss_ton, hrs.notes
          FROM harvest_risk_scores hrs
          JOIN regions r ON hrs.region_id = r.id
          ORDER BY hrs.region_id, hrs.scored_at DESC
        `),
        query(`
          WITH latest AS (
            SELECT DISTINCT ON (commodity_id)
              commodity_id, price_idr, time
            FROM commodity_prices
            ORDER BY commodity_id, time DESC
          ),
          prev_month AS (
            SELECT commodity_id, AVG(price_idr) AS avg_prev
            FROM commodity_prices
            WHERE time BETWEEN NOW() - INTERVAL '37 days' AND NOW() - INTERVAL '30 days'
            GROUP BY commodity_id
          )
          SELECT c.name, c.code, c.het_price,
            ROUND(l.price_idr, 0) AS current_price,
            ROUND(((l.price_idr - pm.avg_prev) / NULLIF(pm.avg_prev,0)) * 100, 1) AS change_mom_pct
          FROM latest l
          JOIN commodities c ON l.commodity_id = c.id
          LEFT JOIN prev_month pm ON l.commodity_id = pm.commodity_id
          ORDER BY ABS(COALESCE(((l.price_idr - pm.avg_prev) / NULLIF(pm.avg_prev,0)) * 100, 0)) DESC
        `),
        query(`
          SELECT wa.title, wa.severity, r.name AS region_name, wa.description
          FROM weather_alerts wa
          JOIN regions r ON wa.region_id = r.id
          WHERE wa.is_active = TRUE AND (wa.valid_until IS NULL OR wa.valid_until > NOW())
          ORDER BY CASE wa.severity WHEN 'emergency' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END
        `),
      ]);

      return generateForecast({ supplyData, riskData, priceData, alertData });
    }, 3600); // Cache 1 hour

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/forecast/refresh — Force refresh AI analysis
router.post('/refresh', async (req, res, next) => {
  try {
    await invalidate('ai:forecast:*');
    res.json({ success: true, message: 'Cache cleared, next request will regenerate AI analysis' });
  } catch (err) { next(err); }
});

// POST /api/forecast/ask — Ask AI a specific question about food security
router.post('/ask', async (req, res, next) => {
  try {
    const { question, context } = req.body;
    if (!question) return res.status(400).json({ error: 'question is required' });

    // Get fresh context
    const [supplyData, riskData, priceData] = await Promise.all([
      query(`
        WITH latest_period AS (
          SELECT MAX(sd.period_month) AS period_month
          FROM supply_demand sd
          JOIN commodities c ON sd.commodity_id = c.id
          WHERE c.code = 'BERAS'
            AND sd.period_month <= DATE_TRUNC('month', NOW())
        )
        SELECT r.name AS region_name, r.code,
          sd.supply_ton, sd.demand_ton,
          ROUND(sd.supply_ton - sd.demand_ton) AS balance_ton,
          CASE WHEN (sd.supply_ton - sd.demand_ton) > 10000 THEN 'surplus'
               WHEN (sd.supply_ton - sd.demand_ton) < -10000 THEN 'deficit'
               ELSE 'balanced' END AS status
        FROM supply_demand sd
        JOIN regions r ON sd.region_id = r.id
        JOIN commodities c ON sd.commodity_id = c.id
        CROSS JOIN latest_period lp
        WHERE c.code = 'BERAS' AND sd.period_month = lp.period_month
      `),
      query(`
        SELECT DISTINCT ON (hrs.region_id)
          r.name AS region_name, hrs.risk_score, hrs.risk_level, hrs.estimated_loss_ton
        FROM harvest_risk_scores hrs
        JOIN regions r ON hrs.region_id = r.id
        ORDER BY hrs.region_id, hrs.scored_at DESC
      `),
      query(`
        SELECT DISTINCT ON (cp.commodity_id)
          c.name, c.het_price, ROUND(cp.price_idr, 0) AS price_idr
        FROM commodity_prices cp
        JOIN commodities c ON cp.commodity_id = c.id
        ORDER BY cp.commodity_id, cp.time DESC
      `),
    ]);

    const answer = await generateAlert(question, { supplyData, riskData, priceData, additionalContext: context });
    res.json({ success: true, data: answer });
  } catch (err) { next(err); }
});

// GET /api/forecast/redistribution — AI-powered redistribution recommendation
router.get('/redistribution', async (req, res, next) => {
  try {
    const cacheKey = 'ai:forecast:redistribution';
    const data = await cached(cacheKey, async () => {
      const [supplyData, routeData, riskData] = await Promise.all([
        query(`
          WITH latest_period AS (
            SELECT MAX(sd.period_month) AS period_month
            FROM supply_demand sd
            JOIN commodities c ON sd.commodity_id = c.id
            WHERE c.code = 'BERAS'
              AND sd.period_month <= DATE_TRUNC('month', NOW())
          )
          SELECT r.name AS region_name, r.code,
            sd.supply_ton, sd.demand_ton,
            ROUND(sd.supply_ton - sd.demand_ton) AS balance_ton
          FROM supply_demand sd
          JOIN regions r ON sd.region_id = r.id
          JOIN commodities c ON sd.commodity_id = c.id
          CROSS JOIN latest_period lp
          WHERE c.code = 'BERAS' AND sd.period_month = lp.period_month
        `),
        query(`
          SELECT ro.name AS origin, rd.name AS destination,
            dr.cost_per_ton, dr.duration_days, dr.capacity_ton, dr.transport_mode
          FROM distribution_routes dr
          JOIN regions ro ON dr.origin_id = ro.id
          JOIN regions rd ON dr.destination_id = rd.id
          WHERE dr.is_active = TRUE
        `),
        query(`
          SELECT DISTINCT ON (hrs.region_id)
            r.name AS region_name, hrs.risk_score, hrs.risk_level, hrs.estimated_loss_ton
          FROM harvest_risk_scores hrs
          JOIN regions r ON hrs.region_id = r.id
          ORDER BY hrs.region_id, hrs.scored_at DESC
        `),
      ]);

      return generateRedistributionAnalysis({ supplyData, routeData, riskData });
    }, 3600);

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
