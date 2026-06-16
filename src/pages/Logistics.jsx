import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { useData } from '../hooks/useData.js';
import { logisticsApi } from '../api.js';
import {
  MetricCard, StatusBadge, LoadingSpinner, ErrorState, RegionMap, ProgressBar,
} from '../components/shared/index.jsx';

const effColor = (value) => +value >= 75 ? '#22c55e' : +value >= 60 ? '#f59e0b' : '#ef4444';
const scoreColor = (value) => +value >= 75 ? 'bg-green-500' : +value >= 55 ? 'bg-yellow-500' : 'bg-red-500';

const EXPECTED_LOGISTICS_FIELDS = [
  'origin_region',
  'destination_region',
  'transport_mode',
  'capacity_ton',
  'cost_per_ton',
  'lead_time_days',
  'carrier',
  'congestion_status',
  'warehouse_stock_ton',
  'last_updated_at',
  'source_owner',
];

const formatIdr = (value) => value
  ? `Rp ${Number(value).toLocaleString('id-ID')}`
  : '-';

const formatTon = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '-';
  return `${Math.round(numeric).toLocaleString('id-ID')} ton`;
};

const formatKm = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '-';
  return `${Math.round(numeric).toLocaleString('id-ID')} km`;
};

const formatEta = (metric) => {
  if (!metric) return '-';
  if (metric.duration_days) return `${metric.duration_days} hari`;
  if (metric.duration_hours) return `${metric.duration_hours} jam`;
  return '-';
};

function buildEmbedUrl(recommendation) {
  const key = import.meta.env.VITE_GOOGLE_MAPS_EMBED_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key || !recommendation?.maps?.embed_supported) return null;

  const origin = recommendation.origin;
  const destination = recommendation.destination;
  if (
    origin?.latitude == null
    || origin?.longitude == null
    || destination?.latitude == null
    || destination?.longitude == null
  ) return null;

  const params = new URLSearchParams({
    key,
    origin: `${origin.latitude},${origin.longitude}`,
    destination: `${destination.latitude},${destination.longitude}`,
    mode: 'driving',
  });

  return `https://www.google.com/maps/embed/v1/directions?${params.toString()}`;
}

function actionLabel(action) {
  const labels = {
    dispatch_priority: 'Prioritas dispatch',
    stage_inventory: 'Staging stok',
    needs_supply_confirmation: 'Validasi suplai',
    monitor: 'Monitor',
  };
  return labels[action] || action || 'Rekomendasi';
}

