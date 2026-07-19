import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { useData } from '../hooks/useData.js';
import { forecastApi } from '../api.js';
import { LoadingSpinner, MetricCard, ProgressBar, StatusBadge } from '../components/shared/index.jsx';

const PRESSURE_COLORS = {
  supply: '#ef4444',
  climate: '#f59e0b',
  price: '#e11d48',
  macro: '#2563eb',
  logistics: '#0f766e',
};

const LEVEL_LABELS = {
  aman: 'Aman',
  waspada: 'Waspada',
  siaga_1: 'Siaga 1',
  siaga_2: 'Siaga 2',
  kritis: 'Kritis',
};

const RESILIENCE_FALLBACK = {
  data_policy: {
    principle: 'Tidak ada data proxy yang diklaim sebagai data asli. Saat API/source belum tersedia, nilai ditandai sebagai forecast dan kebutuhan data ditampilkan.',
    real_time_rule: 'Data asli hanya berasal dari API/scraper resmi atau mitra data yang dapat diaudit.',
    forecast_rule: 'Score, exposure, skenario, dan action plan adalah output model yang perlu divalidasi dengan data operasional.',
  },
  macro: {
    as_of: '2026-07-17',
    usd_idr: 17944,
    usd_idr_change_ptp_pct: 1.4,
    volatile_food_yoy_pct: 5.58,
  },
  summary: {
    resilience_score: 63,
    resilience_level: 'siaga_1',
    pressure_index: 37,
    deficit_regions: 2,
    avg_logistics_cost_per_ton: 271667,
  },
  pressure_breakdown: [
    { key: 'supply', label: 'Supply-demand gap', value: 42, evidence: '2 wilayah defisit' },
    { key: 'climate', label: 'Risiko cuaca dan panen', value: 51, evidence: 'Risiko maksimum 66%' },
    { key: 'price', label: 'Volatile food', value: 35, evidence: 'VF 5.58% yoy' },
    { key: 'macro', label: 'Rupiah dan imported inflation', value: 51, evidence: 'USD/IDR Rp17.944' },
    { key: 'logistics', label: 'Biaya distribusi', value: 37, evidence: 'Rata-rata Rp271.667/ton' },
  ],
  import_exposure: [
    { commodity: 'Kedelai', exposure: 82, reason: 'Bahan baku banyak bergantung impor dan sensitif kurs', mitigation: 'Prioritaskan buffer stok dan substitusi sumber pasok domestik' },
    { commodity: 'Bawang putih', exposure: 88, reason: 'Ketergantungan impor tinggi dan sensitif biaya logistik', mitigation: 'Pantau stok importir dan jadwal kedatangan' },
    { commodity: 'Daging sapi', exposure: 65, reason: 'Sebagian pasokan dan pakan rentan kurs', mitigation: 'Atur jadwal impor dan distribusi cold chain' },
    { commodity: 'Beras', exposure: 28, reason: 'Relatif domestik, tetapi tetap sensitif cuaca dan logistik', mitigation: 'Optimalkan CPP dan redistribusi antarwilayah' },
  ],
  decision_plan: [
    {
      priority: 1,
      title: 'Pre-positioning stok ke Bali & Nusa Tenggara',
      rationale: 'Defisit beras dan risiko logistik membuat wilayah ini perlu buffer sebelum tekanan harga lokal membesar.',
      owner: 'Bulog, TPID, Dinas Pangan',
      timeframe: '0-14 hari',
      expected_metric: 'Gap pasokan wilayah turun minimal 30%',
    },
    {
      priority: 2,
      title: 'Mitigasi risiko panen di Sulawesi',
      rationale: 'Risiko cuaca perlu ditutup dengan validasi lapangan, buffer stok, dan kesiapan redistribusi.',
      owner: 'Dinas Pertanian, BMKG, penyuluh',
      timeframe: '0-21 hari',
      expected_metric: 'Alert tervalidasi dan rencana mitigasi aktif',
    },
    {
      priority: 3,
      title: 'Pantau komoditas impor sensitif kurs',
      rationale: 'Kedelai, bawang putih, dan daging sapi rentan imported inflation saat rupiah melemah.',
      owner: 'TPID, Bapanas, Disperindag',
      timeframe: '0-7 hari',
      expected_metric: 'Anomali harga turun atau pasokan pasar bertambah',
    },
    {
      priority: 4,
      title: 'Optimalkan rute biaya rendah dan backhaul',
      rationale: 'Penghematan biaya distribusi membantu menjaga harga akhir ketika kurs dan energi menekan biaya.',
      owner: 'Operator logistik, Bulog, pelabuhan',
      timeframe: '14-30 hari',
      expected_metric: 'Biaya distribusi per ton turun 5-10%',
    },
  ],
  data_provenance: [
    {
      dataset: 'Harga pangan',
      status: 'forecast',
      source: 'Menunggu BI Harga Pangan/Bapanas Panel Harga scraper saat backend aktif',
      freshness: 'offline forecast mode',
      method: 'model-derived fallback',
      expected_data: 'Harga harian per komoditas dan provinsi/pasar dari BI Harga Pangan atau Bapanas Panel Harga.',
    },
    {
      dataset: 'Cuaca',
      status: 'forecast',
      source: 'Menunggu BMKG Open Data API saat backend aktif',
      freshness: 'offline forecast mode',
      method: 'model-derived fallback',
      expected_data: 'Prakiraan cuaca per adm4, rainfall proxy, suhu, kelembapan, angin.',
    },
    {
      dataset: 'Supply-demand dan stok',
      status: 'unavailable',
      source: 'Belum ada API publik real-time yang terhubung',
      freshness: 'requires institutional integration',
      method: 'not claimed as real data',
      expected_data: 'commodity_code, region_code, period_date, production_ton, stock_ton, demand_ton, warehouse_id, last_updated_at',
    },
    {
      dataset: 'Rute logistik dan biaya',
      status: 'unavailable',
      source: 'Belum ada API operasional mitra yang terhubung',
      freshness: 'requires partner integration',
      method: 'not claimed as real data',
      expected_data: 'origin_region, destination_region, mode, capacity_ton, cost_per_ton, lead_time_days, carrier, last_updated_at',
    },
    {
      dataset: 'Makro rupiah dan inflasi',
      status: 'official-release',
      source: 'BPS/BI public release',
      freshness: '2026-07-17',
      method: 'official release reference',
      expected_data: 'BI rate, USD/IDR, inflasi yoy/mtm, volatile food, nilai impor, tanggal rilis.',
    },
  ],
  data_requirements: [
    {
      dataset: 'Supply-demand dan stok pangan',
      needed_fields: 'commodity_code, region_code, period_date, production_ton, stock_ton, demand_ton, warehouse_id, last_updated_at',
      preferred_source: 'Bapanas, Bulog, Dinas Pangan, dashboard gudang/logistik daerah',
      reason: 'Data stok operasional tidak tersedia sebagai API publik real-time yang stabil.',
    },
    {
      dataset: 'Rute dan biaya logistik aktual',
      needed_fields: 'origin_region, destination_region, mode, capacity_ton, cost_per_ton, lead_time_days, carrier, congestion_status',
      preferred_source: 'Bulog, operator pelabuhan, perusahaan logistik, API tarif/kapasitas mitra',
      reason: 'Tarif dan kapasitas rute aktual biasanya bersifat operasional/mitra.',
    },
  ],
};

