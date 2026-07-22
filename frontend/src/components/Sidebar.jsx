const NAV_ITEMS = [
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
    label: 'Dashboard',
    page: 'dashboard',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M10 2a1 1 0 01.894.553l7 14A1 1 0 0117 18H3a1 1 0 01-.894-1.447l7-14A1 1 0 0110 2zm0 4.236L4.618 16h10.764L10 6.236zM9 9a1 1 0 112 0v3a1 1 0 11-2 0V9zm1 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
    label: 'Resilience Room',
    page: 'resilience',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
        <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
        <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
      </svg>
    ),
    label: 'Penawaran & Permintaan',
    page: 'supply',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
    label: 'Inflasi Pangan',
    page: 'inflation',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0014 7z" />
      </svg>
    ),
    label: 'Logistik Cerdas',
    page: 'logistics',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clipRule="evenodd" />
      </svg>
    ),
    label: 'Cuaca & Risiko Panen',
    page: 'weather',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" />
      </svg>
    ),
    label: 'AI Forecasting',
    page: 'ai',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M4 3a2 2 0 012-2h5.586A2 2 0 0113 1.586L16.414 5A2 2 0 0117 6.414V17a2 2 0 01-2 2H6a2 2 0 01-2-2V3zm7 0H6v14h9V7h-4V3zm-3 7a1 1 0 011-1h4a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
    label: 'Market & Evidence',
    page: 'evidence',
  },
];

// "Kepang" berarti anyaman: tiga untai data (harga, cuaca, logistik)
// dianyam menjadi satu keputusan - logo mengikuti motif itu.
function BraidLogo() {
  return (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-glow shrink-0">
      <svg viewBox="0 0 24 24" fill="none" stroke="#041b14" strokeWidth="2.2" strokeLinecap="round" className="w-5 h-5">
        <path d="M4 6c4 0 4 6 8 6s4-6 8-6" />
        <path d="M4 12c4 0 4 6 8 6s4-6 8-6" opacity="0.75" />
        <path d="M4 18c2.5 0 3.5-2.2 5-3.8" opacity="0.5" />
      </svg>
    </div>
  );
}

export default function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="w-full sm:w-60 shrink-0 sm:h-screen sticky top-0 z-30 flex flex-col border-b sm:border-b-0 sm:border-r border-emerald-950/40 bg-deck-950 text-emerald-50">
      {/* Logo */}
      <div className="px-4 py-3 sm:py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <BraidLogo />
          <div>
            <p className="font-display text-sm font-semibold text-white leading-tight tracking-wide">Kepang AI</p>
            <p className="text-[10px] text-emerald-200/50">Food Resilience Intelligence</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex sm:flex-col sm:flex-1 gap-1 sm:gap-0 px-3 py-2 sm:py-4 sm:space-y-1 overflow-x-auto sm:overflow-x-visible sm:overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`nav-link-deck shrink-0 sm:w-full text-left whitespace-nowrap ${currentPage === item.page ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="hidden sm:block px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="live-dot" />
          <p className="text-[10px] font-medium text-emerald-300/90 uppercase tracking-wider">Live data feed</p>
        </div>
        <p className="text-[10px] text-emerald-200/40 leading-relaxed">BI Harga Pangan - BMKG - BPS - NOAA. Pilot 6 wilayah agregasi.</p>
      </div>
    </aside>
  );
}
