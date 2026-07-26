import { useData } from '../hooks/useData.js';
import { weatherApi } from '../api.js';
import { MetricCard, StatusBadge, AlertBanner, LoadingSpinner, ProgressBar, ChoroplethMap } from '../components/shared/index.jsx';

// NOAA Oceanic Nino Index phases, as classified by bmkgService.classifyOni()
// and stored per risk row as `elnino_phase`. Labelled here so the UI always
// reports the phase the risk model actually used - never a hardcoded guess.
const ENSO_LABEL = {
  el_nino: 'El Nino',
  weak_la_nina: 'La Nina Lemah',
  strong_la_nina: 'La Nina Kuat',
  neutral: 'Netral',
};

function ensoPhaseOf(risks) {
  const phase = risks.find((risk) => risk.elnino_phase)?.elnino_phase;
  if (!phase) return { value: 'Belum tersedia', sub: 'Menunggu pembaruan indeks NOAA' };
  return {
    value: ENSO_LABEL[phase] || phase,
    sub: 'Indeks NOAA ONI, dipakai model risiko panen',
  };
}

const RISK_BG = { critical: 'bg-red-50 border-red-200', high: 'bg-yellow-50 border-yellow-200', medium: 'bg-blue-50 border-blue-200', normal: 'bg-green-50 border-green-100' };
const RISK_TEXT = { critical: 'text-red-700', high: 'text-yellow-700', medium: 'text-blue-700', normal: 'text-green-700' };
const RISK_BAR = { critical: 'bg-red-500', high: 'bg-yellow-500', medium: 'bg-blue-400', normal: 'bg-green-400' };

function formatLoss(risk) {
  const lossTon = +(risk.estimated_loss_ton || 0);
  const lossPct = +(risk.estimated_loss_pct || 0);
  if (lossTon > 0) return `${Math.max(1, Math.round(lossTon / 1000))}K ton`;
  if (lossPct > 0) return `${lossPct.toFixed(1)}% produksi`;
  return null;
}

function getActionPlans(risk) {
  const region = risk.region_name;
  const loss = formatLoss(risk);
  const isDrought = +(risk.drought_index || 0) >= +(risk.flood_risk || 0);
  const plans = [];

  if (isDrought) {
    plans.push(`Prioritaskan suplai air dan jadwal irigasi untuk ${region}`);
    plans.push('Koordinasikan percepatan tanam atau penyulaman pada area terdampak');
  } else {
    plans.push(`Perkuat drainase dan tanggul sawah di ${region}`);
    plans.push('Siapkan pompa, benih tahan genangan, dan tim respons lapangan');
  }

  if (loss) plans.push(`Siapkan buffer pangan sekitar ${loss} untuk menjaga pasokan regional`);

  if (+(risk.forecast_max_rain_mm || 0) > 40) {
    plans.push(`Naikkan status pemantauan harian karena puncak hujan mencapai ${Math.round(risk.forecast_max_rain_mm)} mm/hari`);
  } else {
    plans.push('Pantau ulang prakiraan BMKG 2 kali sehari dan validasi kondisi lapangan');
  }

  return plans;
}

