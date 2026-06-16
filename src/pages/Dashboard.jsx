import { useData } from '../hooks/useData.js';
import { supplyApi, weatherApi, pricesApi, logisticsApi, forecastApi } from '../api.js';
import { MetricCard, StatusBadge, AlertBanner, LoadingSpinner, RegionMap } from '../components/shared/index.jsx';

export default function Dashboard() {
  const { data: balance } = useData(() => supplyApi.getBalance(), [], { pollInterval: 300000 });
  const { data: alerts } = useData(() => weatherApi.getAlerts(), [], { pollInterval: 600000 });
  const { data: risks } = useData(() => weatherApi.getRisk(), [], { pollInterval: 600000 });
  const { data: commodities } = useData(() => pricesApi.getCommodities(), [], { pollInterval: 600000 });
  const { data: regions } = useData(() => supplyApi.getRegions('BERAS'), [], { pollInterval: 300000 });
  const { data: routes } = useData(() => logisticsApi.getRoutes(), [], { pollInterval: 600000 });
  const { data: resilience } = useData(() => forecastApi.getResilience(), [], { pollInterval: 600000 });

  const fmtTon = (value) => value ? `${(+value / 1000).toFixed(0)} ribu ton` : '—';
  const fmtPct = (value) => value != null ? `${+value > 0 ? '+' : ''}${(+value).toFixed(1)}%` : '—';

  const commodityList = Array.isArray(commodities) ? commodities : [];
  const regionList = Array.isArray(regions) ? regions : [];
  const routeList = Array.isArray(routes) ? routes : [];
  const alertList = Array.isArray(alerts) ? alerts : [];
  const riskList = Array.isArray(risks) ? risks : [];
  const decisionPlan = Array.isArray(resilience?.decision_plan) ? resilience.decision_plan : [];
  const macro = resilience?.macro || {};
  const resilienceScore = resilience?.summary?.resilience_score;

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
    : '—';

  const regionMapData = regionList.map((region) => ({
    code: region.code,
    label: region.region_name,
    value: `${+region.balance_ton >= 0 ? '+' : ''}${Math.round((+region.balance_ton || 0) / 1000)}K`,
    note: region.status === 'deficit' ? 'Defisit pasokan' : region.status === 'surplus' ? 'Surplus pasokan' : 'Hampir seimbang',
    tone: region.status === 'deficit' ? 'danger' : region.status === 'surplus' ? 'positive' : 'warning',
  }));

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div>
        <p className="text-xs text-green-700 uppercase tracking-widest mb-1">Kepang AI Decision Intelligence</p>
        <h1 className="text-2xl font-medium">Cockpit Ketahanan Pangan Indonesia</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pilot 6 wilayah agregasi · Periode {balance?.period_month ? new Date(balance.period_month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : 'terbaru'} · Diperbarui {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {alertList.length > 0 && <AlertBanner alerts={alertList.slice(0, 2)} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Resilience Score" value={resilienceScore ?? foodSecurityIndex} sub="Skala 0-100, makin tinggi makin tahan shock" valueClass={+(resilienceScore ?? foodSecurityIndex) >= 65 ? 'text-green-600' : 'text-yellow-600'} />
        <MetricCard label="USD/IDR Risk" value={macro.usd_idr ? `Rp ${Number(macro.usd_idr).toLocaleString('id-ID')}` : '—'} sub={macro.usd_idr_change_ptp_pct ? `${macro.usd_idr_change_ptp_pct}% ptp vs akhir April` : 'Tekanan imported inflation'} valueClass="text-blue-600" />
        <MetricCard label="Volatile Food YoY" value={macro.volatile_food_yoy_pct ? `${macro.volatile_food_yoy_pct}%` : (topCommodity ? fmtPct(topCommodity.change_yoy_pct) : '—')} sub="Sinyal tekanan pangan bergejolak" valueClass="text-red-500" />
        <MetricCard label="Wilayah Defisit" value={balance ? `${balance.deficit_regions} / 6` : '—'} sub="Wilayah perlu intervensi" valueClass={balance?.deficit_regions > 0 ? 'text-yellow-600' : 'text-green-600'} />
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="text-sm font-medium mb-4">Neraca Pasokan per Wilayah — Beras</h3>
          {!regions ? <LoadingSpinner text="Memuat neraca..." /> : (
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
          {!commodities ? <LoadingSpinner text="Memuat harga..." /> : (
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
          {!alerts ? <LoadingSpinner /> : alertList.length === 0 ? (
            <div className="py-6">
              <p className="text-sm text-gray-700">Belum ada alert BMKG aktif yang cocok dengan 6 wilayah agregasi saat ini.</p>
              {topRisk && <p className="text-xs text-gray-500 mt-2">Risiko tertinggi tetap terpantau di {topRisk.region_name} dengan skor {Math.round(topRisk.risk_score)}%.</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {alertList.map((alert) => (
                <div key={alert.id} className="border-l-2 pl-3 border-red-300">
                  <p className="text-xs font-medium text-gray-800">{alert.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{alert.region_name} · {alert.alert_type}</p>
                  <StatusBadge status={alert.severity} label={alert.severity} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-sm font-medium mb-4">Rute Distribusi Aktif</h3>
          {!routes ? <LoadingSpinner /> : (
            <table className="table-base">
              <thead><tr><th>Rute</th><th className="text-right">Biaya/ton</th><th className="text-right">Efisiensi</th></tr></thead>
              <tbody>
                {routeList.slice(0, 5).map((route) => (
                  <tr key={route.id}>
                    <td><span className="text-xs">{route.origin_name?.split(' ')[0]} → {route.destination_name?.split(' &')[0]}</span></td>
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