export default function Logistics() {
  const { data: routes, loading, error: routesError, refresh } = useData(() => logisticsApi.getRoutes(), []);
  const { data: eff } = useData(() => logisticsApi.getEfficiency(), []);
  const { data: shipments } = useData(() => logisticsApi.getShipments(), []);
  const {
    data: recommendations,
    loading: recommendationLoading,
    error: recommendationError,
    refresh: refreshRecommendations,
  } = useData(
    () => logisticsApi.getRecommendations({ commodity: 'BERAS', limit: 12 }),
    [],
  );

  const { summary } = eff || {};
  const routeList = Array.isArray(routes) ? routes : [];
  const recommendationList = Array.isArray(recommendations?.recommendations) ? recommendations.recommendations : [];
  const topRecommendation = recommendationList[0];
  const embedUrl = buildEmbedUrl(topRecommendation);

  const chartData = routeList.map((route) => ({
    name: `${route.origin_name?.split(' ')[0]} -> ${route.destination_name?.split(' ')[0].split('&')[0].trim()}`,
    efisiensi: parseFloat(route.avg_efficiency_pct) || 70,
    biaya: Math.round(Number(route.cost_per_ton || 0) / 1000),
  }));

  const connectionData = routeList.slice(0, 6).map((route) => ({
    from: route.origin_code,
    to: route.destination_code,
    weight: Math.max(1.2, Math.min(3.4, (+route.capacity_ton || 0) / 8000)),
    tone: +route.avg_efficiency_pct >= 75 ? 'positive' : +route.avg_efficiency_pct >= 60 ? 'warning' : 'danger',
  }));

  const nodeMap = {};
  routeList.forEach((route) => {
    const score = parseFloat(route.avg_efficiency_pct) || 70;
    if (!nodeMap[route.origin_code]) nodeMap[route.origin_code] = { code: route.origin_code, label: route.origin_name, score: [] };
    if (!nodeMap[route.destination_code]) nodeMap[route.destination_code] = { code: route.destination_code, label: route.destination_name, score: [] };
    nodeMap[route.origin_code].score.push(score);
    nodeMap[route.destination_code].score.push(score);
  });
  const regions = Object.values(nodeMap).map((region) => {
    const avgScore = region.score.reduce((sum, value) => sum + value, 0) / (region.score.length || 1);
    return {
      code: region.code,
      label: region.label,
      value: `${Math.round(avgScore)}%`,
      note: 'Efisiensi jaringan',
      tone: avgScore >= 75 ? 'positive' : avgScore >= 60 ? 'warning' : 'danger',
    };
  });

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-medium">Logistik Cerdas</h1>
        <p className="text-sm text-gray-500 mt-0.5">Rekomendasi distribusi pangan dengan data lineage per rute</p>
      </div>

      {routesError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <StatusBadge status="unavailable" label="logistics data unavailable" />
                <p className="text-sm font-medium text-red-800">Sumber data logistik belum tersambung</p>
              </div>
              <p className="text-xs text-red-700 mt-2">
                Endpoint logistik tidak mengembalikan data. Jalankan database/seed atau hubungkan feed operator sebelum mengklaim rute sebagai data asli.
              </p>
            </div>
            <button className="btn-secondary text-xs shrink-0" onClick={refresh}>Retry</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Rute Aktif" value={summary?.total_routes || routes?.length || '-'} sub="Antar wilayah" />
        <MetricCard label="Biaya/ton Rata-rata" value={summary?.avg_cost_per_ton ? formatIdr(summary.avg_cost_per_ton) : '-'} sub="Forecast route table" />
        <MetricCard label="Durasi Rata-rata" value={summary?.avg_duration_days ? `${summary.avg_duration_days} hari` : '-'} sub="Lead time estimasi" />
        <MetricCard label="Kapasitas Total" value={summary?.total_capacity_ton ? `${Math.round(summary.total_capacity_ton / 1000)}K ton` : '-'} sub="Per pengiriman" />
      </div>

      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
          <div>
            <h3 className="text-sm font-medium">Rekomendasi Rute Prioritas</h3>
            <p className="text-xs text-gray-500 mt-0.5">Ranking memakai urgensi defisit, kapasitas, biaya, ETA, efisiensi, dan confidence sumber data.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="real-time" label={`${recommendations?.summary?.real_time_route_metrics || 0} real-time`} />
            <StatusBadge status="forecast" label={`${recommendations?.summary?.forecast_route_metrics || 0} forecast`} />
            <StatusBadge status="unavailable" label={`${recommendations?.summary?.unavailable_google_metrics || 0} Google unavailable`} />
          </div>
        </div>

        {recommendationLoading ? <LoadingSpinner text="Menghitung rekomendasi logistik..." /> : recommendationError ? (
          <UnavailableLogisticsPanel message={recommendationError} onRetry={refreshRecommendations} />
        ) : !recommendationList.length ? (
          <UnavailableLogisticsPanel message="Belum ada rute yang dapat dinilai." onRetry={refreshRecommendations} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-5">
            <div className="space-y-3">
              {recommendationList.slice(0, 4).map((item, index) => (
                <div key={item.route_id} className="rounded-md border border-gray-200 p-4 bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-400">#{index + 1}</span>
                        <StatusBadge status={item.route_metric?.source_type} label={item.route_metric?.source_type} />
                        <StatusBadge status={item.recommendation?.action === 'dispatch_priority' ? 'surplus' : 'balanced'} label={actionLabel(item.recommendation?.action)} />
                      </div>
                      <p className="text-sm font-medium truncate">{item.origin.name}{' -> '}{item.destination.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.recommendation?.text}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-medium">{item.scores?.recommendation || 0}</p>
                      <p className="text-[10px] text-gray-400 uppercase">score</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs">
                    <div>
                      <p className="text-gray-400">Volume</p>
                      <p className="font-medium">{formatTon(item.recommendation?.recommended_volume_ton)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">ETA</p>
                      <p className="font-medium">{formatEta(item.route_metric)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Jarak</p>
                      <p className="font-medium">{formatKm(item.route_metric?.distance_km)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Biaya/ton</p>
                      <p className="font-medium">{formatIdr(item.cost_capacity?.cost_per_ton_idr)}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>Confidence keputusan</span>
                      <span>{item.scores?.source_confidence || 0}% source confidence</span>
                    </div>
                    <ProgressBar value={item.scores?.recommendation || 0} color={scoreColor(item.scores?.recommendation || 0)} />
                  </div>

                  <p className="text-[11px] text-gray-500 mt-3">{item.recommendation?.rationale}</p>
                </div>
              ))}
            </div>

            <div className="rounded-md border border-gray-200 overflow-hidden bg-gray-50 min-h-[360px]">
              {embedUrl ? (
                <iframe
                  title="Google Maps rekomendasi logistik"
                  src={embedUrl}
                  className="w-full h-[360px] border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <div className="h-[360px] flex flex-col items-center justify-center text-center px-6">
                  <p className="text-sm font-medium text-gray-700">Google Maps embed belum aktif</p>
                  <p className="text-xs text-gray-500 mt-2 max-w-sm">
                    Tambahkan `VITE_GOOGLE_MAPS_EMBED_API_KEY` untuk peta iframe. Rekomendasi tetap berjalan dari backend dengan label forecast/unavailable.
                  </p>
                  {topRecommendation?.maps?.google_maps_url && (
                    <a
                      className="btn-secondary text-xs mt-4"
                      href={topRecommendation.maps.google_maps_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Buka Google Maps
                    </a>
                  )}
                </div>
              )}
              {topRecommendation && (
                <div className="border-t border-gray-200 p-4 bg-white">
                  <p className="text-xs font-medium text-gray-700">{topRecommendation.route_name}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{topRecommendation.maps?.caveat}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium">Peta Jaringan Distribusi</h3>
            <p className="text-xs text-gray-400 mt-0.5">Node menampilkan efisiensi jaringan aktif; garis lebih tebal berarti kapasitas lebih besar.</p>
          </div>
          <StatusBadge status={avgScoreToStatus(summary?.avg_duration_days, summary?.avg_cost_per_ton)} label="Jaringan logistik" />
        </div>
        {loading ? <LoadingSpinner text="Memuat peta logistik..." /> : routesError ? (
          <ErrorState message={routesError} onRetry={refresh} />
        ) : !routeList.length ? (
          <UnavailableLogisticsPanel message="Belum ada rute aktif." onRetry={refresh} />
        ) : (
          <RegionMap
            regions={regions}
            connections={connectionData}
            caption="Network view berdasarkan rute aktif di database prototype."
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="text-sm font-medium mb-4">Efisiensi per Rute (%)</h3>
          {loading ? <LoadingSpinner /> : routesError ? <ErrorState message={routesError} onRetry={refresh} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(value) => `${value}%`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                <Tooltip formatter={(value) => [`${value}%`, 'Efisiensi']} />
                <Bar dataKey="efisiensi" radius={[0, 3, 3, 0]}>
                  {chartData.map((data, index) => (
                    <Cell key={index} fill={effColor(data.efisiensi)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 className="text-sm font-medium mb-4">Biaya per Ton (x Rp 1.000)</h3>
          {loading ? <LoadingSpinner /> : routesError ? <ErrorState message={routesError} onRetry={refresh} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(value) => `${value}rb`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                <Tooltip formatter={(value) => [`Rp ${(value * 1000).toLocaleString('id-ID')}/ton`, 'Biaya']} />
                <Bar dataKey="biaya" fill="#2563eb" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h3 className="text-sm font-medium mb-4">Semua Rute Distribusi</h3>
        {loading ? <LoadingSpinner /> : routesError ? <ErrorState message={routesError} onRetry={refresh} /> : (
          <table className="table-base min-w-[820px]">
            <thead>
              <tr>
                <th>Rute</th>
                <th>Moda</th>
                <th className="text-right">Jarak</th>
                <th className="text-right">Durasi</th>
                <th className="text-right">Biaya/ton</th>
                <th className="text-right">Kapasitas</th>
                <th className="text-right">Efisiensi</th>
                <th>Pengiriman Aktif</th>
              </tr>
            </thead>
            <tbody>
              {routeList.map((route) => (
                <tr key={route.id}>
                  <td>
                    <p className="text-xs font-medium">{route.route_name}</p>
                    <p className="text-[10px] text-gray-400">{route.origin_name}{' -> '}{route.destination_name}</p>
                  </td>
                  <td><span className="badge-blue text-[10px]">{route.transport_mode?.replace('_', ' ')}</span></td>
                  <td className="text-right text-xs">{route.distance_km?.toLocaleString('id-ID')} km</td>
                  <td className="text-right text-xs">{route.duration_days} hari</td>
                  <td className="text-right font-mono text-xs">{formatIdr(route.cost_per_ton)}</td>
                  <td className="text-right text-xs">{Number(route.capacity_ton).toLocaleString('id-ID')} ton</td>
                  <td className="text-right text-xs font-medium" style={{ color: effColor(route.avg_efficiency_pct) }}>{route.avg_efficiency_pct}%</td>
                  <td className="text-center">
                    {+route.active_shipments > 0 ? <span className="badge-blue">{route.active_shipments} aktif</span> : <span className="text-xs text-gray-400">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {shipments?.length > 0 && (
        <div className="card overflow-x-auto">
          <h3 className="text-sm font-medium mb-4">Pengiriman Terbaru</h3>
          <table className="table-base min-w-[760px]">
            <thead>
              <tr>
                <th>Asal {' -> '} Tujuan</th>
                <th>Komoditas</th>
                <th className="text-right">Volume</th>
                <th>Berangkat</th>
                <th>Tiba</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {shipments.slice(0, 10).map((shipment) => (
                <tr key={shipment.id}>
                  <td className="text-xs">{shipment.origin_name}{' -> '}{shipment.destination_name}</td>
                  <td className="text-xs">{shipment.commodity_name}</td>
                  <td className="text-right font-mono text-xs">{formatTon(shipment.volume_ton)}</td>
                  <td className="text-xs text-gray-500">{shipment.departure_date ? new Date(shipment.departure_date).toLocaleDateString('id-ID') : '-'}</td>
                  <td className="text-xs text-gray-500">{shipment.arrival_date ? new Date(shipment.arrival_date).toLocaleDateString('id-ID') : '-'}</td>
                  <td><StatusBadge status={shipment.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UnavailableLogisticsPanel({ message, onRetry }) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <StatusBadge status="unavailable" label="unavailable" />
            <p className="text-sm font-medium text-gray-800">{message}</p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Data yang dibutuhkan untuk production:
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {EXPECTED_LOGISTICS_FIELDS.map((field) => (
              <span key={field} className="badge-gray">{field}</span>
            ))}
          </div>
        </div>
        {onRetry && <button className="btn-secondary text-xs shrink-0" onClick={onRetry}>Retry</button>}
      </div>
    </div>
  );
}

function avgScoreToStatus(duration, cost) {
  if (!duration || !cost) return 'balanced';
  if (+duration <= 4 && +cost <= 260000) return 'surplus';
  if (+duration <= 6 && +cost <= 320000) return 'warning';
  return 'deficit';
}
