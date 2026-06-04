import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Terjadi kesalahan';
    return Promise.reject(new Error(message));
  }
);

export const supplyApi = {
  getRegions:   (commodity = 'BERAS', month) => api.get('/supply/regions', { params: { commodity, month } }),
  getBalance:   ()                            => api.get('/supply/balance'),
  getHistory:   (regionCode, commodity, months) => api.get(`/supply/history/${regionCode}`, { params: { commodity, months } }),
  redistribute: (body = {})                  => api.post('/supply/redistribute', body),
};

export const weatherApi = {
  getForecast:  (regionCode, days) => api.get('/weather/forecast', { params: { regionCode, days } }),
  getRisk:      ()                 => api.get('/weather/risk'),
  getAlerts:    ()                 => api.get('/weather/alerts'),
  getScenarios: ()                 => api.get('/weather/scenarios'),
};

export const pricesApi = {
  getCommodities: ()           => api.get('/prices/commodities'),
  getInflation:   ()           => api.get('/prices/inflation'),
  getHistory:     (code, days) => api.get(`/prices/history/${code}`, { params: { days } }),
  getRegional:    (code)       => api.get(`/prices/regional/${code}`),
};

export const logisticsApi = {
  getRoutes:          ()       => api.get('/logistics/routes'),
  getEfficiency:      ()       => api.get('/logistics/efficiency'),
  getRecommendations: (params) => api.get('/logistics/recommendations', { params }),
  getShipments:       (status) => api.get('/logistics/shipments', { params: { status } }),
  optimize:           (body)   => api.post('/logistics/optimize', body),
};

export const forecastApi = {
  getOverview:        ()       => api.get('/forecast/overview'),
  getResilience:      ()       => api.get('/forecast/resilience'),
  getRedistribution:  ()       => api.get('/forecast/redistribution'),
  ask:                (question, context) => api.post('/forecast/ask', { question, context }),
  refresh:            ()       => api.post('/forecast/refresh'),
};

export default api;