function formatIdr(value) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
}

function scenarioScore(baseScore, scenario) {
  const penalty =
    Number(scenario.weakerRupiah || 0) * 0.9 +
    Number(scenario.logisticsCostUp || 0) * 0.55 +
    Number(scenario.harvestLoss || 0) * 1.3;
  return Math.max(0, Math.min(100, Math.round(Number(baseScore || 0) - penalty)));
}

function scenarioLabel(score) {
  if (score >= 78) return 'aman';
  if (score >= 65) return 'waspada';
  if (score >= 52) return 'siaga_1';
  if (score >= 40) return 'siaga_2';
  return 'kritis';
}

export default function Resilience() {
  const { data, loading } = useData(() => forecastApi.getResilience(), [], { pollInterval: 300000 });
  const [scenario, setScenario] = useState({
    weakerRupiah: 5,
    logisticsCostUp: 8,
    harvestLoss: 4,
  });

  const usingFallback = !data;
  const resilienceData = data || RESILIENCE_FALLBACK;
  const summary = resilienceData.summary || {};
  const macro = resilienceData.macro || {};
  const pressureBreakdown = Array.isArray(resilienceData.pressure_breakdown) ? resilienceData.pressure_breakdown : [];
  const importExposure = Array.isArray(resilienceData.import_exposure) ? resilienceData.import_exposure : [];
  const decisionPlan = Array.isArray(resilienceData.decision_plan) ? resilienceData.decision_plan : [];
  const provenance = Array.isArray(resilienceData.data_provenance) ? resilienceData.data_provenance : [];
  const dataRequirements = Array.isArray(resilienceData.data_requirements) ? resilienceData.data_requirements : [];
  const dataPolicy = resilienceData.data_policy || {};
  const scenarioResilienceScore = useMemo(
    () => scenarioScore(summary.resilience_score, scenario),
    [summary.resilience_score, scenario]
  );
  const scenarioLevel = scenarioLabel(scenarioResilienceScore);

  if (loading && !data) return <LoadingSpinner text="Memuat cockpit resiliensi pangan..." />;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs text-emerald-700 uppercase tracking-widest mb-1">Kepang AI Resilience Room</p>
          <h1 className="text-2xl font-medium">Cockpit Keputusan Ketahanan Pangan</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-3xl">
            Menghubungkan supply-demand, cuaca, harga, logistik, dan tekanan rupiah menjadi prioritas tindakan.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <StatusBadge status={summary.resilience_level} label={LEVEL_LABELS[summary.resilience_level] || 'Waspada'} />
          <span className="badge-blue">Pilot 6 wilayah agregasi</span>
          {usingFallback && <span className="badge-yellow">Forecast mode</span>}
          <span className="badge-gray">Update makro {macro.as_of || '2026-07-17'}</span>
        </div>
      </div>

      <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium text-yellow-900">Data lineage policy</p>
            <p className="text-xs text-yellow-800 mt-1">{dataPolicy.principle}</p>
          </div>
          <StatusBadge status={usingFallback ? 'forecast' : 'official-release'} label={usingFallback ? 'Forecast karena API offline' : 'Source-aware'} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs text-yellow-800">
          <p><span className="font-medium">Data asli:</span> {dataPolicy.real_time_rule}</p>
          <p><span className="font-medium">Forecast:</span> {dataPolicy.forecast_rule}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Resilience Score"
          value={summary.resilience_score ?? '-'}
          sub="Output model, bukan data mentah"
          valueClass={summary.resilience_score >= 65 ? 'text-green-600' : 'text-yellow-600'}
        />
        <MetricCard
          label="USD/IDR"
          value={macro.usd_idr ? formatIdr(macro.usd_idr) : '-'}
          sub={`${macro.usd_idr_change_ptp_pct || 0}% ptp vs 19 Mei 2026`}
          valueClass="text-blue-600"
        />
        <MetricCard
          label="Volatile Food YoY"
          value={`${macro.volatile_food_yoy_pct || 0}%`}
          sub="Komponen pangan bergejolak"
          valueClass="text-red-500"
        />
        <MetricCard
          label="Rata-rata Logistik"
          value={summary.avg_logistics_cost_per_ton ? formatIdr(summary.avg_logistics_cost_per_ton) : '-'}
          sub="Butuh integrasi rute aktual"
          valueClass="text-teal-700"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="card xl:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium">Tekanan Sistem Pangan</h3>
              <p className="text-xs text-gray-500 mt-0.5">Prioritas tekanan yang memengaruhi resiliensi keputusan saat ini</p>
            </div>
            <StatusBadge status={summary.resilience_level} label={`Pressure ${summary.pressure_index || 0}`} />
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pressureBreakdown} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value, name, item) => [`${value}/100`, item?.payload?.evidence || name]} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {pressureBreakdown.map((item) => (
                  <Cell key={item.key} fill={PRESSURE_COLORS[item.key] || '#64748b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-4">
            {pressureBreakdown.map((item) => (
              <div key={item.key} className="bg-gray-50 rounded-md p-3">
                <p className="text-xs font-medium text-gray-800">{item.label}</p>
                <p className="text-[11px] text-gray-500 mt-1">{item.evidence}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium mb-1">Skenario Shock</h3>
          <p className="text-xs text-gray-500 mb-4">Simulasi dampak pelemahan rupiah, logistik, dan produksi terhadap resilience score.</p>

          <div className="space-y-4">
            <label className="block">
              <span className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Rupiah melemah</span><span>{scenario.weakerRupiah}%</span>
              </span>
              <input className="w-full" type="range" min="0" max="15" value={scenario.weakerRupiah} onChange={(event) => setScenario({ ...scenario, weakerRupiah: event.target.value })} />
            </label>
            <label className="block">
              <span className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Biaya logistik naik</span><span>{scenario.logisticsCostUp}%</span>
              </span>
              <input className="w-full" type="range" min="0" max="20" value={scenario.logisticsCostUp} onChange={(event) => setScenario({ ...scenario, logisticsCostUp: event.target.value })} />
            </label>
            <label className="block">
              <span className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Kehilangan panen</span><span>{scenario.harvestLoss}%</span>
              </span>
              <input className="w-full" type="range" min="0" max="12" value={scenario.harvestLoss} onChange={(event) => setScenario({ ...scenario, harvestLoss: event.target.value })} />
            </label>
          </div>

          <div className="mt-5 bg-gray-50 rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">Score setelah skenario</p>
              <StatusBadge status={scenarioLevel} label={LEVEL_LABELS[scenarioLevel]} />
            </div>
            <p className={`text-3xl font-medium ${scenarioResilienceScore >= 65 ? 'text-green-600' : scenarioResilienceScore >= 52 ? 'text-yellow-600' : 'text-red-500'}`}>
              {scenarioResilienceScore}
            </p>
            <ProgressBar value={scenarioResilienceScore} color={scenarioResilienceScore >= 65 ? 'bg-green-500' : scenarioResilienceScore >= 52 ? 'bg-yellow-500' : 'bg-red-500'} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Prioritas Tindakan</h3>
            <StatusBadge status="forecast" label="forecast/model" />
          </div>
          <div className="space-y-3">
            {decisionPlan.map((plan) => (
              <div key={plan.priority} className="border border-gray-200 rounded-md p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-semibold shrink-0">
                    {plan.priority}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <p className="text-sm font-medium text-gray-900">{plan.title}</p>
                      <span className="badge-blue">{plan.timeframe}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{plan.rationale}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-xs">
                      <p><span className="text-gray-400">Owner:</span> {plan.owner}</p>
                      <p><span className="text-gray-400">KPI:</span> {plan.expected_metric}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Eksposur Imported Inflation</h3>
            <StatusBadge status="forecast" label="model-derived" />
          </div>
          <div className="space-y-3">
            {importExposure.map((item) => (
              <div key={item.commodity}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-gray-800">{item.commodity}</p>
                  <span className="text-xs text-gray-500">{item.exposure}%</span>
                </div>
                <ProgressBar value={item.exposure} color={item.exposure >= 80 ? 'bg-red-500' : item.exposure >= 60 ? 'bg-yellow-500' : 'bg-green-500'} />
                <p className="text-[11px] text-gray-500 mt-1">{item.reason}</p>
                <p className="text-[11px] text-emerald-700 mt-1">Mitigasi: {item.mitigation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium">Data Lineage</h3>
            <p className="text-xs text-gray-500 mt-0.5">Membedakan data real-time, rilis resmi, hasil forecast, dan data yang belum tersedia.</p>
          </div>
          <span className="badge-gray">Audit trail</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Dataset</th>
                <th>Status</th>
                <th>Sumber</th>
                <th>Freshness</th>
                <th>Metode</th>
              </tr>
            </thead>
            <tbody>
              {provenance.map((item) => (
                <tr key={item.dataset}>
                  <td className="font-medium">{item.dataset}</td>
                  <td><StatusBadge status={item.status} label={item.status} /></td>
                  <td className="text-xs text-gray-600">{item.source}</td>
                  <td className="text-xs text-gray-500">{item.freshness ? String(item.freshness) : '-'}</td>
                  <td className="text-xs text-gray-500">{item.method || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {dataRequirements.length > 0 && (
          <div className="mt-5">
            <h4 className="text-sm font-medium mb-3">Ekspektasi Data yang Diperlukan</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dataRequirements.map((item) => (
                <div key={item.dataset} className="border border-gray-200 rounded-md p-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-xs font-medium text-gray-900">{item.dataset}</p>
                    <StatusBadge status={item.status || 'unavailable'} label={item.status || 'needed'} />
                  </div>
                  <p className="text-[11px] text-gray-500">{item.reason}</p>
                  <p className="text-[11px] text-gray-600 mt-2"><span className="text-gray-400">Source:</span> {item.preferred_source}</p>
                  <p className="text-[11px] text-gray-600 mt-1 break-words"><span className="text-gray-400">Fields:</span> {item.needed_fields}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600">
          <div className="bg-gray-50 rounded-md p-3">
            <p className="font-medium text-gray-800">Market fit</p>
            <p className="mt-1">Dibangun untuk TPID, Bapanas, Bulog, dinas pangan, dan BI regional yang perlu keputusan cepat lintas data.</p>
          </div>
          <div className="bg-gray-50 rounded-md p-3">
            <p className="font-medium text-gray-800">Public value</p>
            <p className="mt-1">Mengurangi policy lag, memperkuat koordinasi stok, dan menjaga keterjangkauan pangan saat shock makro terjadi.</p>
          </div>
          <div className="bg-gray-50 rounded-md p-3">
            <p className="font-medium text-gray-800">MVP scope</p>
            <p className="mt-1">Pilot 6 wilayah agregasi, 8 komoditas, risk score, scenario planning, dan rekomendasi redistribusi.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
