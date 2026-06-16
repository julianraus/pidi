import { useState } from 'react';

const NAV_ITEMS = [
  { key: 'dashboard',  label: 'Dashboard'         },
  { key: 'resilience', label: 'Resilience Room'   },
  { key: 'supply',     label: 'Penawaran & Permintaan' },
  { key: 'inflation',  label: 'Inflasi Pangan'    },
  { key: 'logistics',  label: 'Logistik Cerdas'   },
  { key: 'weather',    label: 'Cuaca & Risiko Panen' },
  { key: 'ai',         label: 'AI Forecasting'    },
];

export default function Navbar({ page, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 text-left"
          >
            <div className="w-7 h-7 bg-green-600 rounded-md flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
                <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm1 11H9V9h2v4zm0-6H9V5h2v2z"/>
              </svg>
            </div>
            <div className="leading-tight hidden sm:block">
              <p className="text-[11px] text-gray-400 leading-none">Decision Support MVP</p>
              <p className="text-sm font-semibold text-gray-900 leading-snug">Kepang AI</p>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  page === item.key
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right: status pill + mobile toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-700 font-medium">Live</span>
            </div>
            <button
              className="md:hidden p-1.5 rounded text-gray-500 hover:bg-gray-100"
              onClick={() => setMenuOpen(o => !o)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12"/>
                  : <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/>}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-2">
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                onClick={() => { onNavigate(item.key); setMenuOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                  page === item.key ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
