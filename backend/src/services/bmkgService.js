import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { query } from '../db.js';
import { invalidate } from '../cache.js';
import { computeRiskScore, estimateHarvestLoss } from './weatherRiskService.js';

const USE_MOCK = process.env.USE_MOCK_DATA === 'true';
const USE_REAL_WEATHER_DATA = process.env.USE_REAL_WEATHER_DATA === 'true';
const ALLOW_SYNTHETIC_FALLBACK = process.env.ALLOW_SYNTHETIC_FALLBACK === 'true';
const BMKG_FORECAST_API_URL = process.env.BMKG_FORECAST_API_URL || 'https://api.bmkg.go.id/publik/prakiraan-cuaca';
const BMKG_ALERTS_RSS_URL = process.env.BMKG_ALERTS_RSS_URL || 'https://www.bmkg.go.id/alerts/nowcast/id';

const DEFAULT_BMKG_ADM4_CODES = {
  JW: ['31.71.03.1001'],
  SM: ['12.71.01.1001'],
  KL: ['64.72.01.1001'],
  SL: ['73.71.01.1001'],
  NT: ['52.71.01.1001'],
  PM: ['91.71.01.1001'],
};

const ALERT_REGION_BY_PROVINCE = {
  Aceh: 'SM',
  'Sumatera Utara': 'SM',
  'Sumatera Barat': 'SM',
  Riau: 'SM',
  Jambi: 'SM',
  'Sumatera Selatan': 'SM',
  Bengkulu: 'SM',
  Lampung: 'SM',
  'Kepulauan Bangka Belitung': 'SM',
  'Kepulauan Riau': 'SM',
  Banten: 'JW',
  'DKI Jakarta': 'JW',
  'Jawa Barat': 'JW',
  'Jawa Tengah': 'JW',
  'DI Yogyakarta': 'JW',
  'Jawa Timur': 'JW',
  Bali: 'NT',
  'Nusa Tenggara Barat': 'NT',
  'Nusa Tenggara Timur': 'NT',
  'Kalimantan Barat': 'KL',
  'Kalimantan Tengah': 'KL',
  'Kalimantan Selatan': 'KL',
  'Kalimantan Timur': 'KL',
  'Kalimantan Utara': 'KL',
  'Sulawesi Utara': 'SL',
  Gorontalo: 'SL',
  'Sulawesi Tengah': 'SL',
  'Sulawesi Selatan': 'SL',
  'Sulawesi Tenggara': 'SL',
  'Sulawesi Barat': 'SL',
  Maluku: 'PM',
  'Maluku Utara': 'PM',
  Papua: 'PM',
  'Papua Barat': 'PM',
  'Papua Selatan': 'PM',
  'Papua Tengah': 'PM',
  'Papua Pegunungan': 'PM',
  'Papua Barat Daya': 'PM',
};

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  trimValues: true,
});

function getAdm4Codes() {
  if (!process.env.BMKG_REGION_ADM4_CODES) return DEFAULT_BMKG_ADM4_CODES;

  try {
    const parsed = JSON.parse(process.env.BMKG_REGION_ADM4_CODES);
    return { ...DEFAULT_BMKG_ADM4_CODES, ...parsed };
  } catch (error) {
    console.warn('[BMKG] Failed to parse BMKG_REGION_ADM4_CODES, using defaults:', error.message);
    return DEFAULT_BMKG_ADM4_CODES;
  }
}

function getMockRainProfile(regionCode) {
  return {
    JW: { mean: 12, variance: 35 },
    SM: { mean: 8, variance: 25 },
    KL: { mean: 10, variance: 20 },
    SL: { mean: 18, variance: 55 },
    NT: { mean: 3, variance: 10 },
    PM: { mean: 15, variance: 30 },
  }[regionCode] || { mean: 10, variance: 20 };
}

function generateSyntheticForecast(regionCode) {
  const forecasts = [];

  for (let i = 0; i <= 14; i++) {
    const profile = getMockRainProfile(regionCode);
    const date = new Date();
    date.setDate(date.getDate() + i);
    const rainfall = Math.max(0, profile.mean + (Math.random() * profile.variance - profile.variance / 4));

    forecasts.push({
      date: date.toISOString().slice(0, 10),
      temperature_c: Number((24 + Math.random() * 8).toFixed(1)),
      rainfall_mm: Number(rainfall.toFixed(1)),
      humidity_pct: Number((65 + Math.random() * 25).toFixed(1)),
      wind_speed_mps: Number((2 + Math.random() * 10).toFixed(1)),
      weather_code: rainfall > 30 ? 'heavy_rain' : rainfall > 10 ? 'moderate_rain' : 'cloudy',
    });
  }

  return forecasts;
}

