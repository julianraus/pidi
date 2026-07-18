import 'dotenv/config';
import { db } from '../db.js';

// One-off migration: adds price_level to commodity_prices on an existing
// database (schema.sql alone cannot be re-run against a live DB since it
// has no IF NOT EXISTS guards). Safe to run multiple times.
const statements = [
  `ALTER TABLE commodity_prices ADD COLUMN IF NOT EXISTS price_level VARCHAR(20) NOT NULL DEFAULT 'consumer'`,
  `ALTER TABLE commodity_prices DROP CONSTRAINT IF EXISTS commodity_prices_pkey`,
  `ALTER TABLE commodity_prices ADD CONSTRAINT commodity_prices_pkey PRIMARY KEY (time, region_id, commodity_id, price_level)`,
  `CREATE OR REPLACE VIEW v_latest_prices AS
    SELECT DISTINCT ON (cp.region_id, cp.commodity_id)
      r.name AS region_name,
      c.name AS commodity_name,
      c.unit,
      c.het_price,
      cp.price_idr,
      cp.price_idr / NULLIF(c.het_price, 0) * 100 AS pct_of_het,
      cp.time AS price_time
    FROM commodity_prices cp
    JOIN regions r ON cp.region_id = r.id
    JOIN commodities c ON cp.commodity_id = c.id
    WHERE cp.price_level = 'consumer'
    ORDER BY cp.region_id, cp.commodity_id, cp.time DESC`,
  `CREATE OR REPLACE VIEW v_producer_retail_margin AS
    SELECT DISTINCT ON (r.id, c.id)
      r.code AS region_code,
      r.name AS region_name,
      c.code AS commodity_code,
      c.name AS commodity_name,
      producer.price_idr AS producer_price_idr,
      consumer.price_idr AS consumer_price_idr,
      ROUND(consumer.price_idr - producer.price_idr, 0) AS margin_idr,
      ROUND(((consumer.price_idr - producer.price_idr) / NULLIF(producer.price_idr, 0)) * 100, 1) AS margin_pct,
      GREATEST(producer.time, consumer.time) AS as_of
    FROM regions r
    JOIN commodities c ON TRUE
    JOIN commodity_prices producer
      ON producer.region_id = r.id AND producer.commodity_id = c.id AND producer.price_level = 'producer'
    JOIN commodity_prices consumer
      ON consumer.region_id = r.id AND consumer.commodity_id = c.id AND consumer.price_level = 'consumer'
    ORDER BY r.id, c.id, producer.time DESC, consumer.time DESC`,
];

try {
  for (const sql of statements) {
    await db.query(sql);
    console.log('[migrate:price-level] OK:', sql.trim().slice(0, 70).replace(/\s+/g, ' '), '...');
  }
  console.log('[migrate:price-level] done');
} catch (error) {
  console.error('[migrate:price-level] failed:', error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
