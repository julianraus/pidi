const REGION_LAYOUT = {
  SM: { x: 10, y: 28, short: 'SM' },
  JW: { x: 31, y: 52, short: 'JW' },
  KL: { x: 44, y: 28, short: 'KL' },
  SL: { x: 63, y: 41, short: 'SL' },
  NT: { x: 51, y: 70, short: 'NT' },
  PM: { x: 82, y: 44, short: 'PM' },
};

const TONE_STYLES = {
  neutral: 'bg-white/90 border-white/70 text-gray-700 shadow-sm',
  positive: 'bg-emerald-50/95 border-emerald-200 text-emerald-800 shadow-emerald-100',
  warning: 'bg-amber-50/95 border-amber-200 text-amber-800 shadow-amber-100',
  danger: 'bg-rose-50/95 border-rose-200 text-rose-800 shadow-rose-100',
  info: 'bg-sky-50/95 border-sky-200 text-sky-800 shadow-sky-100',
  muted: 'bg-slate-50/95 border-slate-200 text-slate-700 shadow-slate-100',
};

const ROUTE_TONES = {
  neutral: '#94a3b8',
  positive: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  muted: '#cbd5e1',
};

function getToneStyle(tone) {
  return TONE_STYLES[tone] || TONE_STYLES.neutral;
}

function getRouteColor(tone) {
  return ROUTE_TONES[tone] || ROUTE_TONES.neutral;
}

export function RegionMap({
  regions = [],
  connections = [],
  selectedCode,
  onSelect,
  caption,
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="relative h-[320px]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {connections.map((connection, index) => {
            const from = REGION_LAYOUT[connection.from];
            const to = REGION_LAYOUT[connection.to];
            if (!from || !to) return null;

            return (
              <g key={`${connection.from}-${connection.to}-${index}`}>
                <line
                  x1={from.x + 6}
                  y1={from.y + 6}
                  x2={to.x + 6}
                  y2={to.y + 6}
                  stroke={getRouteColor(connection.tone)}
                  strokeWidth={connection.weight || 1.6}
                  strokeDasharray={connection.dashed ? '3 2' : undefined}
                  strokeOpacity="0.9"
                />
              </g>
            );
          })}
        </svg>

        {regions.map((region) => {
          const layout = REGION_LAYOUT[region.code];
          if (!layout) return null;
          const isSelected = selectedCode && selectedCode === region.code;

          return (
            <button
              key={region.code}
              type="button"
              onClick={() => onSelect?.(region.code)}
              className={`absolute w-24 rounded-lg border p-2 text-left transition-all ${getToneStyle(region.tone)} ${onSelect ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : 'cursor-default'} ${isSelected ? 'ring-2 ring-sky-400 ring-offset-2' : ''}`}
              style={{ left: `${layout.x}%`, top: `${layout.y}%` }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-70">{layout.short}</p>
              <p className="mt-1 text-xs font-semibold leading-tight">{region.label}</p>
              {region.value && <p className="mt-1 text-sm font-bold">{region.value}</p>}
              {region.note && <p className="mt-1 text-[10px] leading-tight opacity-80">{region.note}</p>}
            </button>
          );
        })}
      </div>

      {caption && <p className="relative mt-3 text-xs text-slate-500">{caption}</p>}
    </div>
  );
}
