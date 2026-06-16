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
        <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
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
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    ),
    label: 'Logistik Cerdas',
    page: 'logistics',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    ),
    label: 'Cuaca & Risiko Panen',
    page: 'weather',
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" />
      </svg>
    ),
    label: 'AI Forecasting',
    page: 'ai',
  },
];

export default function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="w-full sm:w-56 shrink-0 sm:h-screen sticky top-0 z-30 flex flex-col border-b sm:border-b-0 sm:border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="px-4 py-3 sm:py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">KA</div>
          <div>
            <p className="text-xs font-medium text-gray-900 leading-tight">Kepang AI</p>
            <p className="text-[10px] text-gray-400">Pilot 6 wilayah agregasi</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex sm:flex-col sm:flex-1 gap-1 sm:gap-0 px-3 py-2 sm:py-4 sm:space-y-0.5 overflow-x-auto sm:overflow-x-visible sm:overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`nav-link shrink-0 sm:w-full text-left whitespace-nowrap ${currentPage === item.page ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="hidden sm:block px-4 py-3 border-t border-gray-100">
        <p className="text-[10px] text-gray-400">Decision support MVP</p>
        <p className="text-[10px] text-gray-400">BI, BPS, BMKG, Bapanas</p>
      </div>
    </aside>
  );
}