export default function Weather() {
  const { data: risksRaw, loading } = useData(() => weatherApi.getRisk(), []);
  const { data: alertsRaw } = useData(() => weatherApi.getAlerts(), []);
  const { data: forecastsRaw } = useData(() => weatherApi.getForecast(undefined, 7), []);

  const risks = Array.isArray(risksRaw) ? risksRaw : [];
  const alerts = Array.isArray(alertsRaw) ? alertsRaw : [];
  const forecasts = Array.isArray(forecastsRaw) ? forecastsRaw : [];

  const criticalCount = risks.filter((r) => r.risk_level === 'critical').length;
  const highCount = risks.filter((r) => r.risk_level === 'high').length;
  const totalLoss = risks.reduce((sum, r) => sum + (+(r.estimated_loss_ton || 0)), 0);
  const latestRisk = [...risks].sort((a, b) => new Date(b.scored_at) - new Date(a.scored_at))[0];

  const byRegion = forecasts.reduce((acc, forecast) => {
    if (!acc[forecast.code]) acc[forecast.code] = { name: forecast.region_name, days: [] };
    acc[forecast.code].days.push(forecast);
    return acc;
  }, {});

  const mapData = risks.map((risk) => ({
    code: risk.code,
    label: risk.region_name,
    value: `${Math.round(risk.risk_score)}%`,
    note: `${parseFloat(risk.forecast_avg_rain_mm || 0).toFixed(0)} mm/hari`,
    tone: risk.risk_level === 'critical' ? 'danger' : risk.risk_level === 'high' ? 'warning' : risk.risk_level === 'medium' ? 'info' : 'positive',
  }));

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-medium">Cuaca &amp; Risiko Panen</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Prakiraan BMKG, estimasi tekanan panen, dan rencana respons operasional
        </p>
      </div>

      {alerts.length > 0 && <AlertBanner alerts={alerts} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Wilayah Risiko Kritis" value={criticalCount} sub="Perlu intervensi segera" valueClass={criticalCount > 0 ? 'text-red-500' : 'text-green-600'} />
        <MetricCard label="Wilayah Risiko Tinggi" value={highCount} sub="Tindakan preventif" valueClass={highCount > 0 ? 'text-yellow-600' : 'text-green-600'} />
        <MetricCard label="Potensi Kehilangan Panen" value={totalLoss > 0 ? `${Math.round(totalLoss / 1000)}K ton` : 'Belum terukur'} sub={latestRisk ? `Update risiko ${new Date(latestRisk.scored_at).toLocaleDateString('id-ID')}` : 'Menunggu pengayaan supply'} valueClass="text-yellow-600" />
        <MetricCard label="Fase ENSO" value={ensoPhaseOf(risks).value} sub={ensoPhaseOf(risks).sub} valueClass="text-blue-600" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium">Peta Risiko Agroklimat</h3>
            <p className="text-xs text-gray-400 mt-0.5">Warna wilayah menunjukkan tingkat tekanan cuaca pada sentra beras</p>
          </div>
          {latestRisk && <StatusBadge status={latestRisk.risk_level} label={`Update ${new Date(latestRisk.scored_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`} />}
        </div>
        {!risks.length ? <LoadingSpinner text="Memuat peta risiko..." /> : (
          <ChoroplethMap regions={mapData} caption="Nilai di peta adalah skor risiko. Catatan menunjukkan rata-rata hujan prakiraan harian 7 hari ke depan." />
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Penilaian Risiko per Wilayah</h3>
        {loading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {risks.map((risk) => (
              <div key={risk.code} className={`border rounded-lg p-4 ${RISK_BG[risk.risk_level] || 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className={`text-sm font-medium ${RISK_TEXT[risk.risk_level]}`}>{risk.region_name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{risk.island} · {risk.commodity_name}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-medium ${RISK_TEXT[risk.risk_level]}`}>{Math.round(risk.risk_score)}%</p>
                    <StatusBadge status={risk.risk_level} label={risk.risk_level} />
                  </div>
                </div>
                <ProgressBar value={risk.risk_score} color={RISK_BAR[risk.risk_level] || 'bg-gray-400'} />
                <div className="grid grid-cols-3 gap-2 mt-3 text-[10px] text-gray-600">
                  <div><p className="text-gray-400">Deviasi hujan</p><p className="font-medium">{+(risk.rainfall_dev || 0) > 0 ? '+' : ''}{parseFloat(risk.rainfall_dev || 0).toFixed(0)}%</p></div>
                  <div><p className="text-gray-400">Risiko banjir</p><p className="font-medium">{parseFloat(risk.flood_risk || 0).toFixed(0)}%</p></div>
                  <div><p className="text-gray-400">Kehilangan estimasi</p><p className="font-medium">{formatLoss(risk) || 'Belum terukur'}</p></div>
                </div>
                <p className="text-[10px] text-gray-500 mt-2 border-t border-gray-200 pt-2">
                  {risk.notes || `Rata-rata hujan prakiraan ${risk.forecast_avg_rain_mm} mm/hari, puncak ${risk.forecast_max_rain_mm} mm/hari.`}
                </p>
                {risk.risk_level !== 'normal' && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-[10px] font-medium text-gray-600 mb-1.5">Rencana Tindakan:</p>
                    <ul className="space-y-1">
                      {getActionPlans(risk).map((plan, index) => (
                        <li key={index} className="text-[10px] text-gray-600 flex gap-1.5">
                          <span className="text-gray-400 shrink-0">·</span>{plan}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {Object.keys(byRegion).length > 0 && (
        <div className="card">
          <h3 className="text-sm font-medium mb-4">Prakiraan Cuaca 7 Hari per Wilayah</h3>
          <div className="space-y-4">
            {Object.entries(byRegion).map(([code, { name, days }]) => (
              <div key={code}>
                <p className="text-xs font-medium text-gray-700 mb-2">{name}</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {days.slice(0, 7).map((day, index) => (
                    <div key={index} className="shrink-0 text-center w-16 bg-gray-50 rounded-lg px-2 py-2">
                      <p className="text-[10px] text-gray-400">
                        {new Date(day.forecast_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs font-medium mt-1" style={{ color: +(day.rainfall_mm || 0) > 30 ? '#ef4444' : +(day.rainfall_mm || 0) > 10 ? '#f59e0b' : '#6b7280' }}>
                        {parseFloat(day.rainfall_mm || 0).toFixed(0)} mm
                      </p>
                      <p className="text-[10px] text-gray-500">{parseFloat(day.temperature_c || 0).toFixed(0)}°C</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
