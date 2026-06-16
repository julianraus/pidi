import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { useData } from '../hooks/useData.js';
import { pricesApi } from '../api.js';
import { MetricCard, StatusBadge, LoadingSpinner, RegionMap } from '../components/shared/index.jsx';

const COLORS = { CABAI: '#ef4444', BAWANG: '#f59e0b', BERAS: '#2563eb', JAGUNG: '#10b981', KEDELAI: '#8b5cf6', MINYAK: '#f97316', GULA: '#ec4899', DAGING: '#6b7280' };

export default function Inflation() {
  const [selectedCode, setSelectedCode] = useState(null);

  const { data: commoditiesRaw, loading: loadingC } = useData(() => pricesApi.getCommodities(), []);
  const { data: inflationRaw, loading: loadingI } = useData(() => pricesApi.getInflation(), []);
  const { data: historyRaw } = useData(
    () => selectedCode ? pricesApi.getHistory(selectedCode, 180) : Promise.resolve(null),
    [selectedCode]
  );

  const commodities = Array.isArray(commoditiesRaw) ? commoditiesRaw : [];
  const history = Array.isArray(historyRaw) ? historyRaw : [];
  const months = Array.isArray(inflationRaw?.months) ? inflationRaw.months : [];
  const series = (inflationRaw && typeof inflationRaw.series === 'object') ? inflationRaw.series : {};

  const topVolatile = [...commodities].sort((a, b) => Math.abs(b.change_yoy_pct) - Math.abs(a.change_yoy_pct))[0];
  const activeCommodityCode = selectedCode || topVolatile?.code || commodities[0]?.code || null;
  const { data: regionalRaw } = useData(
    () => activeCommodityCode ? pricesApi.getRegional(activeCommodityCode) : Promise.resolve([]),
    [activeCommodityCode]
  );
  const regional = Array.isArray(regionalRaw) ? regionalRaw : [];

  const chartData = months.map((month) => {
    const point = { month };
    Object.entries(series).forEach(([code, dataset]) => {
      const dataPoint = Array.isArray(dataset.data) ? dataset.data.find((d) => d.month === month) : null;
      if (dataPoint) point[code] = dataPoint.price;
    });
    return point;
  });

  const avgYoY = commodities.length
    ? (commodities.reduce((sum, commodity) => sum + parseFloat(commodity.change_yoy_pct || 0), 0) / commodities.length).toFixed(1)
    : null;
  const aboveHetList = commodities.filter((commodity) => +(commodity.pct_of_het || 0) > 100);
  const aboveHetSummary = aboveHetList.length
    ? aboveHetList.slice(0, 3).map((commodity) => commodity.name).join(', ') + (aboveHetList.length > 3 ? ` +${aboveHetList.length - 3} lainnya` : '')
    : 'Semua komoditas utama masih di bawah HET';

  const regionalMapData = regional.map((entry) => ({
    code: entry.region_code,
    label: entry.region_name,
    value: `${Math.round(entry.pct_of_het)}%`,
    note: `Rp ${Number(entry.price_idr || 0).toLocaleString('id-ID')}`,
    tone: +entry.pct_of_het > 115 ? 'danger' : +entry.pct_of_het > 105 ? 'warning' : 'positive',
  }));

  const fmtPct = (value) => value != null ? `${+value > 0 ? '+' : ''}${(+value).toFixed(1)}%` : '—';
  const inflLvl = (yoy) => Math.abs(yoy) > 15 ? 'critical' : Math.abs(yoy) > 8 ? 'high' : Math.abs(yoy) > 4 ? 'medium' : 'normal';

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-medium">Inflasi Pangan</h1>
        <p className="text-sm text-gray-500 mt-0.5">Pemantauan harga dan indeks inflasi komoditas nasional</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Inflasi Rata-rata YoY" value={avgYoY ? `+${avgYoY}%` : '—'} sub="8 komoditas utama" valueClass="text-red-500" />
        <MetricCard label="Paling Volatile" value={topVolatile?.name || '—'} sub={topVolatile ? `+${parseFloat(topVolatile.change_yoy_pct).toFixed(1)}% YoY` : '—'} valueClass="text-red-500" />
        <MetricCard label="Komoditas di atas HET" value={`${aboveHetList.length} / ${commodities.length}`} sub={aboveHetSummary} valueClass="text-yellow-600" />
        <MetricCard label="Periode Data" value="12 Bulan" sub="Apr 2025 – Apr 2026" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium">Peta Tekanan Harga</h3>
            <p className="text-xs text-gray-400 mt-0.5">Persentase harga terhadap HET untuk komoditas yang sedang dipilih</p>
          </div>
          {activeCommodityCode && <StatusBadge status={inflLvl(commodities.find((commodity) => commodity.code === activeCommodityCode)?.change_yoy_pct)} label={commodities.find((commodity) => commodity.code === activeCommodityCode)?.name || 'Komoditas'} />}
        </div>
        {!regional.length ? <LoadingSpinner text="Memuat peta harga..." /> : (
          <RegionMap
            regions={regionalMapData}
            caption={`Peta menggunakan ${commodities.find((commodity) => commodity.code === activeCommodityCode)?.name || 'komoditas aktif'}. Nilai menunjukkan persentase harga terhadap HET.`}
          />
        )}
      </div>

      <div className="card">
        <h3 className="text-sm font-medium mb-1">Tren Harga 12 Bulan (Rp/kg)</h3>
        <p className="text-xs text-gray-400 mb-4">Rata-rata nasional dari 6 wilayah</p>
        {loadingI ? <LoadingSpinner /> : chartData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">Data belum tersedia</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}rb`} />
              <Tooltip formatter={(value, name) => [`Rp ${Number(value).toLocaleString('id-ID')}/kg`, name]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {Object.keys(series).map((code) => (
                <Line key={code} type="monotone" dataKey={code} name={series[code].name} stroke={COLORS[code] || '#888'} strokeWidth={2} dot={false} strokeOpacity={selectedCode && selectedCode !== code ? 0.2 : 1} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <h3 className="text-sm font-medium mb-4">Harga &amp; Inflasi per Komoditas</h3>
        {loadingC ? <LoadingSpinner /> : (
          <table className="table-base">
            <thead>
              <tr>
                <th>Komoditas</th><th className="text-right">Harga (Rp)</th><th className="text-right">HET</th>
                <th className="text-right">% HET</th><th className="text-right">MoM</th><th className="text-right">YoY</th>
                <th>Level</th><th></th>
              </tr>
            </thead>
            <tbody>
              {commodities.map((commodity) => (
                <tr key={commodity.id} className={selectedCode === commodity.code ? 'bg-blue-50' : ''}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[commodity.code] || '#888' }} />
                      {commodity.name}
                    </div>
                  </td>
                  <td className="text-right font-mono text-xs">{Number(commodity.current_price || 0).toLocaleString('id-ID')}</td>
                  <td className="text-right font-mono text-xs text-gray-400">{commodity.het_price ? Number(commodity.het_price).toLocaleString('id-ID') : '—'}</td>
                  <td className={`text-right text-xs font-medium ${+(commodity.pct_of_het || 0) > 115 ? 'text-red-500' : +(commodity.pct_of_het || 0) > 105 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {commodity.pct_of_het ? `${commodity.pct_of_het}%` : '—'}
                  </td>
                  <td className={`text-right font-mono text-xs ${+(commodity.change_mom_pct || 0) > 0 ? 'text-red-500' : 'text-green-600'}`}>{fmtPct(commodity.change_mom_pct)}</td>
                  <td className={`text-right font-mono text-xs font-medium ${+(commodity.change_yoy_pct || 0) > 8 ? 'text-red-500' : +(commodity.change_yoy_pct || 0) > 4 ? 'text-yellow-600' : 'text-green-600'}`}>{fmtPct(commodity.change_yoy_pct)}</td>
                  <td><StatusBadge status={inflLvl(commodity.change_yoy_pct)} label={inflLvl(commodity.change_yoy_pct)} /></td>
                  <td>
                    <button className="text-xs text-blue-600 hover:underline" onClick={() => setSelectedCode(selectedCode === commodity.code ? null : commodity.code)}>
                      {selectedCode === commodity.code ? 'Tutup' : 'Historis'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedCode && history.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-medium mb-4">
            Historis 180 Hari — {commodities.find((commodity) => commodity.code === selectedCode)?.name}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={history.map((item) => ({
              date: new Date(item.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
              avg: Math.round(item.avg_national), min: Math.round(item.min_price), max: Math.round(item.max_price),
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={14} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}rb`} />
              <Tooltip formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="avg" name="Rata-rata" stroke={COLORS[selectedCode] || '#2563eb'} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="max" name="Tertinggi" stroke="#ef444466" strokeWidth={1} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="min" name="Terendah" stroke="#22c55e66" strokeWidth={1} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
