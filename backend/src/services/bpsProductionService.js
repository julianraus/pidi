import axios from 'axios';

const BPS_API_URL = process.env.BPS_API_URL || 'https://webapi.bps.go.id/v1/api';
const BPS_API_KEY = process.env.BPS_API_KEY;

// BPS dynamic-table variable ids under subject "Tanaman Pangan" (sub_id 53).
// Discovered via list/model/var/.../subject/53 - verified live 2026-07-19.
const PRODUCTION_VAR_BY_COMMODITY = {
  BERAS: 2506,  // Produksi Padi Menurut Provinsi (Bulanan), Ton
  JAGUNG: 2507, // Produksi Jagung Pipilan KA 14% Menurut Provinsi (Bulanan), Ton
};

// BPS vervar (province) codes -> Kepang AI region codes. Mirrors the
// grouping already used for BI/BMKG province maps, keyed by BPS's own
// numeric province code instead of name string (avoids name/casing drift).
const BPS_PROVINCE_TO_REGION = {
  1100: 'SM', 1200: 'SM', 1300: 'SM', 1400: 'SM', 1500: 'SM', 1600: 'SM',
  1700: 'SM', 1800: 'SM', 1900: 'SM', 2100: 'SM',
  3100: 'JW', 3200: 'JW', 3300: 'JW', 3400: 'JW', 3500: 'JW', 3600: 'JW',
  5100: 'NT', 5200: 'NT', 5300: 'NT',
  6100: 'KL', 6200: 'KL', 6300: 'KL', 6400: 'KL', 6500: 'KL',
  7100: 'SL', 7200: 'SL', 7300: 'SL', 7400: 'SL', 7500: 'SL', 7600: 'SL',
  8100: 'PM', 8200: 'PM', 9100: 'PM', 9200: 'PM', 9400: 'PM', 9500: 'PM', 9600: 'PM', 9700: 'PM',
};

function bpsClient() {
  return axios.create({
    baseURL: BPS_API_URL,
    timeout: 20000,
    // BPS WebAPI's WAF blocks requests without a browser-like User-Agent,
    // independent of key validity (verified 2026-07-18).
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FoodSecurityBot/1.0)' },
  });
}

async function fetchAvailableYears(varId) {
  const client = bpsClient();
  const resp = await client.get(`/list/model/th/lang/ind/domain/0000/var/${varId}/key/${BPS_API_KEY}`);
  const rows = Array.isArray(resp.data?.data?.[1]) ? resp.data.data[1] : [];
  return rows.map((row) => ({ thId: row.th_id, year: Number(row.th) }));
}

// Decodes BPS's composite datacontent key: vervar(4) + var(4) + turvar(1) + th(3) + turtahun(1-2)
function parseDataContentKey(key, varId, thId) {
  const varStr = String(varId);
  const thStr = String(thId);
  const marker = `${varStr}0${thStr}`;
  const markerIndex = key.indexOf(marker);
  if (markerIndex === -1) return null;

  const vervar = Number(key.slice(0, markerIndex));
  const turtahun = Number(key.slice(markerIndex + marker.length));
  if (!Number.isFinite(vervar) || !Number.isFinite(turtahun)) return null;

  return { vervar, turtahun };
}

async function fetchMonthlyProductionForYear(varId, thId, year) {
  const client = bpsClient();
  const resp = await client.get(`/list/model/data/lang/ind/domain/0000/var/${varId}/th/${thId}/key/${BPS_API_KEY}`);
  const payload = resp.data;
  if (payload?.status !== 'OK' || !payload?.datacontent) return [];

  const records = [];
  for (const [key, rawValue] of Object.entries(payload.datacontent)) {
    const parsed = parseDataContentKey(key, varId, thId);
    if (!parsed) continue;
    const { vervar, turtahun } = parsed;
    if (turtahun < 1 || turtahun > 12) continue; // skip annual aggregate (13) and national total handled via vervar
    const regionCode = BPS_PROVINCE_TO_REGION[vervar];
    if (!regionCode) continue; // skips 9999 (national) and any unmapped province

    const productionTon = Number(rawValue);
    if (!Number.isFinite(productionTon)) continue;

    records.push({
      region_code: regionCode,
      period_month: `${year}-${String(turtahun).padStart(2, '0')}-01`,
      production_ton: productionTon,
    });
  }
  return records;
}

function aggregateByRegionMonth(records) {
  const grouped = new Map();
  for (const record of records) {
    const key = `${record.period_month}:${record.region_code}`;
    grouped.set(key, (grouped.get(key) || 0) + record.production_ton);
  }
  return [...grouped.entries()].map(([key, production_ton]) => {
    const [period_month, region_code] = key.split(':');
    return { period_month, region_code, production_ton: Math.round(production_ton * 100) / 100 };
  });
}

// Fetches real BPS monthly production for a commodity, aggregated from
// province-level to Kepang AI's 6 regions, across all years BPS exposes for
// this variable (currently 2025-2026 for the monthly series).
export async function fetchBpsMonthlyProduction(commodityCode) {
  const varId = PRODUCTION_VAR_BY_COMMODITY[commodityCode];
  if (!varId || !BPS_API_KEY) return [];

  const years = await fetchAvailableYears(varId);
  const allRecords = [];
  for (const { thId, year } of years) {
    const records = await fetchMonthlyProductionForYear(varId, thId, year);
    allRecords.push(...records);
  }
  return aggregateByRegionMonth(allRecords);
}
