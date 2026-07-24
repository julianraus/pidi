import { useMemo, useState } from 'react';
import './Dashboard.css';
import { useData } from '../hooks/useData.js';
import { supplyApi, weatherApi, pricesApi, logisticsApi, forecastApi } from '../api.js';
import { ChoroplethMap, LoadingSpinner, AlertBanner } from '../components/shared/index.jsx';

/*
 * Cockpit — Industry design system, wired to live backend data.
 * Visual system (blueprint frame, Barlow, tags) from the Claude Design handoff;
 * data surfaces (metrics, tables, national map, source health) read live via
 * useData with the app's DASHBOARD_FALLBACK when the backend is cold.
 * Role switcher + scenario simulator are the interactive decision-framing layer.
 */

const RUPIAH = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const K = (n) => (n >= 0 ? '+' : '') + Math.round(n / 1000) + 'K';
const RIBU = (n) => (Number(n) / 1000).toFixed(0) + ' rb ton';
const CIRC = 2 * Math.PI * 56;
const pct1 = (v) => (v == null ? '-' : (Number(v) > 0 ? '+' : '') + Number(v).toFixed(1).replace('.', ',') + '%');

const ROLE_DEFS = [
  { id: 'tpid', label: 'TPID', owner: 'TPID / Pemda', focus: 'Intervensi harga',
    headline: 'Tetapkan prioritas intervensi harga & wilayah minggu ini',
    rationale: 'Volatile food di atas inflasi umum dengan cabai & bawang di atas HET — fokuskan operasi pasar dan pemantauan wilayah defisit.' },
  { id: 'bulog', label: 'Bulog', owner: 'Bulog / Bapanas', focus: 'Buffer & redistribusi',
    headline: 'Tentukan penempatan buffer stok & rencana redistribusi',
    rationale: 'Wilayah defisit dan risiko panen menuntut pre-positioning stok sebelum tekanan harga lokal membesar.' },
  { id: 'bi', label: 'BI Regional', owner: 'BI Regional', focus: 'Koordinasi inflasi',
    headline: 'Susun evidence koordinasi inflasi pangan & eksposur kurs',
    rationale: 'Pelemahan rupiah menaikkan eksposur imported inflation pada kedelai, bawang putih, dan daging sapi.' },
  { id: 'logistik', label: 'Logistik', owner: 'Operator logistik', focus: 'Rute & biaya',
    headline: 'Optimalkan rute, kapasitas, dan biaya distribusi per ton',
    rationale: 'Efisiensi rute antar-pulau yang rendah menyisakan ruang penghematan lewat backhaul dan konsolidasi muatan.' },
];

const ACTIONS = [
  { title: 'Pre-positioning stok ke wilayah defisit', owner: 'Bulog, TPID, Dinas Pangan', timeframe: '0–14 hari',
    kpi: 'Gap pasokan wilayah turun ≥30%', roles: ['bulog', 'tpid'],
    rationale: 'Wilayah defisit perlu buffer stok sebelum tekanan harga lokal membesar; redistribusi dari wilayah surplus paling murah.' },
  { title: 'Mitigasi risiko panen di wilayah risiko tinggi', owner: 'Dinas Pertanian, BMKG, penyuluh', timeframe: '0–21 hari',
    kpi: 'Alert tervalidasi & mitigasi aktif', roles: ['bulog', 'tpid'],
    rationale: 'Risiko cuaca ditutup dengan validasi lapangan, buffer stok, dan kesiapan redistribusi.' },
  { title: 'Pantau komoditas impor sensitif kurs', owner: 'TPID, Bapanas, Disperindag', timeframe: '0–7 hari',
    kpi: 'Anomali harga turun / pasokan naik', roles: ['bi', 'tpid'],
    rationale: 'Kedelai, bawang putih, dan daging sapi rentan imported inflation saat rupiah melemah.' },
  { title: 'Optimalkan rute biaya rendah & backhaul', owner: 'Operator logistik, Bulog, pelabuhan', timeframe: '14–30 hari',
    kpi: 'Biaya distribusi per ton turun 5–10%', roles: ['logistik', 'bulog'],
    rationale: 'Penghematan biaya distribusi menjaga harga akhir ketika kurs dan energi menekan biaya.' },
];

