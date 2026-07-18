import axios from 'axios';

const BI_BASE_URL = process.env.BI_HARGAPANGAN_URL || 'https://www.bi.go.id/hargapangan/WebSite/TabelHarga';

const REGION_BY_PROVINCE = {
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

const COMMODITY_NAME_TO_CODE = {
  Beras: 'BERAS',
  'Bawang Merah': 'BAWANG',
  'Cabai Merah': 'CABAI',
  'Minyak Goreng': 'MINYAK',
  'Gula Pasir': 'GULA',
  'Daging Sapi': 'DAGING',
};

const BI_CHART_CONFIGS = [
  { comcat_id: '', province_id: '' },
  { comcat_id: '1', province_id: '0' },
  { comcat_id: '2', province_id: '0' },
  { comcat_id: '3', province_id: '0' },
  { comcat_id: '1', province_id: '' },
];

function createBiClient() {
  return axios.create({
    baseURL: BI_BASE_URL,
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; FoodSecurityBot/1.0)',
      Referer: 'https://www.bi.go.id/hargapangan/',
      Accept: 'application/json, text/plain, */*',
    },
  });
}

function toIsoDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function parsePrice(value) {
  if (value == null || value === '') return null;
  const normalized = String(value).replace(/\./g, '').replace(/,/g, '').trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBiDate(value) {
  const [day, month, year] = String(value).split('/');
  if (!day || !month || !year) return null;
  const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  return new Date(`${iso}T00:00:00.000Z`);
}

function normalizeRegionCode(provinceName) {
  return REGION_BY_PROVINCE[provinceName] || null;
}

function normalizeCommodityCode(name) {
  return COMMODITY_NAME_TO_CODE[name] || null;
}

function parseGridRows(rows, provinceName, priceLevel = 'consumer') {
  const regionCode = normalizeRegionCode(provinceName);
  if (!regionCode || !Array.isArray(rows)) return [];

  const records = [];

  for (const row of rows) {
    if (row?.level !== 1) continue;

    const commodityCode = normalizeCommodityCode(row.name);
    if (!commodityCode) continue;

    for (const [key, rawValue] of Object.entries(row)) {
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(key)) continue;
      const time = parseBiDate(key);
      const priceIdr = parsePrice(rawValue);

      if (!time || !priceIdr) continue;

      records.push({
        time,
        region_code: regionCode,
        commodity_code: commodityCode,
        price_idr: priceIdr,
        price_source: 'bi',
        price_level: priceLevel,
        source_detail: provinceName,
      });
    }
  }

  return records;
}

function parseChartPayload(payload) {
  const dates = Array.isArray(payload?.categories) ? payload.categories : [];
  const series = Array.isArray(payload?.series) ? payload.series : [];
  const records = [];

  for (const item of series) {
    const commodityCode = normalizeCommodityCode(item?.name);
    const values = Array.isArray(item?.data) ? item.data : [];
    if (!commodityCode) continue;

    values.forEach((rawValue, index) => {
      const time = parseBiDate(dates[index]);
      const priceIdr = parsePrice(rawValue);
      if (!time || !priceIdr) return;

      records.push({
        time,
        commodity_code: commodityCode,
        price_idr: priceIdr,
        price_source: 'bi_chart_national',
        source_detail: 'BI Harga Pangan national chart',
      });
    });
  }

  return records;
}

function aggregateRegionalPrices(records) {
  const grouped = new Map();

  for (const record of records) {
    const day = record.time.toISOString().slice(0, 10);
    const priceLevel = record.price_level || 'consumer';
    const key = `${day}:${record.region_code}:${record.commodity_code}:${priceLevel}`;
    const existing = grouped.get(key) || {
      time: new Date(`${day}T00:00:00.000Z`),
      region_code: record.region_code,
      commodity_code: record.commodity_code,
      price_level: priceLevel,
      prices: [],
      sources: [],
    };

    existing.prices.push(record.price_idr);
    existing.sources.push(record.source_detail);
    grouped.set(key, existing);
  }

  return [...grouped.values()].map((entry) => ({
    time: entry.time,
    region_code: entry.region_code,
    commodity_code: entry.commodity_code,
    price_idr: Math.round(entry.prices.reduce((sum, value) => sum + value, 0) / entry.prices.length),
    price_source: 'bi',
    price_level: entry.price_level,
    source_detail: `${entry.sources.length} provinces`,
  }));
}

export async function fetchBiProvinces() {
  const client = createBiClient();
  const response = await client.get('/GetRefProvince');
  return Array.isArray(response.data?.data) ? response.data.data : [];
}

export async function fetchBiGridData({
  provinceId = '',
  startDate,
  endDate,
  priceTypeId = 1,
  reportType = 1,
}) {
  const client = createBiClient();
  const response = await client.get('/GetGridDataDaerah', {
    params: {
      price_type_id: priceTypeId,
      comcat_id: '',
      province_id: provinceId,
      regency_id: '',
      market_id: '',
      tipe_laporan: reportType,
      start_date: toIsoDate(startDate),
      end_date: toIsoDate(endDate),
    },
  });

  return Array.isArray(response.data?.data) ? response.data.data : [];
}

export async function fetchBiChartData({
  startDate,
  endDate,
  priceTypeId = 1,
  reportType = 1,
  comcatId = '',
  provinceId = '',
}) {
  const client = createBiClient();
  const response = await client.get('/GetChartDaerah', {
    params: {
      price_type_id: priceTypeId,
      comcat_id: comcatId,
      province_id: provinceId,
      regency_id: '',
      market_id: '',
      tipe_laporan: reportType,
      start_date: toIsoDate(startDate),
      end_date: toIsoDate(endDate),
    },
  });

  return response.data;
}

// BI Harga Pangan price_type_id: 1 = Pasar Tradisional (consumer), 4 = Produsen.
export async function fetchRegionalBiPriceSeries({ startDate, endDate, priceTypeId = 1, priceLevel = 'consumer' }) {
  const provinces = await fetchBiProvinces();
  const allRecords = [];

  for (const province of provinces) {
    if (!province?.id || !province?.name) continue;
    const rows = await fetchBiGridData({
      provinceId: province.id,
      startDate,
      endDate,
      priceTypeId,
    });
    allRecords.push(...parseGridRows(rows, province.name, priceLevel));
  }

  return aggregateRegionalPrices(allRecords);
}

export async function fetchRegionalBiProducerPriceSeries({ startDate, endDate }) {
  return fetchRegionalBiPriceSeries({ startDate, endDate, priceTypeId: 4, priceLevel: 'producer' });
}

export async function fetchNationalBiChartPriceSeries({ startDate, endDate }) {
  for (const config of BI_CHART_CONFIGS) {
    const payload = await fetchBiChartData({
      startDate,
      endDate,
      comcatId: config.comcat_id,
      provinceId: config.province_id,
    });
    const records = parseChartPayload(payload);
    if (records.length > 0) return records;
  }

  return [];
}
