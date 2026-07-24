import { useMemo, useState } from 'react';
import GEO from '../../data/idn_provinces.json';

// Warna per "tone" - selaras dengan bahasa status di seluruh aplikasi.
const TONE = {
  positive: { fill: '#34d399', hover: '#10b981', text: '#065f46' },
  warning:  { fill: '#fbbf24', hover: '#f59e0b', text: '#78350f' },
  danger:   { fill: '#fb7185', hover: '#f43f5e', text: '#881337' },
  info:     { fill: '#38bdf8', hover: '#0ea5e9', text: '#075985' },
  neutral:  { fill: '#cbd5e1', hover: '#94a3b8', text: '#334155' },
  nodata:   { fill: '#e5e7eb', hover: '#d1d5db', text: '#6b7280' },
};

const VIEW_W = 1000;
const PAD = 12;

function normalize(name) {
  return String(name || '').trim().toLowerCase();
}

// Proyeksi equirectangular sederhana - Indonesia dekat ekuator jadi
// distorsinya kecil dan cukup untuk choropleth. Dihitung sekali (useMemo).
function buildProjection(features) {
  let lonMin = Infinity, lonMax = -Infinity, latMin = Infinity, latMax = -Infinity;
  for (const f of features) {
    for (const poly of f.geometry.coordinates) {
      for (const ring of poly) {
        for (const [lng, lat] of ring) {
          if (lng < lonMin) lonMin = lng;
          if (lng > lonMax) lonMax = lng;
          if (lat < latMin) latMin = lat;
          if (lat > latMax) latMax = lat;
        }
      }
    }
  }
  const scale = (VIEW_W - PAD * 2) / (lonMax - lonMin);
  const height = (latMax - latMin) * scale + PAD * 2;
  const project = (lng, lat) => [
    PAD + (lng - lonMin) * scale,
    PAD + (latMax - lat) * scale,
  ];
  return { project, height, lonMin, lonMax, latMin, latMax, scale };
}

function ringToPath(ring, project) {
  let d = '';
  for (let i = 0; i < ring.length; i++) {
    const [x, y] = project(ring[i][0], ring[i][1]);
    d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  return d + 'Z';
}

export function ChoroplethMap({
  data = [],
  regionData = {},
  selectedName,
  onSelect,
  legend,
  caption,
  height = 380,
}) {
  const [hovered, setHovered] = useState(null);

  const { project, viewH, shapes } = useMemo(() => {
    const proj = buildProjection(GEO.features);
    const shapes = GEO.features.map((f) => {
      const d = f.geometry.coordinates
        .map((poly) => poly.map((ring) => ringToPath(ring, proj.project)).join(' '))
        .join(' ');
      // centroid kasar dari bounding box tiap provinsi untuk posisi tooltip
      let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
      for (const poly of f.geometry.coordinates) {
        for (const [lng, lat] of poly[0]) {
          const [x, y] = proj.project(lng, lat);
          if (x < xMin) xMin = x; if (x > xMax) xMax = x;
          if (y < yMin) yMin = y; if (y > yMax) yMax = y;
        }
      }
      return {
        name: f.properties.name,
        region: f.properties.region,
        d,
        cx: (xMin + xMax) / 2,
        cy: (yMin + yMax) / 2,
      };
    });
    return { project: proj.project, viewH: proj.height, shapes };
  }, []);

  const dataByName = useMemo(() => {
    const m = new Map();
    for (const item of data) m.set(normalize(item.name), item);
    return m;
  }, [data]);

  // Per-provinsi diutamakan; kalau belum ada, warisi status wilayah agregatnya.
  const resolve = (shape) => dataByName.get(normalize(shape.name)) || regionData[shape.region];

  const active = hovered
    ? (() => {
        const shape = shapes.find((s) => s.name === hovered);
        return { shape, item: shape ? resolve(shape) : null };
      })()
    : null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white">
      <div className="relative w-full" style={{ height }}>
        <svg
          viewBox={`0 0 ${VIEW_W} ${viewH}`}
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full"
        >
          {shapes.map((s) => {
            const item = resolve(s);
            const tone = TONE[item?.tone] || TONE.nodata;
            const isHover = hovered === s.name;
            const isSelected = selectedName && normalize(selectedName) === normalize(s.name);
            return (
              <path
                key={s.name}
                d={s.d}
                fill={isHover ? tone.hover : tone.fill}
                stroke={isSelected ? '#065f46' : '#ffffff'}
                strokeWidth={isSelected ? 1.6 : 0.5}
                style={{ cursor: onSelect ? 'pointer' : 'default', transition: 'fill 0.15s ease' }}
                onMouseEnter={() => setHovered(s.name)}
                onMouseLeave={() => setHovered((h) => (h === s.name ? null : h))}
                onClick={() => onSelect?.(s.name, item, s.region)}
              />
            );
          })}
        </svg>

        {active?.shape && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm"
            style={{
              left: `${(active.shape.cx / VIEW_W) * 100}%`,
              top: `${(active.shape.cy / viewH) * 100}%`,
              minWidth: 140,
            }}
          >
            <p className="text-xs font-semibold text-slate-900">{active.shape.name}</p>
            {active.item ? (
              <>
                {active.item.value != null && (
                  <p className="text-sm font-bold" style={{ color: (TONE[active.item.tone] || TONE.nodata).text }}>
                    {active.item.value}
                  </p>
                )}
                {active.item.note && <p className="text-[11px] text-slate-500">{active.item.note}</p>}
              </>
            ) : (
              <p className="text-[11px] text-slate-400">Data belum tersedia</p>
            )}
          </div>
        )}
      </div>

      {legend && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 px-4 py-2.5">
          {legend.map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: (TONE[l.tone] || TONE.nodata).fill }} />
              <span className="text-[11px] text-slate-600">{l.label}</span>
            </div>
          ))}
        </div>
      )}

      {caption && <p className="px-4 pb-3 pt-1 text-xs text-slate-500">{caption}</p>}
    </div>
  );
}
