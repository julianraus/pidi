import { useData } from '../hooks/useData.js';
import { supplyApi, weatherApi, pricesApi, logisticsApi, forecastApi } from '../api.js';
import { MetricCard, StatusBadge, AlertBanner, LoadingSpinner, ProgressBar, RegionMap, ScoreRing } from '../components/shared/index.jsx';

const DASHBOARD_FALLBACK = {
  balance: {
    period_month: '2026-06-01',
    total_supply: 4520000,
    total_demand: 4380000,
    total_balance: 140000,
    deficit_regions: 2,
  },
  regions: [
    { id: 'fb-1', code: 'SUM', region_name: 'Sumatera', supply_ton: 780000, demand_ton: 710000, balance_ton: 70000, status: 'surplus' },
    { id: 'fb-2', code: 'JAW', region_name: 'Jawa', supply_ton: 1880000, demand_ton: 1820000, balance_ton: 60000, status: 'surplus' },
    { id: 'fb-3', code: 'KAL', region_name: 'Kalimantan', supply_ton: 410000, demand_ton: 390000, balance_ton: 20000, status: 'balanced' },
    { id: 'fb-4', code: 'SUL', region_name: 'Sulawesi', supply_ton: 620000, demand_ton: 610000, balance_ton: 10000, status: 'balanced' },
    { id: 'fb-5', code: 'BNT', region_name: 'Bali & Nusa Tenggara', supply_ton: 310000, demand_ton: 360000, balance_ton: -50000, status: 'deficit' },
    { id: 'fb-6', code: 'PMA', region_name: 'Papua & Maluku', supply_ton: 520000, demand_ton: 490000, balance_ton: 30000, status: 'surplus' },
  ],
  commodities: [
    { id: 'fc-1', name: 'Cabai Merah', current_price: 79000, change_mom_pct: 8.4, change_yoy_pct: 18.2, pct_of_het: 124 },
    { id: 'fc-2', name: 'Bawang Merah', current_price: 47000, change_mom_pct: 5.1, change_yoy_pct: 11.7, pct_of_het: 112 },
    { id: 'fc-3', name: 'Beras Medium', current_price: 14200, change_mom_pct: 1.8, change_yoy_pct: 5.4, pct_of_het: 101 },
    { id: 'fc-4', name: 'Minyak Goreng', current_price: 18100, change_mom_pct: 2.6, change_yoy_pct: 6.1, pct_of_het: 106 },
  ],
  risks: [
    { code: 'SUL', region_name: 'Sulawesi', risk_score: 66, risk_level: 'high' },
    { code: 'BNT', region_name: 'Bali & Nusa Tenggara', risk_score: 58, risk_level: 'medium' },
    { code: 'JAW', region_name: 'Jawa', risk_score: 42, risk_level: 'medium' },
  ],
  routes: [
    { id: 'fr-1', origin_name: 'Jawa', destination_name: 'Bali & Nusa Tenggara', cost_per_ton: 245000, avg_efficiency_pct: 78 },
    { id: 'fr-2', origin_name: 'Sulawesi', destination_name: 'Papua & Maluku', cost_per_ton: 315000, avg_efficiency_pct: 64 },
    { id: 'fr-3', origin_name: 'Sumatera', destination_name: 'Jawa', cost_per_ton: 215000, avg_efficiency_pct: 82 },
  ],
  resilience: {
    macro: {
      usd_idr: 17944,
      usd_idr_change_ptp_pct: 1.4,
      volatile_food_yoy_pct: 5.58,
    },
    summary: {
      resilience_score: 63,
      resilience_level: 'siaga_1',
    },
    decision_plan: [
      {
        priority: 1,
        title: 'Pre-positioning stok ke Bali & Nusa Tenggara',
        rationale: 'Mode forecast menunjukkan wilayah defisit perlu buffer stok sebelum tekanan harga lokal membesar.',
        owner: 'Bulog, TPID, Dinas Pangan',
        timeframe: '0-14 hari',
        expected_metric: 'Gap pasokan wilayah turun minimal 30%',
      },
      {
        priority: 2,
        title: 'Pantau komoditas impor sensitif kurs',
        rationale: 'Rupiah melemah dapat menekan komoditas impor, energi, pakan, dan biaya distribusi.',
        owner: 'TPID, Bapanas, Disperindag',
        timeframe: '0-7 hari',
        expected_metric: 'Anomali harga turun atau pasokan pasar bertambah',
      },
    ],
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

  const fmtTon = (value) => value ? `${(+value / 1000).toFixed(0)} ribu ton` : '-';
  const fmtPct = (value) => value != null ? `${+value > 0 ? '+' : ''}${(+value).toFixed(1)}%` : '-';

  const usingBalanceFallback = !balanceRaw;
  const usingCommodityFallback = !(Array.isArray(commoditiesRaw) && commoditiesRaw.length);
  const usingRegionFallback = !(Array.isArray(regionsRaw) && regionsRaw.length);
  const usingRouteFallback = !(Array.isArray(routesRaw) && routesRaw.length);
  const usingRiskFallback = !(Array.isArray(risksRaw) && risksRaw.length);
  const usingResilienceFallback = !resilienceRaw;

  const balance = balanceRaw || DASHBOARD_FALLBACK.balance;
  const commodityList = usingCommodityFallback ? DASHBOARD_FALLBACK.commodities : commoditiesRaw;
  const regionList = usingRegionFallback ? DASHBOARD_FALLBACK.regions : regionsRaw;
  const routeList = usingRouteFallback ? DASHBOARD_FALLBACK.routes : routesRaw;
  const alertList = Array.isArray(alertsRaw) ? alertsRaw : [];
  const riskList = usingRiskFallback ? DASHBOARD_FALLBACK.risks : risksRaw;
  const resilience = resilienceRaw || DASHBOARD_FALLBACK.resilience;
  const isForecastMode = usingBalanceFallback || usingCommodityFallback || usingRegionFallback
    || usingRouteFallback || usingRiskFallback || usingResilienceFallback;
  const decisionPlan = Array.isArray(resilience?.decision_plan) ? resilience.decision_plan : [];
  const macro = resilience?.macro || {};
  const resilienceScore = resilience?.summary?.resilience_score;
  const provenance = Array.isArray(resilience?.data_provenance) ? resilience.data_provenance : [];

  const topCommodity = commodityList.find((commodity) => commodity.change_yoy_pct > 0) || null;
  const aboveHetList = commodityList.filter((commodity) => +(commodity.pct_of_het || 0) > 100);
  const topRisk = [...riskList].sort((a, b) => +b.risk_score - +a.risk_score)[0] || null;
  const foodSecurityIndex = balance
    ? Math.max(0, Math.min(100,
      80
      + ((+(balance.total_balance || 0) / Math.max(+(balance.total_demand || 1), 1)) * 100)
      - (aboveHetList.length * 2.5)
      - (topRisk ? (+topRisk.risk_score * 0.18) : 0)
    )).toFixed(1)
    : '-';
  const primaryAction = decisionPlan[0] || null;
  const sourceCounts = provenance.reduce((acc, item) => {
    const key = item.status || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const dataConfidenceScore = provenance.length
    ? Math.round(((sourceCounts['real-time'] || 0) * 100
      + (sourceCounts['official-release'] || 0) * 88
      + (sourceCounts.forecast || 0) * 62
      + (sourceCounts.unavailable || 0) * 28) / provenance.length)
    : 58;
  const currentScore = Number(resilienceScore ?? foodSecurityIndex) || 0;
  const readinessLabel = currentScore >= 70 ? 'Aman dipantau' : currentScore >= 55 ? 'Butuh intervensi terarah' : 'Prioritas tinggi';

  const regionMapData = regionList.map((region) => ({
    code: region.code,
    label: region.region_name,
    value: `${+region.balance_ton >= 0 ? '+' : ''}${Math.round((+region.balance_ton || 0) / 1000)}K`,
    note: region.status === 'deficit' ? 'Defisit pasokan' : region.status === 'surplus' ? 'Surplus pasokan' : 'Hampir seimbang',
    tone: region.status === 'deficit' ? 'danger' : region.status === 'surplus' ? 'positive' : 'warning',
  }));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl">
      <div className="hero-panel p-6 sm:p-8 reveal">
        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="live-dot" />
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-emerald-300/90">Kepang AI - Decision Intelligence</p>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white">Cockpit Ketahanan Pangan Indonesia</h1>
            <p className="text-sm text-emerald-100/65 mt-2">
              Pilot 6 wilayah agregasi - periode {balance?.period_month ? new Date(balance.period_month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : 'terbaru'} - harga, cuaca, pasokan, dan logistik dianyam jadi satu keputusan.
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              <StatusBadge status={currentScore >= 65 ? 'surplus' : 'warning'} label={readinessLabel} />
              <StatusBadge status="reference" label={`Data confidence ${dataConfidenceScore}%`} />
              {isForecastMode && <StatusBadge status="forecast" label="Forecast/offline mode" />}
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-300/70 mb-1.5">Decision brief hari ini</p>
              <h2 className="text-base sm:text-lg font-medium text-white leading-snug">
                {primaryAction?.title || 'Tentukan prioritas wilayah dari gabungan harga, stok, cuaca, rupiah, dan logistik'}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/60 mt-1.5">
                {primaryAction?.rationale || 'Dashboard ini dirancang untuk mengurangi policy lag dengan menampilkan penyebab risiko dan rekomendasi tindakan, bukan hanya angka monitoring.'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-4">
                <div className="glass-chip">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-300/80">Owner</p>
                  <p className="text-xs text-white mt-1">{primaryAction?.owner || 'TPID, pemda, Bulog, dinas pangan'}</p>
                </div>
                <div className="glass-chip">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-sky-300/80">Timeframe</p>
                  <p className="text-xs text-white mt-1">{primaryAction?.timeframe || '0-14 hari'}</p>
                </div>
                <div className="glass-chip">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-amber-300/80">KPI</p>
                  <p className="text-xs text-white mt-1">{primaryAction?.expected_metric || 'Time-to-insight turun dan gap pasokan menurun'}</p>
                </div>
              </div>
            </div>
          </div>

          <ScoreRing
            score={currentScore}
            sublabel={currentScore >= 65 ? 'Kondisi tahan shock, tetap dipantau' : 'Butuh intervensi terarah minggu ini'}
          />
        </div>
      </div>

      {alertList.length > 0 && <AlertBanner alerts={alertList.slice(0, 2)} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 reveal-1">
        <MetricCard label="Resilience Score" value={resilienceScore ?? foodSecurityIndex} sub="Skala 0-100, makin tinggi makin tahan shock" valueClass={+(resilienceScore ?? foodSecurityIndex) >= 65 ? 'text-green-600' : 'text-yellow-600'} />
        <MetricCard label="USD/IDR Risk" value={macro.usd_idr ? `Rp ${Number(macro.usd_idr).toLocaleString('id-ID')}` : '-'} sub={macro.usd_idr_change_ptp_pct ? `${macro.usd_idr_change_ptp_pct}% ptp vs 19 Mei 2026` : 'Tekanan imported inflation'} valueClass="text-blue-600" />
        <MetricCard label="Volatile Food YoY" value={macro.volatile_food_yoy_pct ? `${macro.volatile_food_yoy_pct}%` : (topCommodity ? fmtPct(topCommodity.change_yoy_pct) : '-')} sub="Sinyal tekanan pangan bergejolak" valueClass="text-red-500" />
        <MetricCard label="Wilayah Defisit" value={balance ? `${balance.deficit_regions} / 6` : '-'} sub="Wilayah perlu intervensi" valueClass={balance?.deficit_regions > 0 ? 'text-yellow-600' : 'text-green-600'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-5 reveal-2">
        {decisionPlan.length > 0 && (
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium">Prioritas Keputusan Hari Ini</h3>
                <p className="text-xs text-gray-400 mt-0.5">Tindakan yang menghubungkan risiko harga, cuaca, pasokan, rupiah, dan logistik</p>
              </div>
              <span className="badge-blue">Prioritas aktif</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {decisionPlan.slice(0, 4).map((item) => (
                <div key={item.priority} className="bg-gray-50 rounded-md p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded bg-white border border-gray-200 flex items-center justify-center text-[11px] font-medium">{item.priority}</span>
                    <p className="text-xs font-medium text-gray-900">{item.title}</p>
                  </div>
                  <p className="text-[11px] text-gray-500">{item.rationale}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium">Source Confidence</h3>
              <p className="text-xs text-gray-500 mt-0.5">Status data yang dipakai untuk mengambil keputusan.</p>
            </div>
            <StatusBadge status={dataConfidenceScore >= 70 ? 'surplus' : 'warning'} label={`${dataConfidenceScore}%`} />
          </div>
          <ProgressBar value={dataConfidenceScore} color={dataConfidenceScore >= 70 ? 'bg-emerald-500' : 'bg-yellow-500'} />
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[
              ['real-time', sourceCounts['real-time'] || 0],
              ['official-release', sourceCounts['official-release'] || 0],
              ['forecast', sourceCounts.forecast || 0],
              ['unavailable', sourceCounts.unavailable || 0],
            ].map(([status, count]) => (
              <div key={status} className="rounded-md bg-gray-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge status={status} label={status} />
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card reveal-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium">Peta Status Nasional</h3>
            <p className="text-xs text-gray-400 mt-0.5">Ringkasan cepat keseimbangan pasokan beras per wilayah agregasi</p>
          </div>
          {topRisk && <StatusBadge status={topRisk.risk_level} label={`Risiko tertinggi: ${topRisk.region_name}`} />}
        </div>
        {!regionList.length ? <LoadingSpinner text="Memuat peta nasional..." /> : (
          <RegionMap
            regions={regionMapData}
            caption="Warna menunjukkan tekanan supply-demand. Hijau surplus, merah defisit, kuning relatif seimbang."
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 reveal-4">
        <div className="card">
          <h3 className="text-sm font-medium mb-4">Neraca Pasokan per Wilayah - Beras</h3>
          {!regionList.length ? <LoadingSpinner text="Memuat neraca..." /> : (
            <table className="table-base">
              <thead><tr><th>Wilayah</th><th className="text-right">Pasokan</th><th className="text-right">Permintaan</th><th>Status</th></tr></thead>
              <tbody>
                {regionList.map((region) => (
                  <tr key={region.id}>
                    <td>{region.region_name}</td>
                    <td className="text-right font-mono text-xs">{fmtTon(region.supply_ton)}</td>
                    <td className="text-right font-mono text-xs">{fmtTon(region.demand_ton)}</td>
                    <td><StatusBadge status={region.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3 className="text-sm font-medium mb-4">Harga Komoditas Terkini</h3>
          {!commodityList.length ? <LoadingSpinner text="Memuat harga..." /> : (
            <table className="table-base">
              <thead><tr><th>Komoditas</th><th className="text-right">Harga (Rp)</th><th className="text-right">MoM</th><th className="text-right">YoY</th></tr></thead>
              <tbody>
                {commodityList.slice(0, 6).map((commodity) => (
                  <tr key={commodity.id}>
                    <td>{commodity.name}</td>
                    <td className="text-right font-mono text-xs">{Number(commodity.current_price).toLocaleString('id-ID')}</td>
                    <td className={`text-right font-mono text-xs ${+commodity.change_mom_pct > 0 ? 'text-red-500' : 'text-green-600'}`}>{fmtPct(commodity.change_mom_pct)}</td>
                    <td className={`text-right font-mono text-xs ${+commodity.change_yoy_pct > 5 ? 'text-red-500' : +commodity.change_yoy_pct > 2 ? 'text-yellow-600' : 'text-green-600'}`}>{fmtPct(commodity.change_yoy_pct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3 className="text-sm font-medium mb-4">Peringatan Dini Aktif</h3>
          {alertList.length === 0 ? (
            <div className="py-6">
              <p className="text-sm text-gray-700">Belum ada alert BMKG aktif yang cocok dengan 6 wilayah agregasi saat ini.</p>
              {topRisk && <p className="text-xs text-gray-500 mt-2">Risiko tertinggi tetap terpantau di {topRisk.region_name} dengan skor {Math.round(topRisk.risk_score)}%.</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {alertList.map((alert) => (
                <div key={alert.id} className="border-l-2 pl-3 border-red-300">
                  <p className="text-xs font-medium text-gray-800">{alert.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{alert.region_name} - {alert.alert_type}</p>
                  <StatusBadge status={alert.severity} label={alert.severity} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-sm font-medium mb-4">Rute Distribusi Aktif</h3>
          {!routeList.length ? <LoadingSpinner /> : (
            <table className="table-base">
              <thead><tr><th>Rute</th><th className="text-right">Biaya/ton</th><th className="text-right">Efisiensi</th></tr></thead>
              <tbody>
                {routeList.slice(0, 5).map((route) => (
                  <tr key={route.id}>
                    <td><span className="text-xs">{route.origin_name?.split(' ')[0]} {' -> '} {route.destination_name?.split(' &')[0]}</span></td>
                    <td className="text-right font-mono text-xs">Rp {Number(route.cost_per_ton).toLocaleString('id-ID')}</td>
                    <td className={`text-right text-xs font-medium ${+route.avg_efficiency_pct >= 75 ? 'text-green-600' : +route.avg_efficiency_pct >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>{route.avg_efficiency_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
