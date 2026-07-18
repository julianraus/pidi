import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL harus berupa connection string PostgreSQL yang valid'),
  PORT: z.coerce.number().int().positive().optional(),
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('[env] Konfigurasi environment tidak valid:');
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }

  const realDataFlags = [
    ['USE_REAL_PRICE_DATA', 'harga komoditas (BI Harga Pangan)'],
    ['USE_REAL_WEATHER_DATA', 'cuaca (BMKG)'],
  ];

  for (const [flag, label] of realDataFlags) {
    if (process.env[flag] !== 'true') {
      console.warn(`[env] ${flag} bukan 'true' — data ${label} akan berstatus forecast/unavailable, bukan real-time.`);
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('[env] ANTHROPIC_API_KEY kosong — AI Forecasting akan memakai respons offline statis, bukan model.');
  }

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.warn('[env] GOOGLE_MAPS_API_KEY kosong — rute logistik akan memakai estimasi forecast, bukan Google Routes real-time.');
  }
}
