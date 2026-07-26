import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import { useData } from '../hooks/useData.js';
import { supplyApi, weatherApi } from '../api.js';
import { MetricCard, StatusBadge, AlertBanner, LoadingSpinner, ProgressBar, ChoroplethMap } from '../components/shared/index.jsx';

// Mirrors bmkgService.classifyOni() phases stored as `elnino_phase`, so the
// scenario caption always names the phase the model actually ran on.
const ENSO_LABEL = {
  el_nino: 'El Nino',
  weak_la_nina: 'La Nina lemah',
  strong_la_nina: 'La Nina kuat',
  neutral: 'ENSO netral',
};

const RISK_COLOR = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', normal: '#22c55e' };
const RISK_BAR = { critical: 'bg-red-500', high: 'bg-yellow-500', medium: 'bg-blue-400', normal: 'bg-green-400' };

export default function SupplyDemand() {
  const [commodity, setCommodity] = useState('BERAS');

  const { data: regionsRaw, loading } = useData(() => supplyApi.getRegions(commodity), [commodity]);
  const { data: balance } = useData(() => supplyApi.getBalance(), []);
  const { data: riskRaw } = useData(() => weatherApi.getRisk(), []);
  const { data: alertsRaw } = useData(() => weatherApi.getAlerts(), []);
  const { data: scenariosRaw } = useData(() => weatherApi.getScenarios(), []);
  const { data: redistRaw } = useData(() => supplyApi.redistribute(), []);

  const regions = Array.isArray(regionsRaw) ? regionsRaw : [];
  const riskData = Array.isArray(riskRaw) ? riskRaw : [];
  const alerts = Array.isArray(alertsRaw) ? alertsRaw : [];

  const enriched = regions.map((region) => ({
    ...region,
    risk: riskData.find((risk) => risk.code === region.code) || null,
  }));

  const chartData = enriched.map((region) => ({
    name: (region.region_name || '').replace('Bali & ', '').replace('Papua & ', 'Papua/'),
    penawaran: Math.round((region.supply_ton || 0) / 1000),
    permintaan: Math.round((region.demand_ton || 0) / 1000),
  }));

  const scenarios = scenariosRaw?.scenarios || null;
  const scenarioChart = scenarios
    ? (scenarios.optimistic || []).map((optimistic, index) => ({
        month: optimistic.month,
        optimis: optimistic.value,
        moderat: (scenarios.moderate || [])[index]?.value,
        pesimis: (scenarios.pessimistic || [])[index]?.value,
        kebutuhan: (scenarios.demand || [])[index]?.value,
      }))
    : [];

  const redist = redistRaw || {};
  const assignments = Array.isArray(redist.assignments) ? redist.assignments : [];

  const fmtTon = (value) => `${(+(value || 0) / 1000).toFixed(0)}K ton`;
  const fmtBal = (value) => `${+value > 0 ? '+' : ''}${(+(value || 0) / 1000).toFixed(0)}K ton`;
  const totalLoss = riskData.reduce((sum, risk) => sum + (+(risk.estimated_loss_ton || 0)), 0);
  const mapData = enriched.map((region) => ({
    code: region.code,
    label: region.region_name,
    value: fmtBal(region.balance_ton),
    note: region.risk ? `Risiko ${Math.round(region.risk.risk_score)}%` : region.status,
    tone: region.status === 'deficit' ? 'danger' : region.status === 'surplus' ? 'positive' : 'warning',
  }));

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Penawaran &amp; Permintaan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Neraca pasokan antar wilayah + prediksi risiko cuaca</p>
          {/* This page mixes real BPS production with seeded demand/stock, so it
              must carry the same lineage labelling the rest of the app uses -
              otherwise the precise tonnage here reads as fully verified data. */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <StatusBadge status="official-release" label="Produksi: BPS" />
            <StatusBadge status="real-time" label="Cuaca: BMKG" />
            <StatusBadge status="unavailable" label="Permintaan & stok: seed, menunggu Bapanas/Bulog" />
          </div>
        </div>
        <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
          value={commodity} onChange={(e) => setCommodity(e.target.value)}>
          <option value="BERAS">Beras</option>
          <option value="JAGUNG">Jagung</option>
          <option value="KEDELAI">Kedelai</option>
          <option value="CABAI">Cabai Merah</option>
        </select>
      </div>

      {alerts.length > 0 && <AlertBanner alerts={alerts} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total Pasokan" value={balance ? fmtTon(balance.total_supply) : '—'} sub="Beras/bulan" />
        <MetricCard label="Total Permintaan" value={balance ? fmtTon(balance.total_demand) : '—'} sub="Beras/bulan" />
        <MetricCard label="Gap Nasional" value={balance ? fmtBal(balance.total_balance) : '—'} sub="Perlu redistribusi" valueClass={+(balance?.total_balance || 0) < 0 ? 'text-red-500' : 'text-green-600'} />
        <MetricCard label="Potensi Kehilangan" value={`${Math.round(totalLoss / 1000)}K ton`} sub="Risiko cuaca aktif" valueClass="text-yellow-600" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium">Peta Neraca Antarwilayah</h3>
            <p className="text-xs text-gray-400 mt-0.5">Lokasi hijau menandakan surplus, merah menandakan defisit yang perlu ditopang</p>
          </div>
          <StatusBadge status={+(balance?.total_balance || 0) >= 0 ? 'surplus' : 'deficit'} label={`Neraca nasional ${fmtBal(balance?.total_balance)}`} />
        </div>
        {!enriched.length ? <LoadingSpinner text="Memuat peta neraca..." /> : (
          <ChoroplethMap regions={mapData} caption="Angka pada peta menunjukkan selisih pasokan dan permintaan bulanan. Catatan menunjukkan skor risiko cuaca terbaru." />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card lg:col-span-2">
          <h3 className="text-sm font-medium mb-4">Penawaran vs Permintaan (×1.000 ton/bulan)</h3>
          {loading ? <LoadingSpinner /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `${value}K`} />
                <Tooltip formatter={(value) => [`${value}K ton`]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="penawaran" name="Penawaran" fill="#2563eb" radius={[3, 3, 0, 0]} />
                <Bar dataKey="permintaan" name="Permintaan" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 className="text-sm font-medium mb-4">Risiko Gagal Panen per Wilayah</h3>
          {riskData.length === 0 ? <LoadingSpinner /> : (
            <div className="space-y-3">
              {riskData.map((risk) => (
                <div key={risk.code}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-700">{risk.region_name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium" style={{ color: RISK_COLOR[risk.risk_level] }}>
                        {Math.round(risk.risk_score)}%
                      </span>
                      <StatusBadge status={risk.risk_level} label={risk.risk_level} />
                    </div>
                  </div>
                  <ProgressBar value={risk.risk_score} color={RISK_BAR[risk.risk_level] || 'bg-gray-400'} />
                  {+(risk.estimated_loss_ton || 0) > 0 && (
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Potensi kehilangan: {Math.round(risk.estimated_loss_ton / 1000)}K ton ({risk.estimated_loss_pct}%)
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {scenarioChart.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-medium mb-1">Proyeksi Pasokan — 3 Skenario (Apr–Sep 2026)</h3>
          <p className="text-xs text-gray-400 mb-4">
            Keluaran model, memakai fase {ENSO_LABEL[riskData.find((r) => r.elnino_phase)?.elnino_phase] || 'ENSO terkini'} (indeks NOAA) dan prakiraan curah hujan BMKG
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={scenarioChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `${(value / 1000000).toFixed(2)}jt`} domain={['auto', 'auto']} />
              <Tooltip formatter={(value) => [`${(value / 1000).toFixed(0)}K ton`]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="optimis" name="Optimis" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="moderat" name="Moderat" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="pesimis" name="Pesimis" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="kebutuhan" name="Kebutuhan" stroke="#2563eb" strokeWidth={1.5} strokeDasharray="6 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card">
        <h3 className="text-sm font-medium mb-4">Detail Neraca per Wilayah</h3>
        {loading ? <LoadingSpinner /> : (
          <table className="table-base">
            <thead>
              <tr>
                <th>Wilayah</th><th className="text-right">Pasokan</th><th className="text-right">Permintaan</th>
                <th className="text-right">Selisih</th><th>Status</th><th>Risiko Cuaca</th><th>Potensi Kehilangan</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((region) => (
                <tr key={region.id}>
                  <td className="font-medium">{region.region_name}</td>
                  <td className="text-right font-mono text-xs">{fmtTon(region.supply_ton)}</td>
                  <td className="text-right font-mono text-xs">{fmtTon(region.demand_ton)}</td>
                  <td className={`text-right font-mono text-xs font-medium ${+(region.balance_ton || 0) < 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {fmtBal(region.balance_ton)}
                  </td>
                  <td><StatusBadge status={region.status} /></td>
                  <td>
                    {region.risk && <span className="text-xs font-medium" style={{ color: RISK_COLOR[region.risk.risk_level] }}>
                      {Math.round(region.risk.risk_score)}% — {region.risk.risk_level}
                    </span>}
                  </td>
                  <td className="text-xs text-gray-500">
                    {+(region.risk?.estimated_loss_ton || 0) > 0 ? `${Math.round(region.risk.estimated_loss_ton / 1000)}K ton` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {assignments.length > 0 && (
        <div className="card">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-medium">Rencana Redistribusi Optimal</h3>
            <StatusBadge status="forecast" label="Keluaran model" />
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Total: {(redist.summary?.total_volume_ton || 0).toLocaleString('id-ID')} ton · Rp {(redist.summary?.total_cost_idr || 0).toLocaleString('id-ID')} · {redist.summary?.duration_weeks || 12} minggu
            <br />
            Biaya dan kapasitas masih estimasi — belum terhubung data operator logistik, jadi angka ini rencana simulasi, bukan rencana pengadaan.
          </p>
          <table className="table-base">
            <thead>
              <tr><th>Asal</th><th>Tujuan</th><th className="text-right">Volume</th><th className="text-right">Biaya</th><th>Moda</th><th>Durasi</th><th>Status</th></tr>
            </thead>
            <tbody>
              {assignments.map((assignment, index) => (
                <tr key={index}>
                  <td>{assignment.origin}</td>
                  <td>{assignment.destination}</td>
                  <td className="text-right font-mono text-xs">{(assignment.volume_ton || 0).toLocaleString('id-ID')} ton</td>
                  <td className="text-right font-mono text-xs">Rp {(assignment.cost_idr || 0).toLocaleString('id-ID')}</td>
                  <td className="text-xs text-gray-500">{(assignment.transport_mode || '').replace('_', ' ')}</td>
                  <td className="text-xs text-gray-500">{assignment.duration_days} hari</td>
                  <td><StatusBadge status={assignment.status} label={(assignment.status || '').replace('_', ' ')} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
