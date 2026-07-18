// MetricCard
export function MetricCard({ label, value, sub, valueClass = '' }) {
  return (
    <div className="metric-card">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-medium ${valueClass}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// StatusBadge
const BADGE_MAP = {
  surplus: 'badge-green',
  normal: 'badge-green',
  optimal: 'badge-green',
  delivered: 'badge-green',
  aman: 'badge-green',
  ready: 'badge-green',
  deficit: 'badge-red',
  critical: 'badge-red',
  kritis: 'badge-red',
  high: 'badge-yellow',
  tinggi: 'badge-yellow',
  medium: 'badge-yellow',
  sedang: 'badge-yellow',
  warning: 'badge-yellow',
  siaga_1: 'badge-yellow',
  siaga_2: 'badge-yellow',
  balanced: 'badge-blue',
  info: 'badge-blue',
  waspada: 'badge-blue',
  mixed: 'badge-blue',
  'real-time': 'badge-green',
  'real-time-capable': 'badge-blue',
  'official-release': 'badge-blue',
  forecast: 'badge-yellow',
  unavailable: 'badge-red',
  planned: 'badge-gray',
  reference: 'badge-gray',
  in_transit: 'badge-blue',
};

export function StatusBadge({ status, label }) {
  const cls = BADGE_MAP[status?.toLowerCase()] || 'badge-gray';
  return <span className={cls}>{label || status}</span>;
}

// LoadingSpinner
export function LoadingSpinner({ text = 'Memuat data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <svg className="animate-spin w-8 h-8 mb-3 text-green-500" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      <p className="text-sm">{text}</p>
    </div>
  );
}

// ErrorState
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <p className="text-sm text-red-500 mb-3">{message}</p>
      {onRetry && (
        <button className="btn-secondary text-xs" onClick={onRetry}>Coba lagi</button>
      )}
    </div>
  );
}

// AlertBanner
const SEVERITY_STYLES = {
  emergency: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  watch: 'bg-blue-50 border-blue-200 text-blue-800',
};

export function AlertBanner({ alerts = [] }) {
  const list = Array.isArray(alerts) ? alerts : [];
  if (!list.length) return null;
  return (
    <div className="space-y-2">
      {list.map((alert) => (
        <div key={alert.id} className={`border rounded-lg px-4 py-3 text-sm ${SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.watch}`}>
          <p className="font-medium">{alert.title}</p>
          <p className="text-xs mt-0.5 opacity-80">{alert.description}</p>
        </div>
      ))}
    </div>
  );
}

// SectionHeader
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ProgressBar
export function ProgressBar({ value, max = 100, color = 'bg-green-500' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export { RegionMap } from './RegionMap.jsx';
