import { useMemo, useState } from 'react';
import { useData } from '../hooks/useData.js';
import { pricesApi } from '../api.js';
import { MetricCard, ProgressBar, StatusBadge, ChoroplethMap, LoadingSpinner } from '../components/shared/index.jsx';

const TABS = [
  { id: 'demand', label: 'Demand' },
  { id: 'data', label: 'Data Trust' },
  { id: 'business', label: 'Business Case' },
  { id: 'roadmap', label: 'Pilot Roadmap' },
];

const SOURCE_FACTS = [
  {
    label: 'Inflasi Juni 2026',
    value: '3,34% yoy',
    sub: 'BPS official release, naik dari 3,08% (Mei)',
    status: 'official-release',
    href: 'https://www.bps.go.id/en/pressrelease/2026/07/01/2590/inflasi-year-on-year--y-on-y--pada-juni-2026-sebesar-3-34-persen-.html',
  },
  {
    label: 'Volatile Food',
    value: '5,58% yoy',
    sub: 'Tetap jadi ancaman utama inflasi pangan',
    status: 'official-release',
    href: 'https://www.bps.go.id/en/pressrelease/2026/07/01/2590/inflasi-year-on-year--y-on-y--pada-juni-2026-sebesar-3-34-persen-.html',
  },
  {
    label: 'USD/IDR Risk',
    value: 'Rp17.944',
    sub: 'JISDOR 17 Juli 2026',
    status: 'official-release',
    href: 'https://databoks.katadata.co.id/pasar/statistik/6a5a3cf30e232/rupiah-bi-jisdor-menguat-menjadi-17944-per-dolar-as-jumat-17-juli-2026',
  },
  {
    label: 'BI-Rate',
    value: '5,75%',
    sub: '3x kenaikan berturut-turut sejak Mei, +100bps',
    status: 'official-release',
    href: 'https://www.bi.go.id/id/publikasi/ruang-media/news-release/Pages/sp_2812626.aspx',
  },
  {
    label: 'BMKG Forecast',
    value: '2x/hari',
    sub: 'Prakiraan desa 3 hari',
    status: 'real-time-capable',
    href: 'https://data.bmkg.go.id/prakiraan-cuaca',
  },
];

const DEMAND_SIGNALS = [
  {
    title: 'Harga pangan masih menekan inflasi',
    proof: 'Inflasi Juni 2026 naik menjadi 3,34% yoy (dari 3,08% Mei); volatile food tetap tinggi di 5,58% yoy.',
    source: 'BPS',
    pain: 'Tim kebijakan perlu tahu komoditas dan wilayah mana yang harus diprioritaskan sebelum harga bergerak lebih jauh.',
    feature: 'Food inflation monitor, anomaly signal, action card, dan KPI intervensi.',
    strength: 86,
  },
  {
    title: 'Rupiah melemah memperbesar imported inflation',
    proof: 'BI menaikkan BI-Rate 3x berturut-turut sejak Mei 2026 menjadi 5,75% (+100bps) untuk menahan pelemahan rupiah; kurs JISDOR Rp17.944 pada 17 Juli 2026.',
    source: 'Bank Indonesia',
    pain: 'Kurs menekan komoditas impor, energi, pakan, dan biaya logistik, tetapi dampaknya sering tidak masuk ke keputusan stok.',
    feature: 'Scenario planning kurs, imported inflation exposure, dan resilience score.',
    strength: 82,
  },
  {
    title: 'Cuaca bisa berubah menjadi risiko pasokan',
    proof: 'BMKG menyediakan prakiraan 3 hari per desa dan diperbarui dua kali sehari.',
    source: 'BMKG Open Data',
    pain: 'Data cuaca perlu diterjemahkan menjadi risiko panen, prioritas wilayah, dan kebutuhan buffer stok.',
    feature: 'Weather risk engine, harvest-loss estimate, dan mitigasi lapangan.',
    strength: 78,
  },
  {
    title: 'Data pangan tersebar lintas institusi',
    proof: 'Ombudsman mendorong integrasi data harga, produksi, konsumsi, distribusi, dan stok melalui Satu Data.',
    source: 'Ombudsman RI, Satu Data Indonesia',
    pain: 'Pengambil keputusan tidak hanya butuh data, tetapi butuh data yang dapat dipercaya, dilabeli, dan diaudit.',
    feature: 'Data lineage, source confidence, expected partner data, dan Evidence Room.',
    strength: 91,
  },
  {
    title: 'Distribusi dari surplus ke defisit butuh route intelligence',
    proof: 'Ketahanan pangan Indonesia dipengaruhi ketimpangan wilayah, biaya distribusi, dan kapasitas logistik.',
    source: 'Bapanas, WFP Indonesia CSP',
    pain: 'Redistribusi sulit bila rute, biaya, ETA, kapasitas, dan data partner tidak berada dalam satu workflow.',
    feature: 'Ranking rute, estimasi volume, Google ETA/jarak opsional, dan logistics add-on.',
    strength: 80,
  },
];

