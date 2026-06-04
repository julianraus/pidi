-- PostgreSQL schema for Kepang AI MVP


-- ─────────────────────────────────────────────
-- MASTER DATA
-- ─────────────────────────────────────────────

CREATE TABLE regions (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(10) UNIQUE NOT NULL,
  name        VARCHAR(100) NOT NULL,
  island      VARCHAR(50),
  latitude    DECIMAL(9,6),
  longitude   DECIMAL(9,6),
  area_km2    INTEGER,
  population  BIGINT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE commodities (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(20) UNIQUE NOT NULL,
  name        VARCHAR(100) NOT NULL,
  unit        VARCHAR(20) NOT NULL DEFAULT 'kg',
  category    VARCHAR(50),   -- 'grain','vegetable','protein','oil'
  het_price   DECIMAL(12,2), -- Harga Eceran Tertinggi
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SUPPLY & DEMAND
-- ─────────────────────────────────────────────

CREATE TABLE supply_demand (
  id              SERIAL PRIMARY KEY,
  region_id       INTEGER REFERENCES regions(id),
  commodity_id    INTEGER REFERENCES commodities(id),
  period_month    DATE NOT NULL,          -- first day of month
  supply_ton      DECIMAL(14,2) NOT NULL,
  demand_ton      DECIMAL(14,2) NOT NULL,
  stock_ton       DECIMAL(14,2) DEFAULT 0,
  production_ton  DECIMAL(14,2) DEFAULT 0,
  import_ton      DECIMAL(14,2) DEFAULT 0,
  export_ton      DECIMAL(14,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(region_id, commodity_id, period_month)
);

-- ─────────────────────────────────────────────
-- PRICES (time-series table)
-- ─────────────────────────────────────────────

CREATE TABLE commodity_prices (
  time          TIMESTAMPTZ NOT NULL,
  region_id     INTEGER REFERENCES regions(id),
  commodity_id  INTEGER REFERENCES commodities(id),
  price_idr     DECIMAL(12,2) NOT NULL,
  price_source  VARCHAR(50),  -- 'bps','bapanas','market','manual'
  PRIMARY KEY (time, region_id, commodity_id)
);



CREATE INDEX idx_prices_commodity_time ON commodity_prices (commodity_id, time DESC);
CREATE INDEX idx_prices_region_time ON commodity_prices (region_id, time DESC);

-- ─────────────────────────────────────────────
-- WEATHER & RISK
-- ─────────────────────────────────────────────

CREATE TABLE weather_forecasts (
  id              SERIAL PRIMARY KEY,
  region_id       INTEGER REFERENCES regions(id),
  forecast_date   DATE NOT NULL,
  temperature_c   DECIMAL(5,2),
  rainfall_mm     DECIMAL(8,2),
  humidity_pct    DECIMAL(5,2),
  wind_speed_mps  DECIMAL(5,2),
  weather_code    VARCHAR(20),  -- bmkg weather code
  source          VARCHAR(20) DEFAULT 'bmkg',
  fetched_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(region_id, forecast_date)
);

CREATE TABLE harvest_risk_scores (
  id              SERIAL PRIMARY KEY,
  region_id       INTEGER REFERENCES regions(id),
  commodity_id    INTEGER REFERENCES commodities(id),
  scored_at       TIMESTAMPTZ DEFAULT NOW(),
  risk_score      DECIMAL(5,2) NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  risk_level      VARCHAR(20) NOT NULL, -- 'normal','medium','high','critical'
  rainfall_dev    DECIMAL(6,2),  -- % deviation from 30yr normal
  drought_index   DECIMAL(5,2),
  flood_risk      DECIMAL(5,2),
  elnino_phase    VARCHAR(20),   -- 'neutral','weak_la_nina','strong_la_nina','el_nino'
  estimated_loss_ton  DECIMAL(14,2),
  estimated_loss_pct  DECIMAL(5,2),
  notes           TEXT
);

CREATE TABLE weather_alerts (
  id          SERIAL PRIMARY KEY,
  region_id   INTEGER REFERENCES regions(id),
  alert_type  VARCHAR(50) NOT NULL, -- 'flood','drought','pest','frost'
  severity    VARCHAR(20) NOT NULL, -- 'watch','warning','emergency'
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  issued_at   TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active   BOOLEAN DEFAULT TRUE
);

-- ─────────────────────────────────────────────
-- LOGISTICS
-- ─────────────────────────────────────────────

CREATE TABLE distribution_routes (
  id              SERIAL PRIMARY KEY,
  origin_id       INTEGER REFERENCES regions(id),
  destination_id  INTEGER REFERENCES regions(id),
  route_name      VARCHAR(200),
  transport_mode  VARCHAR(30) NOT NULL, -- 'sea','road','air','multimodal'
  distance_km     INTEGER,
  duration_days   DECIMAL(4,1),
  cost_per_ton    DECIMAL(12,2),
  capacity_ton    INTEGER,
  is_active       BOOLEAN DEFAULT TRUE,
  notes           TEXT
);

CREATE TABLE shipments (
  id              SERIAL PRIMARY KEY,
  route_id        INTEGER REFERENCES distribution_routes(id),
  commodity_id    INTEGER REFERENCES commodities(id),
  volume_ton      DECIMAL(14,2) NOT NULL,
  departure_date  DATE,
  arrival_date    DATE,
  status          VARCHAR(30) DEFAULT 'planned', -- 'planned','in_transit','delivered','delayed'
  efficiency_pct  DECIMAL(5,2),
  actual_cost     DECIMAL(14,2),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- VIEWS
-- ─────────────────────────────────────────────

CREATE VIEW v_supply_balance AS
SELECT
  r.name AS region_name,
  r.island,
  c.name AS commodity_name,
  sd.period_month,
  sd.supply_ton,
  sd.demand_ton,
  (sd.supply_ton - sd.demand_ton) AS balance_ton,
  CASE
    WHEN (sd.supply_ton - sd.demand_ton) > 10000 THEN 'surplus'
    WHEN (sd.supply_ton - sd.demand_ton) < -10000 THEN 'deficit'
    ELSE 'balanced'
  END AS status
FROM supply_demand sd
JOIN regions r ON sd.region_id = r.id
JOIN commodities c ON sd.commodity_id = c.id;

CREATE VIEW v_latest_prices AS
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
ORDER BY cp.region_id, cp.commodity_id, cp.time DESC;
