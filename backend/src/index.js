import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';

import { validateEnv } from './env.js';
import { db } from './db.js';
import { isRedisEnabled, redis } from './cache.js';
import supplyRoutes from './routes/supply.js';
import weatherRoutes from './routes/weather.js';
import pricesRoutes from './routes/prices.js';
import logisticsRoutes from './routes/logistics.js';
import forecastRoutes  from './routes/forecast.js';
import { pollWeatherData } from './services/bmkgService.js';
import { pollPriceData } from './services/priceService.js';

validateEnv();

const app = express();
const PORT = process.env.PORT || 3000;

function buildAllowedOrigins() {
  const configured = process.env.FRONTEND_URL
    || 'http://localhost:5173,http://127.0.0.1:5173';

  return configured
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isAllowedOrigin(origin) {
  if (!origin) return true;

  const allowedOrigins = buildAllowedOrigins();
  if (allowedOrigins.includes(origin)) return true;

  if (process.env.ALLOW_VERCEL_PREVIEWS === 'true') {
    try {
      return new URL(origin).hostname.endsWith('.vercel.app');
    } catch {
      return false;
    }
  }

  return false;
}

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.use('/api/supply',    supplyRoutes);
app.use('/api/weather',   weatherRoutes);
app.use('/api/prices',    pricesRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/forecast',  forecastRoutes);

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    const redisStatus = isRedisEnabled ? await redis.ping() : 'disabled';
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'ok',
        redis: redisStatus === 'PONG' ? 'ok' : redisStatus,
      },
    });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
});

// ─────────────────────────────────────────────
// 404 & Error handlers
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message, err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Terjadi kesalahan server' : err.message,
  });
});

// ─────────────────────────────────────────────
// Scheduled Jobs
// ─────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  // Poll BMKG weather data every 6 hours
  cron.schedule(process.env.WEATHER_POLL_INTERVAL || '0 */6 * * *', async () => {
    console.log('[CRON] Polling BMKG weather data...');
    await pollWeatherData().catch(console.error);
  });

  // Poll commodity prices every day at 06:00
  cron.schedule(process.env.PRICE_POLL_INTERVAL || '0 6 * * *', async () => {
    console.log('[CRON] Polling BPS/BAPANAS price data...');
    await pollPriceData().catch(console.error);
  });
}

// ─────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\nKepang AI Food Resilience API`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   Mock data: ${process.env.USE_MOCK_DATA === 'true' ? 'enabled' : 'disabled'}\n`);
});

export default app;