const GUIDEBOOK_FIT = [
  ['Problem-market fit', 'Policy lag pada keputusan pangan saat harga, stok, cuaca, logistik, dan rupiah berubah bersamaan.'],
  ['Impact', 'Target: time-to-insight turun 50%, gap pasokan simulatif turun 30%, potensi efisiensi rute 5-10%.'],
  ['Originality', 'Decision intelligence dengan scenario shock rupiah, data lineage, dan route intelligence.'],
  ['Feasibility', 'React/Vite, Express, PostgreSQL/Supabase, scraper BI, BMKG service, dan Google Routes opsional.'],
  ['Sustainability', 'B2G/B2B SaaS, setup fee, managed analytics, API subscription, dan logistics add-on.'],
];

const DATA_MATRIX = [
  {
    dataset: 'Harga pangan',
    status: 'real-time-capable',
    source: 'BI Harga Pangan scraper/API; Bapanas jika endpoint stabil',
    currentUse: 'Pemantauan harga, volatile commodity, dan sinyal anomali',
    productionNeed: 'Harga harian per komoditas, provinsi/pasar, timestamp, source URL',
  },
  {
    dataset: 'Cuaca',
    status: 'real-time-capable',
    source: 'BMKG Open Data',
    currentUse: 'Risiko panen dan alert cuaca',
    productionNeed: 'adm4 mapping, prakiraan hujan, suhu, kelembapan, angin',
  },
  {
    dataset: 'Makro rupiah dan inflasi',
    status: 'official-release',
    source: 'BPS dan Bank Indonesia',
    currentUse: 'Scenario shock dan imported inflation exposure',
    productionNeed: 'Kalender rilis, BI-Rate, USD/IDR, inflasi, impor',
  },
  {
    dataset: 'Supply-demand dan stok',
    status: 'unavailable',
    source: 'Butuh integrasi Bapanas/Bulog/Dinas/gudang',
    currentUse: 'Seed/forecast MVP, tidak diklaim real-time',
    productionNeed: 'production_ton, stock_ton, demand_ton, warehouse_id, updated_at',
  },
  {
    dataset: 'Biaya dan kapasitas logistik',
    status: 'forecast',
    source: 'Route table MVP sampai feed mitra tersedia',
    currentUse: 'Ranking rute dan estimasi biaya',
    productionNeed: 'carrier, capacity_ton, cost_per_ton, lead_time_days, congestion',
  },
  {
    dataset: 'ETA/jarak rute',
    status: 'real-time-capable',
    source: 'Google Routes API bila key aktif',
    currentUse: 'ETA/jarak jalan; bukan biaya atau kapasitas kargo',
    productionNeed: 'origin/destination coordinate, route mode, fetched_at, caveat',
  },
];