const CONF_W = { 'real-time': 100, 'official-release': 88, forecast: 62, unavailable: 28 };
const STATUS_TAG = { 'official-release': 'tag tag-accent', forecast: 'tag tag-neutral', unavailable: 'tag tag-outline', 'real-time': 'tag tag-accent' };
const STATUS_DOT = { 'official-release': 'var(--color-accent)', forecast: 'var(--color-accent-400)', unavailable: 'var(--color-neutral-400)', 'real-time': 'var(--color-accent)' };
const REGION_TAG = { surplus: 'tag tag-accent', balanced: 'tag tag-neutral', deficit: 'tag tag-outline' };
const REGION_LABEL = { surplus: 'Surplus', balanced: 'Seimbang', deficit: 'Defisit' };
const FRESHNESS = {
  'Harga pangan': 'BI Harga Pangan',
  'Cuaca': 'BMKG prakiraan',
  'Supply-demand dan stok': 'Produksi BPS + neraca',
  'Rute logistik dan biaya': 'Estimasi rute',
  'Makro rupiah dan inflasi': 'Rilis BPS / BI',
};

const levelOf = (v) => v >= 78 ? 'Aman' : v >= 65 ? 'Waspada' : v >= 52 ? 'Siaga 1' : v >= 40 ? 'Siaga 2' : 'Kritis';
const Corners = () => (<><i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" /></>);

const DASHBOARD_FALLBACK = {
  balance: { period_month: '2026-06-01', total_supply: 4520000, total_demand: 4380000, total_balance: 140000, deficit_regions: 2 },
  regions: [
    { id: 'fb-1', code: 'SUM', region_name: 'Sumatera', supply_ton: 780000, demand_ton: 710000, balance_ton: 70000, status: 'surplus' },
    { id: 'fb-2', code: 'JAW', region_name: 'Jawa', supply_ton: 1880000, demand_ton: 1820000, balance_ton: 60000, status: 'surplus' },
    { id: 'fb-3', code: 'KAL', region_name: 'Kalimantan', supply_ton: 410000, demand_ton: 390000, balance_ton: 20000, status: 'balanced' },
    { id: 'fb-4', code: 'SUL', region_name: 'Sulawesi', supply_ton: 620000, demand_ton: 610000, balance_ton: 10000, status: 'balanced' },
    { id: 'fb-5', code: 'BNT', region_name: 'Bali & Nusa Tenggara', supply_ton: 310000, demand_ton: 360000, balance_ton: -50000, status: 'deficit' },
    { id: 'fb-6', code: 'PMA', region_name: 'Papua & Maluku', supply_ton: 520000, demand_ton: 490000, balance_ton: 30000, status: 'surplus' },
  ],
  commodities: [
    { id: 'fc-1', name: 'Cabai Merah', current_price: 79000, change_mom_pct: 8.4, pct_of_het: 124 },
    { id: 'fc-2', name: 'Bawang Merah', current_price: 47000, change_mom_pct: 5.1, pct_of_het: 112 },
    { id: 'fc-3', name: 'Minyak Goreng', current_price: 18100, change_mom_pct: 2.6, pct_of_het: 106 },
    { id: 'fc-4', name: 'Beras Medium', current_price: 14200, change_mom_pct: 1.8, pct_of_het: 101 },
  ],
  risks: [
    { code: 'SUL', region_name: 'Sulawesi', risk_score: 66, risk_level: 'high' },
    { code: 'BNT', region_name: 'Bali & Nusa Tenggara', risk_score: 58, risk_level: 'medium' },
  ],
  resilience: {
    macro: { usd_idr: 17944, usd_idr_change_ptp_pct: 1.4, volatile_food_yoy_pct: 5.58 },
    summary: { resilience_score: 63 },
    data_provenance: [
      { dataset: 'Harga pangan', status: 'forecast' },
      { dataset: 'Cuaca', status: 'forecast' },
      { dataset: 'Supply-demand dan stok', status: 'unavailable' },
      { dataset: 'Rute logistik dan biaya', status: 'unavailable' },
      { dataset: 'Makro rupiah dan inflasi', status: 'official-release' },
    ],
  },
};

export default function Dashboard() {
  const { data: balanceRaw } = useData(() => supplyApi.getBalance(), [], { pollInterval: 300000 });
  const { data: alertsRaw } = useData(() => weatherApi.getAlerts(), [], { pollInterval: 600000 });
  const { data: risksRaw } = useData(() => weatherApi.getRisk(), [], { pollInterval: 600000 });
  const { data: commoditiesRaw } = useData(() => pricesApi.getCommodities(), [], { pollInterval: 600000 });
  const { data: regionsRaw } = useData(() => supplyApi.getRegions('BERAS'), [], { pollInterval: 300000 });
  const { data: routesRaw } = useData(() => logisticsApi.getRoutes(), [], { pollInterval: 600000 });
  const { data: resilienceRaw } = useData(() => forecastApi.getResilience(), [], { pollInterval: 600000 });
  const { data: provincePricesRaw } = useData(() => pricesApi.getProvinces('BERAS'), [], { pollInterval: 900000 });

  const [role, setRole] = useState('tpid');
  const [openAction, setOpenAction] = useState(0);
  const [scenario, setScenario] = useState({ rupiah: 5, logistics: 8, harvest: 4 });
  const [saved, setSaved] = useState([]);
  const [briefOpen, setBriefOpen] = useState(false);

  const usingCommodityFallback = !(Array.isArray(commoditiesRaw) && commoditiesRaw.length);
  const usingRegionFallback = !(Array.isArray(regionsRaw) && regionsRaw.length);
  const usingResilienceFallback = !resilienceRaw;
  const usingBalanceFallback = !balanceRaw;

  const balance = balanceRaw || DASHBOARD_FALLBACK.balance;
  const commodityList = usingCommodityFallback ? DASHBOARD_FALLBACK.commodities : commoditiesRaw;
  const regionList = usingRegionFallback ? DASHBOARD_FALLBACK.regions : regionsRaw;
  const alertList = Array.isArray(alertsRaw) ? alertsRaw : [];
  const riskList = Array.isArray(risksRaw) && risksRaw.length ? risksRaw : DASHBOARD_FALLBACK.risks;
  const resilience = resilienceRaw || DASHBOARD_FALLBACK.resilience;
  const offlineMode = usingBalanceFallback || usingCommodityFallback || usingRegionFallback || usingResilienceFallback;

  const macro = resilience?.macro || {};
  const provenance = Array.isArray(resilience?.data_provenance) ? resilience.data_provenance : [];
  const baseScore = Math.round(Number(resilience?.summary?.resilience_score) || 63);

  const topRisk = [...riskList].sort((a, b) => +b.risk_score - +a.risk_score)[0] || null;

  const roleDef = ROLE_DEFS.find((r) => r.id === role) || ROLE_DEFS[0];
  const acts = ACTIONS.filter((a) => a.roles.includes(role));

  const sources = provenance.length
    ? provenance.map((p) => ({ dataset: p.dataset, status: p.status, freshness: FRESHNESS[p.dataset] || p.status }))
    : DASHBOARD_FALLBACK.resilience.data_provenance.map((p) => ({ dataset: p.dataset, status: p.status, freshness: FRESHNESS[p.dataset] || p.status }));
  const confidence = Math.round(sources.reduce((s, x) => s + (CONF_W[x.status] || 40), 0) / sources.length);

  const scScore = useMemo(() => {
    const p = scenario.rupiah * 0.9 + scenario.logistics * 0.55 + scenario.harvest * 1.3;
    return Math.max(0, Math.min(100, Math.round(baseScore - p)));
  }, [scenario, baseScore]);
  const delta = scScore - baseScore;
  const setSc = (k, v) => setScenario((s) => ({ ...s, [k]: Number(v) }));

  // National choropleth data (same live wiring as before)
  const toneFor = (status) => status === 'deficit' ? 'danger' : status === 'surplus' ? 'positive' : 'warning';
  const noteFor = (status) => status === 'deficit' ? 'Defisit pasokan' : status === 'surplus' ? 'Surplus pasokan' : 'Hampir seimbang';
  const REGION_CODE_ALIAS = { SUM: 'SM', JAW: 'JW', KAL: 'KL', SUL: 'SL', BNT: 'NT', PMA: 'PM' };
  const canonRegion = (code) => REGION_CODE_ALIAS[code] || code;
  const regionMapData = regionList.reduce((acc, r) => {
    acc[canonRegion(r.code)] = { tone: toneFor(r.status), value: `${+r.balance_ton >= 0 ? '+' : ''}${Math.round((+r.balance_ton || 0) / 1000)}K ton`, note: `${r.region_name} - ${noteFor(r.status)}` };
    return acc;
  }, {});
  const provinceData = (provincePricesRaw?.populated ? provincePricesRaw.provinces : []).map((p) => ({
    name: p.province, tone: p.tone, value: `Rp ${Number(p.price_idr).toLocaleString('id-ID')}`,
    note: `Beras - ${p.dev_from_median_pct > 0 ? '+' : ''}${p.dev_from_median_pct}% vs median nasional`,
  }));
  const provincePriceMode = Boolean(provincePricesRaw?.populated);

  const pressure = [
    { label: 'Supply-demand gap', value: Math.min(100, (balance.deficit_regions || 0) * 21), evidence: `${balance.deficit_regions || 0} wilayah defisit` },
    { label: 'Risiko cuaca & panen', value: topRisk ? Math.round(topRisk.risk_score) : 40, evidence: topRisk ? `Maks ${Math.round(topRisk.risk_score)}% (${topRisk.region_name})` : '-' },
    { label: 'Volatile food', value: macro.volatile_food_yoy_pct ? Math.min(100, Math.round(macro.volatile_food_yoy_pct * 6)) : 35, evidence: macro.volatile_food_yoy_pct ? `${macro.volatile_food_yoy_pct}% yoy` : '-' },
    { label: 'Rupiah & imported inflation', value: macro.usd_idr_change_ptp_pct ? Math.min(100, Math.round(40 + macro.usd_idr_change_ptp_pct * 8)) : 51, evidence: macro.usd_idr ? `USD/IDR ${RUPIAH(macro.usd_idr)}` : '-' },
  ];

  const metrics = [
    ['Resilience Score', String(baseScore), 'Skala 0–100 · makin tinggi makin tahan shock'],
    ['USD/IDR Risk', macro.usd_idr ? RUPIAH(macro.usd_idr) : '-', macro.usd_idr_change_ptp_pct ? `${pct1(macro.usd_idr_change_ptp_pct)} ptp vs 19 Mei 2026` : 'Tekanan imported inflation'],
    ['Volatile Food YoY', macro.volatile_food_yoy_pct ? `${String(macro.volatile_food_yoy_pct).replace('.', ',')}%` : '-', 'Tekanan pangan bergejolak'],
    ['Wilayah Defisit', `${balance.deficit_regions ?? '-'} / 6`, 'Wilayah perlu intervensi'],
  ];

  const cardNeutral = { background: 'var(--color-neutral-100)' };

  return (
    <div className="kp-scope page-enter" style={{ minHeight: '100vh' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', padding: '20px 28px 16px', borderBottom: '1px solid var(--color-divider)', background: 'var(--color-neutral-100)' }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--color-accent-700)', marginBottom: 4 }}>Resilience Room · Cockpit</div>
          <h1 style={{ fontSize: 30, margin: 0, letterSpacing: '-.01em' }}>Cockpit Ketahanan Pangan</h1>
          <p style={{ fontSize: 13, color: 'var(--color-neutral-700)', margin: '6px 0 0', maxWidth: 640 }}>
            Harga, cuaca, pasokan, logistik, dan tekanan rupiah dianyam menjadi satu keputusan — periode {balance?.period_month ? new Date(balance.period_month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : 'terbaru'}.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="tag tag-accent">Data confidence {confidence}%</span>
          {offlineMode && <span className="tag tag-outline">Forecast / offline mode</span>}
          <button className="btn btn-secondary" onClick={() => setBriefOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 15, height: 15 }}><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" /></svg>
            Export decision brief
          </button>
        </div>
      </div>

      <div style={{ padding: '22px 28px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {alertList.length > 0 && <AlertBanner alerts={alertList.slice(0, 2)} />}

        {/* ROLE SWITCHER */}
        <div className="kp-rise" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>Lihat sebagai</span>
          <div className="seg">
            {ROLE_DEFS.map((r) => (
              <label key={r.id} className="seg-opt">
                <input type="radio" name="kp-role" checked={role === r.id} onChange={() => { setRole(r.id); setOpenAction(0); }} />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* HERO */}
        <div className="blueprint kp-rise elev-sm" style={{ ...cardNeutral, padding: 26, display: 'grid', gridTemplateColumns: '1fr auto', gap: 30, alignItems: 'center' }}>
          <Corners />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span className="tag tag-accent">{roleDef.focus}</span>
              <span className="tag tag-neutral">{roleDef.owner}</span>
            </div>
            <div style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-accent-700)', marginBottom: 6 }}>Decision brief hari ini</div>
            <h2 style={{ fontSize: 27, lineHeight: 1.1, margin: '0 0 8px', maxWidth: 620 }}>{roleDef.headline}</h2>
            <p style={{ fontSize: 14, color: 'var(--color-neutral-700)', margin: '0 0 18px', maxWidth: 600 }}>{roleDef.rationale}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, maxWidth: 560 }}>
              {[['Timeframe', acts[0] ? acts[0].timeframe : '0–14 hari'], ['Aksi prioritas', String(acts.length)], ['Data confidence', confidence + '%']].map(([k, v]) => (
                <div key={k} style={{ border: '1px solid var(--color-divider)', padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>{k}</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 18, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 168, height: 168 }}>
              <svg viewBox="0 0 140 140" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="70" cy="70" r="56" fill="none" stroke="var(--color-neutral-200)" strokeWidth="9" />
                <circle cx="70" cy="70" r="56" fill="none" stroke="var(--color-accent)" strokeWidth="9" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - baseScore / 100)} style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.16,1,.3,1)' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 44, lineHeight: 1 }}>{baseScore}</div>
                <div style={{ fontSize: 9.5, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-neutral-600)', marginTop: 4 }}>Resilience</div>
              </div>
            </div>
            <span className="tag tag-accent" style={{ marginTop: 12 }}>{levelOf(baseScore)}</span>
          </div>
        </div>

        {/* METRICS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {metrics.map(([label, value, sub]) => (
            <div key={label} className="blueprint kp-rise" style={{ padding: '16px 16px 15px', ...cardNeutral }}>
              <Corners />
              <div style={{ fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 29, lineHeight: 1.05, margin: '7px 0 3px' }}>{value}</div>
              <div style={{ fontSize: 11.5, color: 'var(--color-neutral-600)', lineHeight: 1.35 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* ACTIONS + SCENARIO */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr .9fr', gap: 20, alignItems: 'start' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 20, margin: 0 }}>Prioritas Tindakan</h3>
                <p style={{ fontSize: 12, color: 'var(--color-neutral-600)', margin: '3px 0 0' }}>Difilter untuk peran {roleDef.owner} · klik untuk detail</p>
              </div>
              <span className="tag tag-neutral">model-derived</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
              {acts.map((a, i) => (
                <div key={a.title} style={{ border: '1px solid var(--color-divider)' }}>
                  <button onClick={() => setOpenAction(openAction === i ? -1 : i)} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 0, cursor: 'pointer', padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 26, height: 26, flex: 'none', display: 'grid', placeItems: 'center', border: '1px solid var(--color-accent)', color: 'var(--color-accent-800)', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14 }}>{i + 1}</span>
                    <span style={{ flex: 1, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 16, lineHeight: 1.15 }}>{a.title}</span>
                    <span className="tag tag-outline">{a.timeframe}</span>
                    <span style={{ color: 'var(--color-neutral-500)', transform: openAction === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 16, height: 16 }}><path d="m6 9 6 6 6-6" /></svg>
                    </span>
                  </button>
                  {openAction === i && (
                    <div style={{ padding: '0 15px 15px 53px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <p style={{ fontSize: 13, color: 'var(--color-neutral-700)', margin: 0 }}>{a.rationale}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[['Owner', a.owner], ['KPI target', a.kpi]].map(([k, v]) => (
                          <div key={k} style={{ borderLeft: '2px solid var(--color-accent)', paddingLeft: 10 }}>
                            <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>{k}</div>
                            <div style={{ fontSize: 13, marginTop: 2 }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SCENARIO SIMULATOR */}
          <div className="blueprint" style={{ padding: 18, ...cardNeutral }}>
            <Corners />
            <h3 style={{ fontSize: 20, margin: 0 }}>Simulator Shock</h3>
            <p style={{ fontSize: 12, color: 'var(--color-neutral-600)', margin: '3px 0 16px' }}>Uji dampak pelemahan rupiah, biaya logistik, dan gagal panen terhadap skor.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {[['rupiah', 'Rupiah melemah', 15], ['logistics', 'Biaya logistik naik', 20], ['harvest', 'Kehilangan panen', 12]].map(([key, label, max]) => (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span>{label}</span><span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{scenario[key]}%</span>
                  </div>
                  <input className="kp-range" type="range" min="0" max={max} value={scenario[key]} onChange={(e) => setSc(key, e.target.value)} />
                </div>
              ))}
            </div>
            <div style={{ border: '1px solid var(--color-divider)', marginTop: 18, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>Skor setelah skenario</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 3 }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 34, lineHeight: 1 }}>{scScore}</span>
                  <span style={{ fontSize: 13, color: 'var(--color-accent-700)' }}>{delta === 0 ? 'setara baseline' : (delta > 0 ? '▲ +' + delta : '▼ ' + delta) + ' vs ' + baseScore}</span>
                </div>
              </div>
              <span className="tag tag-accent">{levelOf(scScore)}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setSaved((prev) => [{ id: Date.now(), score: scScore, desc: `Rp +${scenario.rupiah}% · log +${scenario.logistics}% · panen −${scenario.harvest}%` }, ...prev].slice(0, 4))}>Simpan skenario</button>
              <button className="btn btn-secondary" onClick={() => setScenario({ rupiah: 5, logistics: 8, harvest: 4 })}>Reset</button>
            </div>
            {saved.length > 0 && (
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>Skenario tersimpan</div>
                {saved.map((s) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--color-divider)', padding: '7px 10px' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, width: 26 }}>{s.score}</span>
                    <span style={{ flex: 1, fontSize: 12, color: 'var(--color-neutral-700)' }}>{s.desc}</span>
                    <button onClick={() => setSaved((prev) => prev.filter((x) => x.id !== s.id))} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--color-neutral-500)', padding: 2 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 14, height: 14 }}><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* NATIONAL CHOROPLETH MAP (34 provinces, live) */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 20, margin: 0 }}>Peta Status Nasional — 34 Provinsi</h3>
              <p style={{ fontSize: 12, color: 'var(--color-neutral-600)', margin: '3px 0 0' }}>
                {provincePriceMode ? 'Tekanan harga beras per provinsi vs median nasional (BI Harga Pangan).' : 'Tekanan pasokan beras per provinsi, diwarnai per wilayah agregasi.'} Arahkan kursor untuk detail.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {provincePriceMode && <span className="tag tag-accent">Harga per provinsi (BI)</span>}
              {topRisk && <span className="tag tag-neutral">Risiko · {topRisk.region_name} {Math.round(topRisk.risk_score)}%</span>}
            </div>
          </div>
          {!regionList.length ? <LoadingSpinner text="Memuat peta nasional..." /> : (
            <ChoroplethMap
              data={provinceData}
              regionData={regionMapData}
              legend={provincePriceMode ? [
                { tone: 'positive', label: 'Harga di bawah median' },
                { tone: 'warning', label: 'Sekitar median (±4%)' },
                { tone: 'danger', label: 'Harga di atas median' },
                { tone: 'nodata', label: 'Data belum tersedia' },
              ] : [
                { tone: 'positive', label: 'Surplus pasokan' },
                { tone: 'warning', label: 'Hampir seimbang' },
                { tone: 'danger', label: 'Defisit pasokan' },
                { tone: 'nodata', label: 'Data belum tersedia' },
              ]}
              caption={provincePriceMode
                ? 'Sumber: harga beras harian BI Harga Pangan per provinsi (tanpa agregasi). Warna = deviasi harga terhadap median 34 provinsi.'
                : 'Sumber neraca: agregasi 6 wilayah (produksi beras BPS). Warna provinsi mewarisi status wilayahnya.'}
            />
          )}
        </div>

        {/* TABLES */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <h3 style={{ fontSize: 19, margin: '0 0 6px' }}>Neraca Pasokan per Wilayah</h3>
            <table className="table">
              <thead><tr><th>Wilayah</th><th style={{ textAlign: 'right' }}>Pasokan</th><th style={{ textAlign: 'right' }}>Permintaan</th><th>Status</th></tr></thead>
              <tbody>
                {regionList.map((r) => (
                  <tr key={r.id || r.code}>
                    <td>{r.region_name}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{RIBU(r.supply_ton)}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{RIBU(r.demand_ton)}</td>
                    <td><span className={REGION_TAG[r.status] || 'tag tag-neutral'}>{REGION_LABEL[r.status] || r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card">
            <h3 style={{ fontSize: 19, margin: '0 0 6px' }}>Harga Komoditas Terkini</h3>
            <table className="table">
              <thead><tr><th>Komoditas</th><th style={{ textAlign: 'right' }}>Harga</th><th style={{ textAlign: 'right' }}>MoM</th><th style={{ textAlign: 'right' }}>% HET</th></tr></thead>
              <tbody>
                {commodityList.slice(0, 6).map((c) => (
                  <tr key={c.id || c.name}>
                    <td>{c.name}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{RUPIAH(c.current_price)}</td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: +c.change_mom_pct > 5 ? 600 : 400 }}>{pct1(c.change_mom_pct)}</td>
                    <td style={{ textAlign: 'right' }}>{c.pct_of_het != null ? <span className={+c.pct_of_het > 110 ? 'tag tag-outline' : +c.pct_of_het > 100 ? 'tag tag-neutral' : 'tag tag-accent'}>{Math.round(c.pct_of_het)}%</span> : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PRESSURE + SOURCE HEALTH */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <h3 style={{ fontSize: 19, margin: '0 0 4px' }}>Tekanan Sistem Pangan</h3>
            <p style={{ fontSize: 12, color: 'var(--color-neutral-600)', margin: '0 0 8px' }}>Faktor yang menekan resiliensi keputusan saat ini.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {pressure.map((p) => (
                <div key={p.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}><span>{p.label}</span><span style={{ color: 'var(--color-neutral-600)' }}>{p.evidence}</span></div>
                  <div className="kp-track" style={{ height: 6 }}><div style={{ height: '100%', width: p.value + '%', background: 'var(--color-accent)', transition: 'width 1s cubic-bezier(.16,1,.3,1)' }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: 19, margin: 0 }}>Source Health &amp; Data Lineage</h3>
                <p style={{ fontSize: 12, color: 'var(--color-neutral-600)', margin: '3px 0 0' }}>Membedakan real-time, rilis resmi, forecast, dan belum tersedia.</p>
              </div>
              <span className="tag tag-accent">{confidence}%</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {sources.map((s) => (
                <div key={s.dataset} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: '1px solid color-mix(in srgb,var(--color-text) 8%,transparent)' }}>
                  <span style={{ width: 8, height: 8, flex: 'none', borderRadius: '50%', background: STATUS_DOT[s.status] || 'var(--color-neutral-400)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{s.dataset}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-neutral-600)' }}>{s.freshness}</div>
                  </div>
                  <span className={STATUS_TAG[s.status] || 'tag tag-neutral'}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BRIEF DIALOG */}
      {briefOpen && (
        <div className="dialog-backdrop" onClick={() => setBriefOpen(false)}>
          <div className="dialog blueprint" style={{ width: 'min(560px,100%)', background: 'var(--color-neutral-100)' }} onClick={(e) => e.stopPropagation()}>
            <Corners />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--color-accent-700)' }}>Decision brief · {balance?.period_month ? new Date(balance.period_month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : 'terbaru'}</div>
                <div className="dialog-title" style={{ marginTop: 3 }}>{roleDef.headline}</div>
              </div>
              <button onClick={() => setBriefOpen(false)} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--color-neutral-600)' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 18, height: 18 }}><path d="M18 6 6 18M6 6l12 12" /></svg></button>
            </div>
            <div style={{ display: 'flex', gap: 18, padding: '10px 0', borderTop: '1px solid var(--color-divider)', borderBottom: '1px solid var(--color-divider)' }}>
              {[['Resilience', String(baseScore)], ['Confidence', confidence + '%'], ['Wilayah defisit', `${balance.deficit_regions ?? '-'} / 6`]].map(([k, v]) => (
                <div key={k}><div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>{k}</div><div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 24 }}>{v}</div></div>
              ))}
            </div>
            <div className="dialog-body" style={{ maxHeight: 230, overflowY: 'auto' }}>
              <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-neutral-600)', marginBottom: 6 }}>Aksi prioritas — {roleDef.owner}</div>
              {acts.map((a, i) => (
                <div key={a.title} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--color-accent-700)' }}>{i + 1}</span>
                  <div><div style={{ fontWeight: 500, color: 'var(--color-text)' }}>{a.title}</div><div style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>{a.owner} · {a.timeframe}</div></div>
                </div>
              ))}
            </div>
            <div className="dialog-actions">
              <button className="btn btn-secondary" onClick={() => setBriefOpen(false)}>Tutup</button>
              <button className="btn btn-primary" onClick={() => window.print()}>Cetak / simpan PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