function weatherDescToRainfall(weatherDesc = '') {
  const desc = weatherDesc.toLowerCase();
  if (desc.includes('petir')) return 55;
  if (desc.includes('hujan lebat')) return 35;
  if (desc.includes('hujan sedang')) return 18;
  if (desc.includes('hujan ringan')) return 8;
  if (desc.includes('hujan')) return 12;
  if (desc.includes('berawan tebal')) return 3;
  if (desc.includes('berawan')) return 1;
  return 0;
}

function weatherDescToCode(weatherDesc = '') {
  const desc = weatherDesc.toLowerCase();
  if (desc.includes('petir')) return 'storm';
  if (desc.includes('hujan lebat')) return 'heavy_rain';
  if (desc.includes('hujan')) return 'moderate_rain';
  if (desc.includes('berawan')) return 'cloudy';
  return 'clear';
}

function toMetersPerSecond(kmhValue) {
  const kmh = Number(kmhValue || 0);
  return Number((kmh / 3.6).toFixed(1));
}

function normalizeCuacaPayload(payload) {
  const dailyBuckets = payload?.data?.[0]?.cuaca;
  if (!Array.isArray(dailyBuckets)) return [];

  return dailyBuckets.flatMap((bucket) => {
    if (!Array.isArray(bucket) || bucket.length === 0) return [];

    const byDay = new Map();

    for (const item of bucket) {
      const day = String(item.local_datetime || item.utc_datetime || '').slice(0, 10);
      if (!day) continue;

      const existing = byDay.get(day) || {
        day,
        temperatures: [],
        humidities: [],
        winds: [],
        rainfalls: [],
        descriptions: [],
      };

      existing.temperatures.push(Number(item.t || 0));
      existing.humidities.push(Number(item.hu || 0));
      existing.winds.push(toMetersPerSecond(item.ws));
      existing.rainfalls.push(weatherDescToRainfall(item.weather_desc));
      existing.descriptions.push(item.weather_desc || '');
      byDay.set(day, existing);
    }

    return [...byDay.values()].map((entry) => {
      const avg = (values) => values.reduce((sum, value) => sum + value, 0) / (values.length || 1);
      const maxRain = Math.max(...entry.rainfalls, 0);
      const dominantDesc = entry.descriptions.sort((a, b) => weatherDescToRainfall(b) - weatherDescToRainfall(a))[0] || '';

      return {
        date: entry.day,
        temperature_c: Number(avg(entry.temperatures).toFixed(1)),
        rainfall_mm: Number(maxRain.toFixed(1)),
        humidity_pct: Number(avg(entry.humidities).toFixed(1)),
        wind_speed_mps: Number(avg(entry.winds).toFixed(1)),
        weather_code: weatherDescToCode(dominantDesc),
      };
    });
  });
}

async function fetchRealForecastForAdm4(adm4Code) {
  const response = await axios.get(BMKG_FORECAST_API_URL, {
    params: { adm4: adm4Code },
    timeout: 30000,
  });
  return normalizeCuacaPayload(response.data);
}