const ROADMAP = [
  {
    phase: 'Pilot 0-4 bulan',
    outcome: 'Membuktikan time-to-insight dan nilai rekomendasi',
    actions: ['2-3 wilayah prioritas', '5-10 komoditas strategis', 'User task test dengan TPID/dinas pangan', 'Laporan KPI pilot'],
  },
  {
    phase: 'Scale 4-12 bulan',
    outcome: 'Menguatkan integrasi data dan workflow institusi',
    actions: ['Integrasi stok/gudang', 'Google Routes API aktif', 'Managed analytics bulanan', 'SLA dan role-based access'],
  },
  {
    phase: 'Expansion 12+ bulan',
    outcome: 'Menjadi intelligence layer lintas wilayah',
    actions: ['Multi-tenant 34 provinsi', 'API risk score', 'Logistics marketplace add-on', 'Partner data exchange'],
  },
];

const INITIAL_CALC = {
  clients: 8,
  monthlyLicense: 20,
  licenseMonths: 12,
  setupClients: 5,
  setupFee: 100,
  managedClients: 5,
  managedFee: 10,
  apiPartners: 3,
  apiFee: 10,
  fixedCost: 1090,
  recurringDirectCost: 48,
  setupDirectCost: 35,
};

function formatJuta(value) {
  const number = Number(value) || 0;
  if (Math.abs(number) >= 1000) return `Rp ${(number / 1000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} miliar`;
  return `Rp ${Math.round(number).toLocaleString('id-ID')} juta`;
}

