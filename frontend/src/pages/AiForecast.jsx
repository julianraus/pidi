import { useState } from 'react';
import { useData } from '../hooks/useData.js';
import { forecastApi, weatherApi } from '../api.js';
import { LoadingSpinner, StatusBadge, ChoroplethMap } from '../components/shared/index.jsx';

const STATUS_STYLE = {
  aman: { bg: 'bg-green-50 border-green-200', text: 'text-green-700', dot: 'bg-green-500' },
  waspada: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  siaga_1: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  siaga_2: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' },
  kritis: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
};

const TREND_ICON = {
  meningkat: '↑',
  meningkat_tajam: '↑↑',
  stabil: '→',
  stabil_menurun: '↘',
  menurun_ringan: '↓',
  menurun_moderat: '↓',
  menurun_tajam: '↓↓',
};

const CATEGORY_STYLE = {
  logistik: 'badge-blue',
  produksi: 'badge-green',
  kebijakan: 'badge-yellow',
  impor: 'badge-gray',
};

function ConfidenceBar({ value }) {
  const color = value >= 75 ? 'bg-green-500' : value >= 55 ? 'bg-yellow-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className={`h-1.5 rounded-full ${color} transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8">{value}%</span>
    </div>
  );
}

export default function AiForecast() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [asking, setAsking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: overview, loading: loadingOverview, refresh: refreshOverview } = useData(() => forecastApi.getOverview(), []);
  const { data: redistRaw, loading: loadingRedist } = useData(() => forecastApi.getRedistribution(), []);
  const { data: risksRaw } = useData(() => weatherApi.getRisk(), []);

  const redist = redistRaw || {};
  const optimalPlan = Array.isArray(redist.optimal_plan) ? redist.optimal_plan : [];
  const aiInsights = Array.isArray(redist.ai_insights) ? redist.ai_insights : [];
  const risks = Array.isArray(risksRaw) ? risksRaw : [];
  const statusStyle = STATUS_STYLE[overview?.national_status?.level] || STATUS_STYLE.waspada;

  async function handleAsk(event) {
    event.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    setAnswer(null);
    try {
      const response = await forecastApi.ask(question);
      setAnswer(response.data || response);
    } catch (error) {
      setAnswer({ answer: `Error: ${error.message}`, confidence: 0 });
    } finally {
      setAsking(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await forecastApi.refresh();
      await refreshOverview();
    } finally {
      setRefreshing(false);
    }
  }

  const suggestedQuestions = [
    'Jika USD/IDR melemah 5%, komoditas mana yang paling rentan imported inflation?',
    'Wilayah mana yang perlu pre-positioning stok saat risiko panen dan harga naik bersamaan?',
    'Rute redistribusi mana yang paling layak diprioritaskan ketika biaya logistik naik?',
    'Bagaimana skenario cuaca ekstrem dan rupiah melemah memengaruhi resilience score?',
  ];

  const mapData = risks.map((risk) => ({
    code: risk.code,
    label: risk.region_name,
    value: `${Math.round(risk.risk_score)}%`,
    note: risk.risk_level,
    tone: risk.risk_level === 'critical' ? 'danger' : risk.risk_level === 'high' ? 'warning' : risk.risk_level === 'medium' ? 'info' : 'positive',
  }));

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 bg-cyan-700 rounded flex items-center justify-center">
              <svg viewBox="0 0 20 20" fill="white" className="w-3 h-3">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-cyan-700 uppercase tracking-wider">AI Forecasting</span>
          </div>
          <h1 className="text-2xl font-medium">Analisis &amp; Prediksi Cerdas</h1>
          <p className="text-sm text-gray-500 mt-0.5">AI menjahit data supply, cuaca, harga, dan logistik menjadi prioritas tindakan</p>
        </div>
        <div className="flex items-center gap-2">
          {overview && overview.ai_source !== 'claude' && (
            <StatusBadge status="forecast" label="Template offline (belum pakai Claude API)" />
          )}
          <button onClick={handleRefresh} disabled={refreshing} className="btn-secondary text-xs">
            {refreshing ? 'Memperbarui...' : 'Perbarui Analisis'}
          </button>
        </div>
      </div>

      {loadingOverview ? <LoadingSpinner text="AI sedang menganalisis data..." /> : overview && (
        <div className={`border rounded-lg p-5 ${statusStyle.bg}`}>
          <div className="flex items-start gap-3">
            <div className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${statusStyle.dot}`} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className={`text-sm font-medium ${statusStyle.text}`}>{overview.national_status?.label || 'Status Ketahanan Pangan Nasional'}</p>
                <span className="text-xs text-gray-400">{overview.generated_at ? new Date(overview.generated_at).toLocaleString('id-ID') : ''}</span>
              </div>
              <p className={`text-sm ${statusStyle.text}`}>{overview.national_status?.summary}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium">Peta Fokus AI</h3>
            <p className="text-xs text-gray-400 mt-0.5">Menunjukkan wilayah yang paling memengaruhi prioritas analisis saat ini</p>
          </div>
          {overview?.national_status?.level && <StatusBadge status={overview.national_status.level} label={overview.national_status.level} />}
        </div>
        {!mapData.length ? <LoadingSpinner text="Memuat fokus AI..." /> : (
          <ChoroplethMap regions={mapData} caption="AI menggunakan peta risiko sebagai salah satu sinyal utama untuk memprioritaskan rekomendasi dan redistribusi." />
        )}
      </div>

      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Forecast 30 Hari</h3>
              <StatusBadge status={overview.forecast_30_days?.risk_level} label={`Risiko ${overview.forecast_30_days?.risk_level}`} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="metric-card">
                <p className="text-xs text-gray-500 mb-1">Tren Pasokan</p>
                <p className="text-base font-medium">{TREND_ICON[overview.forecast_30_days?.supply_trend]} {(overview.forecast_30_days?.supply_trend || '').replace(/_/g, ' ')}</p>
              </div>
              <div className="metric-card">
                <p className="text-xs text-gray-500 mb-1">Tren Harga</p>
                <p className="text-base font-medium">{TREND_ICON[overview.forecast_30_days?.price_trend]} {(overview.forecast_30_days?.price_trend || '').replace(/_/g, ' ')}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-2">{overview.forecast_30_days?.summary}</p>
            <div>
              <p className="text-xs text-gray-400 mb-1">Keyakinan prediksi</p>
              <ConfidenceBar value={overview.forecast_30_days?.confidence || 0} />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Forecast 90 Hari</h3>
              <StatusBadge status={overview.forecast_90_days?.risk_level} label={`Risiko ${overview.forecast_90_days?.risk_level}`} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="metric-card">
                <p className="text-xs text-gray-500 mb-1">Tren Pasokan</p>
                <p className="text-base font-medium">{TREND_ICON[overview.forecast_90_days?.supply_trend]} {(overview.forecast_90_days?.supply_trend || '').replace(/_/g, ' ')}</p>
              </div>
              <div className="metric-card">
                <p className="text-xs text-gray-500 mb-1">Tren Harga</p>
                <p className="text-base font-medium">{TREND_ICON[overview.forecast_90_days?.price_trend]} {(overview.forecast_90_days?.price_trend || '').replace(/_/g, ' ')}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-2">{overview.forecast_90_days?.summary}</p>
            <div>
              <p className="text-xs text-gray-400 mb-1">Keyakinan prediksi</p>
              <ConfidenceBar value={overview.forecast_90_days?.confidence || 0} />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {overview?.key_risks?.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-medium mb-4">Risiko Kunci yang Dipantau AI</h3>
            <div className="space-y-3">
              {overview.key_risks.map((risk, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${risk.urgency === 'tinggi' ? 'bg-red-500' : risk.urgency === 'sedang' ? 'bg-yellow-500' : 'bg-blue-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-gray-800 truncate">{risk.region} — {risk.risk}</p>
                      <span className="text-xs font-medium text-gray-500 shrink-0">{risk.probability}%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{risk.impact}</p>
                    <div className="mt-1">
                      <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                        <div className={`h-1 rounded-full ${risk.urgency === 'tinggi' ? 'bg-red-400' : risk.urgency === 'sedang' ? 'bg-yellow-400' : 'bg-blue-300'}`} style={{ width: `${risk.probability}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {overview?.opportunities?.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-medium mb-4">Peluang yang Teridentifikasi AI</h3>
            <div className="space-y-2">
              {overview.opportunities.map((opportunity, index) => (
                <div key={index} className="flex items-start gap-2.5 bg-green-50 rounded-lg p-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1 shrink-0" />
                  <p className="text-xs text-green-700">{opportunity}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {overview?.recommendations?.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-medium mb-4">Rekomendasi Tindakan — Prioritas AI</h3>
          <div className="space-y-2">
            {overview.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-gray-600">{recommendation.priority}</span>
                </div>
                <p className="text-sm text-gray-800 flex-1">{recommendation.action}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={CATEGORY_STYLE[recommendation.category] || 'badge-gray'}>{recommendation.category}</span>
                  <StatusBadge status={recommendation.impact === 'tinggi' ? 'surplus' : recommendation.impact === 'sedang' ? 'warning' : 'balanced'} label={`Dampak ${recommendation.impact}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loadingRedist && optimalPlan.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium">Rencana Redistribusi Optimal — AI</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Total: {(redist.total_volume_ton || 0).toLocaleString('id-ID')} ton · Rp {((redist.total_cost_idr || 0) / 1e9).toFixed(1)} miliar · Efisiensi AI score: {redist.efficiency_score}/100
              </p>
            </div>
          </div>

          <table className="table-base mb-4">
            <thead>
              <tr>
                <th>Asal → Tujuan</th><th className="text-right">Volume</th><th className="text-right">Biaya</th><th>Durasi</th><th>Prioritas</th><th>Alasan AI</th>
              </tr>
            </thead>
            <tbody>
              {optimalPlan.map((plan, index) => (
                <tr key={index}>
                  <td className="font-medium text-xs">{plan.from} → {plan.to}</td>
                  <td className="text-right font-mono text-xs">{(plan.volume_ton || 0).toLocaleString('id-ID')} ton</td>
                  <td className="text-right font-mono text-xs">Rp {((plan.cost_idr || 0) / 1e9).toFixed(1)}M</td>
                  <td className="text-xs text-gray-500">{plan.duration_weeks} minggu</td>
                  <td><StatusBadge status={plan.priority === 'kritis' ? 'deficit' : plan.priority === 'tinggi' ? 'warning' : 'balanced'} label={plan.priority} /></td>
                  <td className="text-xs text-gray-500 max-w-xs">{plan.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {aiInsights.length > 0 && (
            <div className="bg-cyan-50 border border-cyan-100 rounded-lg p-3 space-y-1.5">
              <p className="text-xs font-medium text-cyan-700 mb-2">Insight AI tentang optimasi logistik:</p>
              {aiInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <p className="text-xs text-cyan-700">{insight}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h3 className="text-sm font-medium mb-1">Tanya Analis AI</h3>
        <p className="text-xs text-gray-400 mb-4">Ajukan pertanyaan spesifik tentang data ketahanan pangan Indonesia</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {suggestedQuestions.map((item, index) => (
            <button key={index} onClick={() => setQuestion(item)} className="text-xs border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-lg px-3 py-1.5 text-gray-600 text-left transition-colors">
              {item.length > 60 ? `${item.slice(0, 60)}…` : item}
            </button>
          ))}
        </div>

        <form onSubmit={handleAsk} className="flex gap-2 mb-4">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Contoh: Apa yang terjadi jika gagal panen di Sulawesi dan Jawa bersamaan?"
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-300"
          />
          <button type="submit" disabled={asking || !question.trim()} className="btn-primary shrink-0 disabled:opacity-50 disabled:cursor-not-allowed bg-cyan-700 hover:bg-cyan-800">
            {asking ? 'Menganalisis...' : 'Tanya AI'}
          </button>
        </form>

        {asking && <LoadingSpinner text="AI sedang menganalisis pertanyaan Anda..." />}

        {answer && (
          <div className="bg-cyan-50 border border-cyan-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-cyan-700 rounded flex items-center justify-center">
                  <svg viewBox="0 0 20 20" fill="white" className="w-3 h-3">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-cyan-700">Jawaban AI</span>
              </div>
              {answer.confidence && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Keyakinan:</span>
                  <ConfidenceBar value={answer.confidence} />
                </div>
              )}
            </div>
            <p className="text-sm text-cyan-950 mb-3">{answer.answer}</p>
            {Array.isArray(answer.key_points) && answer.key_points.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-cyan-700">Poin kunci:</p>
                {answer.key_points.map((point, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <p className="text-xs text-cyan-700">{point}</p>
                  </div>
                ))}
              </div>
            )}
            {answer.data_basis && <p className="text-xs text-cyan-600 mt-3 border-t border-cyan-100 pt-2">Basis data: {answer.data_basis}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
