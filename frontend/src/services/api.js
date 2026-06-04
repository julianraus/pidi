import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Terjadi kesalahan';
    return Promise.reject(new Error(message));
  }
);

// ── Supply & Demand ────────────────────────────────────────
export const supplyApi = {
  getRegions: (commodity = 'BERAS', month) =>
    api.get('/supply/regions', { params: { commodity, month } }),

  getBalance: () =>
    api.get('/supply/balance'),

  getHistory: (regionCode, commodity = 'BERAS', months = 6) =>
    api.get(`/supply/history/${regionCode}`, { params: { commodity, months } }),

  computeRedistribution: (body = {}) =>
    api.post('/supply/redistribute', body),
};

// ── Weather & Risk ─────────────────────────────────────────
export const weatherApi = {
  getForecast: (regionCode, days = 14) =>
    api.get('/weather/forecast', { params: { regionCode, days } }),

  getRisk: () =>
    api.get('/weather/risk'),

  getAlerts: () =>
    api.get('/weather/alerts'),

  getScenarios: () =>
    api.get('/weather/scenarios'),
};

// ── Prices & Inflation ─────────────────────────────────────
export const pricesApi = {
  getCommodities: () =>
    api.get('/prices/commodities'),

  getInflation: () =>
    api.get('/prices/inflation'),

  getHistory: (code, days = 90) =>
    api.get(`/prices/history/${code}`, { params: { days } }),

  getRegional: (code) =>
    api.get(`/prices/regional/${code}`),
};

// ── Logistics ──────────────────────────────────────────────
export const logisticsApi = {
  getRoutes: () =>
    api.get('/logistics/routes'),

  getEfficiency: () =>
    api.get('/logistics/efficiency'),

  getRecommendations: (params) =>
    api.get('/logistics/recommendations', { params }),

  optimize: (requirements) =>
    api.post('/logistics/optimize', { requirements }),

  getShipments: (status) =>
    api.get('/logistics/shipments', { params: { status } }),
};

// ── Health ─────────────────────────────────────────────────
export const healthApi = {
  check: () => api.get('/health'),
};

export default api;