function SourceLink({ href, children }) {
  return (
    <a className="text-xs text-blue-700 hover:text-blue-900" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

function CalculatorInput({ label, suffix, value, min, max, onChange }) {
  return (
    <label className="block">
      <span className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span className="font-medium text-gray-800">{value}{suffix}</span>
      </span>
      <input
        className="w-full"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export default function Evidence() {
  const [activeTab, setActiveTab] = useState('demand');
  const [selectedSignal, setSelectedSignal] = useState(0);
  const [calc, setCalc] = useState(INITIAL_CALC);

  const business = useMemo(() => {
    const licenseRevenue = calc.clients * calc.monthlyLicense * calc.licenseMonths;
    const setupRevenue = calc.setupClients * calc.setupFee;
    const managedRevenue = calc.managedClients * calc.managedFee * calc.licenseMonths;
    const apiRevenue = calc.apiPartners * calc.apiFee * calc.licenseMonths;
    const revenue = licenseRevenue + setupRevenue + managedRevenue + apiRevenue;
    const directCost = (calc.clients * calc.recurringDirectCost) + (calc.setupClients * calc.setupDirectCost);
    const expense = calc.fixedCost + directCost;
    const net = revenue - expense;
    const recurringContribution = (calc.monthlyLicense * 12) - calc.recurringDirectCost;
    const breakEvenClients = recurringContribution > 0 ? Math.ceil(calc.fixedCost / recurringContribution) : null;

    return { licenseRevenue, setupRevenue, managedRevenue, apiRevenue, revenue, directCost, expense, net, recurringContribution, breakEvenClients };
  }, [calc]);

  const signal = DEMAND_SIGNALS[selectedSignal] || DEMAND_SIGNALS[0];

  // Disparitas harga per provinsi adalah bukti demand paling kuat yang kami
  // punya, karena dihasilkan sistem sendiri - bukan kutipan rilis pihak lain.
  const { data: provincePrices } = useData(() => pricesApi.getProvinces('BERAS'), [], { pollInterval: 900000 });
  const priceRows = provincePrices?.populated ? provincePrices.provinces : [];
  const priceMapData = priceRows.map((p) => ({
    name: p.province,
    tone: p.tone,
    value: `Rp ${Number(p.price_idr).toLocaleString('id-ID')}`,
    note: `${p.dev_from_median_pct > 0 ? '+' : ''}${p.dev_from_median_pct}% vs median nasional`,
  }));
  const sortedPrices = [...priceRows].sort((a, b) => a.price_idr - b.price_idr);
  const spreadPct = sortedPrices.length
    ? Math.round(((sortedPrices[sortedPrices.length - 1].price_idr - sortedPrices[0].price_idr) / sortedPrices[0].price_idr) * 100)
    : null;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-xs text-emerald-700 uppercase tracking-widest mb-1">Market & Evidence Room</p>
          <h1 className="text-2xl font-medium">Bukti Demand, Data Trust, dan Business Case</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-3xl">
            Ruang ini menghubungkan narasi submission dengan prototype: bukti masalah nyata, sumber data, model revenue, asumsi perhitungan, dan roadmap pilot.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="official-release" label="Evidence-backed" />
          <StatusBadge status="forecast" label="Forecast labelled" />
          <StatusBadge status="ready" label="Pilot-ready story" />
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-medium">Bukti Visual: Disparitas Harga Beras Antarprovinsi</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Ditarik sistem langsung dari BI Harga Pangan — bukan kutipan rilis pihak lain
            </p>
          </div>
          {spreadPct != null && <StatusBadge status="real-time" label={`Selisih ${spreadPct}% antarprovinsi`} />}
        </div>
        {!priceMapData.length ? (
          <LoadingSpinner text="Memuat peta harga per provinsi..." />
        ) : (
          <ChoroplethMap
            data={priceMapData}
            legend={[
              { tone: 'positive', label: 'Di bawah median' },
              { tone: 'warning', label: 'Sekitar median (±4%)' },
              { tone: 'danger', label: 'Di atas median' },
              { tone: 'nodata', label: 'Data belum tersedia' },
            ]}
            caption={sortedPrices.length
              ? `Termurah ${sortedPrices[0].province} Rp${Number(sortedPrices[0].price_idr).toLocaleString('id-ID')} · termahal ${sortedPrices[sortedPrices.length - 1].province} Rp${Number(sortedPrices[sortedPrices.length - 1].price_idr).toLocaleString('id-ID')} pada hari yang sama.`
              : ''}
          />
        )}
      </div>

      <div className="flex gap-1 overflow-x-auto border border-gray-200 rounded-lg bg-white p-1 w-fit max-w-full">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.id ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'demand' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {SOURCE_FACTS.map((fact) => (
              <div key={fact.label} className="metric-card bg-white border border-gray-200">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs text-gray-500 mb-1">{fact.label}</p>
                  <StatusBadge status={fact.status} label={fact.status} />
                </div>
                <p className="text-xl font-medium text-gray-900">{fact.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{fact.sub}</p>
                <div className="mt-2">
                  <SourceLink href={fact.href}>Lihat sumber</SourceLink>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-5">
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium">Demand Signals</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Klik sinyal untuk melihat hubungan masalah, bukti, dan fitur.</p>
                </div>
                <StatusBadge status="ready" label="problem-market fit" />
              </div>
              <div className="space-y-2">
                {DEMAND_SIGNALS.map((item, index) => (
                  <button
                    key={item.title}
                    onClick={() => setSelectedSignal(index)}
                    className={`w-full text-left rounded-md border p-3 transition-colors ${
                      selectedSignal === index ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.source}</p>
                      </div>
                      <span className="text-xs font-medium text-emerald-700">{item.strength}%</span>
                    </div>
                    <div className="mt-2">
                      <ProgressBar value={item.strength} color={item.strength >= 85 ? 'bg-emerald-500' : 'bg-blue-500'} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium">{signal.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Problem to solution mapping untuk demo dan diskusi juri.</p>
                </div>
                <StatusBadge status="official-release" label={signal.source} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-md p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bukti</p>
                  <p className="text-sm text-gray-800 mt-2">{signal.proof}</p>
                </div>
                <div className="bg-yellow-50 rounded-md p-4">
                  <p className="text-xs font-medium text-yellow-700 uppercase tracking-wide">Pain</p>
                  <p className="text-sm text-yellow-900 mt-2">{signal.pain}</p>
                </div>
                <div className="bg-emerald-50 rounded-md p-4">
                  <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Kepang AI</p>
                  <p className="text-sm text-emerald-900 mt-2">{signal.feature}</p>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Kriteria guidebook</th>
                      <th>Bagaimana prototype menjawab</th>
                    </tr>
                  </thead>
                  <tbody>
                    {GUIDEBOOK_FIT.map(([criterion, evidence]) => (
                      <tr key={criterion}>
                        <td className="font-medium">{criterion}</td>
                        <td className="text-xs text-gray-600">{evidence}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <MetricCard label="Real-time capable" value="3 dataset" sub="Harga, cuaca, ETA/jarak bila key aktif" valueClass="text-emerald-700" />
            <MetricCard label="Official release" value="1 layer" sub="BPS dan BI untuk makro" valueClass="text-blue-700" />
            <MetricCard label="Forecast/model" value="3 output" sub="Score, risiko panen, rute" valueClass="text-yellow-700" />
            <MetricCard label="Expected partner data" value="2 domain" sub="Stok dan kapasitas logistik" valueClass="text-red-700" />
          </div>

          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium">Data Source Matrix</h3>
                <p className="text-xs text-gray-500 mt-0.5">Tidak ada seed, proxy, atau output model yang diklaim sebagai data real-time.</p>
              </div>
              <StatusBadge status="reference" label="audit trail" />
            </div>
            <div className="overflow-x-auto">
              <table className="table-base min-w-[940px]">
                <thead>
                  <tr>
                    <th>Dataset</th>
                    <th>Status</th>
                    <th>Sumber / Metode</th>
                    <th>Dipakai untuk</th>
                    <th>Production need</th>
                  </tr>
                </thead>
                <tbody>
                  {DATA_MATRIX.map((item) => (
                    <tr key={item.dataset}>
                      <td className="font-medium">{item.dataset}</td>
                      <td><StatusBadge status={item.status} label={item.status} /></td>
                      <td className="text-xs text-gray-600">{item.source}</td>
                      <td className="text-xs text-gray-600">{item.currentUse}</td>
                      <td className="text-xs text-gray-500">{item.productionNeed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'business' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-5">
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium">Revenue & Expense Calculator</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Semua angka dalam juta rupiah dan bersifat base-case proposal.</p>
                </div>
                <StatusBadge status={business.net >= 0 ? 'surplus' : 'warning'} label={business.net >= 0 ? 'profitable' : 'pilot investment'} />
              </div>

              <div className="space-y-4">
                <CalculatorInput label="Klien lisensi aktif" value={calc.clients} suffix=" klien" min={1} max={30} onChange={(value) => setCalc({ ...calc, clients: value })} />
                <CalculatorInput label="Lisensi bulanan" value={calc.monthlyLicense} suffix=" jt" min={10} max={40} onChange={(value) => setCalc({ ...calc, monthlyLicense: value })} />
                <CalculatorInput label="Klien setup baru" value={calc.setupClients} suffix=" klien" min={0} max={20} onChange={(value) => setCalc({ ...calc, setupClients: value })} />
                <CalculatorInput label="Setup fee per klien" value={calc.setupFee} suffix=" jt" min={50} max={200} onChange={(value) => setCalc({ ...calc, setupFee: value })} />
                <CalculatorInput label="Managed analytics clients" value={calc.managedClients} suffix=" klien" min={0} max={20} onChange={(value) => setCalc({ ...calc, managedClients: value })} />
                <CalculatorInput label="API/logistics partners" value={calc.apiPartners} suffix=" partner" min={0} max={20} onChange={(value) => setCalc({ ...calc, apiPartners: value })} />
                <CalculatorInput label="Fixed cost awal" value={calc.fixedCost} suffix=" jt" min={800} max={3000} onChange={(value) => setCalc({ ...calc, fixedCost: value })} />
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <MetricCard label="Total Revenue" value={formatJuta(business.revenue)} sub="Lisensi + setup + analytics + API" valueClass="text-emerald-700" />
                <MetricCard label="Total Expense" value={formatJuta(business.expense)} sub="Fixed cost + direct cost" valueClass="text-red-600" />
                <MetricCard label="Net Result" value={formatJuta(business.net)} sub={business.net >= 0 ? 'Operasional positif' : 'Masih fase investasi pilot'} valueClass={business.net >= 0 ? 'text-emerald-700' : 'text-yellow-700'} />
                <MetricCard label="Break-even" value={`${business.breakEvenClients || '-'} klien`} sub={`${formatJuta(business.recurringContribution)} kontribusi/klien/tahun`} valueClass="text-blue-700" />
              </div>

              <div className="card">
                <h3 className="text-sm font-medium mb-4">Asumsi Perhitungan</h3>
                <div className="overflow-x-auto">
                  <table className="table-base">
                    <thead>
                      <tr>
                        <th>Komponen</th>
                        <th className="text-right">Nilai</th>
                        <th>Rumus</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Lisensi</td>
                        <td className="text-right font-mono text-xs">{formatJuta(business.licenseRevenue)}</td>
                        <td className="text-xs text-gray-600">{calc.clients} klien x Rp{calc.monthlyLicense} jt x {calc.licenseMonths} bulan</td>
                      </tr>
                      <tr>
                        <td>Setup fee</td>
                        <td className="text-right font-mono text-xs">{formatJuta(business.setupRevenue)}</td>
                        <td className="text-xs text-gray-600">{calc.setupClients} klien x Rp{calc.setupFee} jt</td>
                      </tr>
                      <tr>
                        <td>Managed analytics</td>
                        <td className="text-right font-mono text-xs">{formatJuta(business.managedRevenue)}</td>
                        <td className="text-xs text-gray-600">{calc.managedClients} klien x Rp{calc.managedFee} jt x 12 bulan</td>
                      </tr>
                      <tr>
                        <td>API/logistics add-on</td>
                        <td className="text-right font-mono text-xs">{formatJuta(business.apiRevenue)}</td>
                        <td className="text-xs text-gray-600">{calc.apiPartners} partner x Rp{calc.apiFee} jt x 12 bulan</td>
                      </tr>
                      <tr>
                        <td>Direct cost</td>
                        <td className="text-right font-mono text-xs">{formatJuta(business.directCost)}</td>
                        <td className="text-xs text-gray-600">Rp{calc.recurringDirectCost} jt/klien/tahun + Rp{calc.setupDirectCost} jt/setup</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'roadmap' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROADMAP.map((phase, index) => (
              <div key={phase.phase} className="card">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-semibold">{index + 1}</span>
                  <StatusBadge status={index === 0 ? 'ready' : 'planned'} label={index === 0 ? 'pilot' : 'next'} />
                </div>
                <h3 className="text-sm font-medium text-gray-900">{phase.phase}</h3>
                <p className="text-xs text-gray-500 mt-1">{phase.outcome}</p>
                <div className="space-y-2 mt-4">
                  {phase.actions.map((action) => (
                    <div key={action} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 className="text-sm font-medium mb-4">Pilot Success Criteria</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <MetricCard label="Time to insight" value="< 3 menit" sub="Cari wilayah prioritas" valueClass="text-emerald-700" />
              <MetricCard label="Analisis manual" value="-50%" sub="Dibanding spreadsheet/workflow biasa" valueClass="text-blue-700" />
              <MetricCard label="Supply gap simulatif" value="-30%" sub="Sebelum vs sesudah redistribusi" valueClass="text-yellow-700" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
