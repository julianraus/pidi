import { fetchBiProvinces, fetchBiGridData } from './biPriceService.js';
import { db, query } from '../db.js';

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS province_price_snapshot (
    province        VARCHAR(60) NOT NULL,
    commodity_code  VARCHAR(20) NOT NULL,
    price_idr       DECIMAL(12,2) NOT NULL,
    price_source    VARCHAR(20) NOT NULL DEFAULT 'bi',
    as_of           DATE NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (province, commodity_code)
  )
`;

export async function ensureProvincePriceTable() {
  await db.query(CREATE_TABLE);
}

export async function readProvincePriceSnapshot(commodityCode = 'BERAS') {
  return query(
    `SELECT province, commodity_code, price_idr, price_source, as_of, updated_at
       FROM province_price_snapshot WHERE commodity_code = $1 ORDER BY province`,
    [commodityCode]
  );
}

// Fetch from BI + upsert into the snapshot table. Returns number of rows written.
// Never wipes existing rows when BI returns nothing (keeps last-known-good).
export async function refreshProvincePriceSnapshot({ commodityCode = 'BERAS' } = {}) {
  await ensureProvincePriceTable();
  const rowName = commodityCode === 'BERAS' ? 'Beras' : commodityCode;
  const snap = await fetchProvinceBiPriceSnapshot({ commodityRowName: rowName, commodityCode });
  if (snap.provinces.length === 0) return 0;

  let written = 0;
  for (const p of snap.provinces) {
    const [d, m, y] = p.as_of.split('/');
    const asOf = `${y}-${m}-${d}`;
    await db.query(
      `INSERT INTO province_price_snapshot (province, commodity_code, price_idr, price_source, as_of, updated_at)
       VALUES ($1,$2,$3,'bi',$4,NOW())
       ON CONFLICT (province, commodity_code)
       DO UPDATE SET price_idr = EXCLUDED.price_idr, as_of = EXCLUDED.as_of, updated_at = NOW()`,
      [p.province, p.commodity_code, p.price_idr, asOf]
    );
    written += 1;
  }
  return written;
}

// Peta nama provinsi BI -> nama provinsi di GeoJSON peta (frontend).
// Sebagian besar identik; hanya beberapa perlu penyeragaman ejaan.
const BI_NAME_TO_GEO = {
  'DKI Jakarta': 'DKI Jakarta',
  'DI Yogyakarta': 'DI Yogyakarta',
  'Daerah Istimewa Yogyakarta': 'DI Yogyakarta',
  'Kepulauan Bangka Belitung': 'Kepulauan Bangka Belitung',
  'Bangka Belitung': 'Kepulauan Bangka Belitung',
  'Kepulauan Riau': 'Kepulauan Riau',
};

function geoName(biName) {
  return BI_NAME_TO_GEO[biName] || biName;
}

function parsePrice(value) {
  if (value == null || value === '' || value === '-') return null;
  const normalized = String(value).replace(/\./g, '').replace(/,/g, '').trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

// Ambil harga terisi paling akhir dari satu baris grid (kolom = tanggal dd/mm/yyyy).
function latestFilledPrice(row) {
  const dated = Object.keys(row)
    .filter((k) => /^\d{2}\/\d{2}\/\d{4}$/.test(k))
    .sort((a, b) => {
      const [da, ma, ya] = a.split('/');
      const [db, mb, yb] = b.split('/');
      return new Date(`${ya}-${ma}-${da}`) - new Date(`${yb}-${mb}-${db}`);
    });
  for (let i = dated.length - 1; i >= 0; i--) {
    const price = parsePrice(row[dated[i]]);
    if (price != null) return { price, date: dated[i] };
  }
  return null;
}

/**
 * Snapshot harga per provinsi untuk satu komoditas (default Beras), langsung
 * dari BI Harga Pangan tanpa agregasi ke 6 wilayah. Dipakai untuk mewarnai
 * peta choropleth per provinsi. Dijalankan berkala oleh script populate,
 * bukan per-request, karena butuh 34 panggilan berurutan ke BI.
 *
 * @returns {Promise<{as_of:string, commodity:string, provinces:Array}>}
 */
export async function fetchProvinceBiPriceSnapshot({
  commodityRowName = 'Beras',
  commodityCode = 'BERAS',
  lookbackDays = 14,
} = {}) {
  const provinces = await fetchBiProvinces();
  const end = new Date();
  const start = new Date(end.getTime() - lookbackDays * 86400000);

  const results = [];
  for (const province of provinces) {
    if (!province?.id || !province?.name) continue;
    try {
      const rows = await fetchBiGridData({
        provinceId: province.id,
        startDate: start,
        endDate: end,
        priceTypeId: 1,
      });
      const row = rows.find((r) => r?.level === 1 && r?.name === commodityRowName);
      if (!row) continue;
      const latest = latestFilledPrice(row);
      if (!latest) continue;
      results.push({
        province: geoName(province.name),
        bi_province: province.name,
        commodity_code: commodityCode,
        price_idr: latest.price,
        as_of: latest.date,
      });
    } catch (error) {
      console.warn(`[BI-Snapshot] Skip province ${province.name}: ${error.message}`);
    }
  }

  return {
    as_of: new Date().toISOString().slice(0, 10),
    commodity: commodityCode,
    provinces: results,
  };
}