function mergeForecasts(forecastSets) {
  const grouped = new Map();

  for (const forecasts of forecastSets) {
    for (const forecast of forecasts) {
      const key = forecast.date;
      const existing = grouped.get(key) || {
        date: forecast.date,
        temperatures: [],
        rainfalls: [],
        humidities: [],
        winds: [],
        codes: [],
      };

      existing.temperatures.push(forecast.temperature_c);
      existing.rainfalls.push(forecast.rainfall_mm);
      existing.humidities.push(forecast.humidity_pct);
      existing.winds.push(forecast.wind_speed_mps);
      existing.codes.push(forecast.weather_code);
      grouped.set(key, existing);
    }
  }

  return [...grouped.values()]
    .map((entry) => {
      const avg = (values) => values.reduce((sum, value) => sum + value, 0) / (values.length || 1);
      const highestCode = entry.codes.sort((a, b) => weatherDescToRainfall(b) - weatherDescToRainfall(a))[0] || 'clear';

      return {
        date: entry.date,
        temperature_c: Number(avg(entry.temperatures).toFixed(1)),
        rainfall_mm: Number(Math.max(...entry.rainfalls, 0).toFixed(1)),
        humidity_pct: Number(avg(entry.humidities).toFixed(1)),
        wind_speed_mps: Number(avg(entry.winds).toFixed(1)),
        weather_code: highestCode,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchBMKGForecast(regionCode) {
  if (!USE_REAL_WEATHER_DATA) {
    if (ALLOW_SYNTHETIC_FALLBACK) return generateSyntheticForecast(regionCode);
    throw new Error('BMKG real-time weather data is disabled and synthetic fallback is not allowed');
  }

  const adm4Codes = getAdm4Codes()[regionCode] || [];
  if (adm4Codes.length === 0) {
    if (USE_MOCK && ALLOW_SYNTHETIC_FALLBACK) return generateSyntheticForecast(regionCode);
    throw new Error(`No BMKG adm4 codes configured for ${regionCode}`);
  }

  try {
    const forecastSets = [];
    for (const adm4Code of adm4Codes) {
      const forecasts = await fetchRealForecastForAdm4(adm4Code);
      if (forecasts.length > 0) forecastSets.push(forecasts);
    }

    if (forecastSets.length === 0) {
      throw new Error(`BMKG returned no forecast data for ${regionCode}`);
    }

    return mergeForecasts(forecastSets);
  } catch (error) {
    if (!USE_MOCK || !ALLOW_SYNTHETIC_FALLBACK) throw error;
    console.warn(`[BMKG] Real forecast failed for ${regionCode}, using explicitly enabled forecast fallback:`, error.message);
    return generateSyntheticForecast(regionCode);
  }
}

function getRainfallNormal(regionCode, month) {
  const normals = {
    JW: [250, 230, 200, 150, 80, 30, 20, 20, 40, 100, 180, 230],
    SM: [200, 190, 200, 200, 200, 180, 150, 140, 160, 200, 230, 210],
    KL: [220, 210, 230, 240, 220, 180, 160, 150, 180, 220, 250, 230],
    SL: [160, 140, 130, 100, 70, 50, 40, 30, 50, 90, 130, 160],
    NT: [80, 70, 60, 40, 20, 10, 5, 5, 10, 30, 50, 70],
    PM: [300, 280, 270, 250, 220, 200, 180, 180, 200, 250, 290, 310],
  };

  return normals[regionCode]?.[month - 1] || 150;
}

function getAlertSeverity(title = '', description = '') {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('ekstrem') || text.includes('lebat') || text.includes('sangat')) return 'emergency';
  if (text.includes('waspada') || text.includes('siaga')) return 'warning';
  return 'watch';
}

function getAlertType(title = '', description = '') {
  const text = `${title} ${description}`.toLowerCase();
  if (text.includes('banjir')) return 'flood';
  if (text.includes('kekeringan')) return 'drought';
  if (text.includes('angin')) return 'wind';
  if (text.includes('gelombang')) return 'storm';
  return 'weather';
}

function normalizeAlerts(items) {
  return items
    .map((item) => {
      const title = item.title || '';
      const description = item.description || '';
      const regionCode = Object.entries(ALERT_REGION_BY_PROVINCE).find(([province]) => title.includes(province) || description.includes(province))?.[1];
      if (!regionCode) return null;

      return {
        region_code: regionCode,
        title,
        description,
        severity: getAlertSeverity(title, description),
        alert_type: getAlertType(title, description),
        issued_at: item.pubDate ? new Date(item.pubDate) : new Date(),
      };
    })
    .filter(Boolean);
}

async function fetchRealAlerts() {
  const response = await axios.get(BMKG_ALERTS_RSS_URL, { timeout: 30000 });
  const parsed = xmlParser.parse(response.data);
  const channel = parsed?.rss?.channel || parsed?.feed;
  const items = Array.isArray(channel?.item) ? channel.item : channel?.item ? [channel.item] : [];
  return normalizeAlerts(items);
}

async function refreshWeatherAlerts(regionMap) {
  let alerts = [];

  if (USE_REAL_WEATHER_DATA) {
    try {
      alerts = await fetchRealAlerts();
    } catch (error) {
      console.warn('[BMKG] Failed to refresh real alerts:', error.message);
    }
  }

  await query(`
    UPDATE weather_alerts
    SET is_active = FALSE
    WHERE is_active = TRUE
  `);

  for (const alert of alerts) {
    const regionId = regionMap[alert.region_code];
    if (!regionId) continue;

    await query(`
      INSERT INTO weather_alerts
        (region_id, alert_type, severity, title, description, issued_at, valid_until, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
    `, [
      regionId,
      alert.alert_type,
      alert.severity,
      alert.title,
      alert.description,
      alert.issued_at,
      new Date(alert.issued_at.getTime() + 12 * 60 * 60 * 1000),
    ]);
  }
}

async function updateRiskScore(region, forecasts, rainfallDev) {
  const commodities = await query(`
    WITH latest_period AS (
      SELECT MAX(sd.period_month) AS period_month
      FROM supply_demand sd
      JOIN commodities c ON sd.commodity_id = c.id
      WHERE c.code = 'BERAS'
        AND sd.region_id = $1
        AND sd.period_month <= DATE_TRUNC('month', NOW())
    )
    SELECT c.id, COALESCE(sd.production_ton, 0) AS production_ton
    FROM commodities c
    LEFT JOIN supply_demand sd
      ON sd.commodity_id = c.id
     AND sd.region_id = $1
     AND sd.period_month = (SELECT period_month FROM latest_period)
    WHERE c.code = 'BERAS'
  `, [region.id]);

  const avgRainfallMm = forecasts.reduce((sum, item) => sum + Number(item.rainfall_mm || 0), 0) / (forecasts.length || 1);
  const maxRainfallMm = forecasts.reduce((max, item) => Math.max(max, Number(item.rainfall_mm || 0)), 0);

  for (const commodity of commodities) {
    const risk = computeRiskScore({
      rainfallDev,
      avgRainfallMm,
      maxRainfallMm,
      ensoPhase: 'weak_la_nina',
    });
    const loss = estimateHarvestLoss(risk.score, Number(commodity.production_ton || 0));
    const notes = rainfallDev >= 20
      ? `Curah hujan prakiraan ${Math.round(rainfallDev)}% di atas normal bulanan dengan puncak ${Math.round(maxRainfallMm)} mm/hari.`
      : rainfallDev <= -20
        ? `Curah hujan prakiraan ${Math.round(Math.abs(rainfallDev))}% di bawah normal bulanan dengan rata-rata ${Math.round(avgRainfallMm)} mm/hari.`
        : `Variabilitas hujan masih moderat dengan puncak ${Math.round(maxRainfallMm)} mm/hari.`;

    await query(`
      INSERT INTO harvest_risk_scores
        (region_id, commodity_id, risk_score, risk_level, rainfall_dev, flood_risk, drought_index, elnino_phase, estimated_loss_ton, estimated_loss_pct, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'weak_la_nina', $8, $9, $10)
    `, [
      region.id,
      commodity.id,
      risk.score,
      risk.level,
      Number(rainfallDev.toFixed(2)),
      risk.floodRisk,
      risk.droughtRisk,
      loss.loss_ton,
      loss.loss_pct,
      notes,
    ]);
  }
}

export async function pollWeatherData() {
  const regions = await query('SELECT id, code FROM regions');
  const regionMap = Object.fromEntries(regions.map((region) => [region.code, region.id]));
  const currentMonth = new Date().getMonth() + 1;
  let updated = 0;

  for (const region of regions) {
    try {
      const forecasts = await fetchBMKGForecast(region.code);
      const normal = getRainfallNormal(region.code, currentMonth);

      for (const forecast of forecasts) {
        await query(`
          INSERT INTO weather_forecasts
            (region_id, forecast_date, temperature_c, rainfall_mm, humidity_pct, wind_speed_mps, weather_code, source)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'bmkg')
          ON CONFLICT (region_id, forecast_date) DO UPDATE SET
            temperature_c = EXCLUDED.temperature_c,
            rainfall_mm = EXCLUDED.rainfall_mm,
            humidity_pct = EXCLUDED.humidity_pct,
            wind_speed_mps = EXCLUDED.wind_speed_mps,
            weather_code = EXCLUDED.weather_code,
            source = EXCLUDED.source,
            fetched_at = NOW()
        `, [
          region.id,
          forecast.date,
          forecast.temperature_c,
          forecast.rainfall_mm,
          forecast.humidity_pct,
          forecast.wind_speed_mps,
          forecast.weather_code,
        ]);
        updated++;
      }

      const avgForecastRain = forecasts.reduce((sum, forecast) => sum + Number(forecast.rainfall_mm || 0), 0) / (forecasts.length || 1);
      const rainfallDev = ((avgForecastRain - normal) / normal) * 100;
      await updateRiskScore(region, forecasts, rainfallDev);
    } catch (error) {
      console.error(`[BMKG] Error processing region ${region.code}:`, error.message);
    }
  }

  await refreshWeatherAlerts(regionMap);
  await invalidate('weather:*');
  console.log(`[BMKG] Updated ${updated} forecast records`);
}
