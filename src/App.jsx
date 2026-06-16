import { useState } from 'react';
import Sidebar      from './components/Sidebar.jsx';
import Dashboard    from './pages/Dashboard.jsx';
import Resilience   from './pages/Resilience.jsx';
import SupplyDemand from './pages/SupplyDemand.jsx';
import Inflation    from './pages/Inflation.jsx';
import Logistics    from './pages/Logistics.jsx';
import Weather      from './pages/Weather.jsx';
import AiForecast   from './pages/AiForecast.jsx';

const PAGES = {
  dashboard: Dashboard,
  resilience: Resilience,
  supply:    SupplyDemand,
  inflation: Inflation,
  logistics: Logistics,
  weather:   Weather,
  ai:        AiForecast,
};

export default function App() {
  const [page, setPage] = useState('resilience');
  const Page = PAGES[page] || Dashboard;

  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-gray-50 text-gray-900">
      <Sidebar currentPage={page} onNavigate={setPage} />
      <main className="flex-1 min-w-0 overflow-auto">
        <Page />
      </main>
    </div>
  );
}
