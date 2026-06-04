-- ─────────────────────────────────────────────
-- REGIONS (6 major island groups)
-- ─────────────────────────────────────────────
INSERT INTO regions (code, name, island, latitude, longitude, area_km2, population) VALUES
  ('JW',  'Jawa',                  'Jawa',         -7.6145,  110.7122, 128297,  151600000),
  ('SM',  'Sumatera',              'Sumatera',      0.5897,  101.3431, 473481,  58560000),
  ('KL',  'Kalimantan',            'Kalimantan',    1.6814,  113.3824, 747728,  16380000),
  ('SL',  'Sulawesi',              'Sulawesi',     -1.4300,  121.4456, 174600,  20000000),
  ('NT',  'Bali & Nusa Tenggara',  'Nusa Tenggara',-8.3405,  115.0920,  73070,  13700000),
  ('PM',  'Papua & Maluku',        'Papua',        -4.2699,  138.0804, 420540,   9800000);

-- ─────────────────────────────────────────────
-- COMMODITIES
-- ─────────────────────────────────────────────
INSERT INTO commodities (code, name, unit, category, het_price) VALUES
  ('BERAS',   'Beras Premium',  'kg',    'grain',     14800),
  ('JAGUNG',  'Jagung',         'kg',    'grain',      6400),
  ('KEDELAI', 'Kedelai',        'kg',    'grain',     12100),
  ('CABAI',   'Cabai Merah',    'kg',    'vegetable', 40000),
  ('BAWANG',  'Bawang Merah',   'kg',    'vegetable', 28000),
  ('MINYAK',  'Minyak Goreng',  'liter', 'oil',       14000),
  ('GULA',    'Gula Pasir',     'kg',    'sugar',     15500),
  ('DAGING',  'Daging Sapi',    'kg',    'protein',  130000);

-- ─────────────────────────────────────────────
-- SUPPLY & DEMAND (last 6 months, rice)
-- ─────────────────────────────────────────────
DO $$
DECLARE
  beras_id INTEGER;
  months DATE[] := ARRAY[
    '2025-10-01','2025-11-01','2025-12-01',
    '2026-01-01','2026-02-01','2026-03-01'
  ];
  m DATE;
  rid INTEGER;
  supply_base DECIMAL[];
  demand_base DECIMAL[];
  i INTEGER;
BEGIN
  SELECT id INTO beras_id FROM commodities WHERE code = 'BERAS';
  supply_base := ARRAY[1240, 820, 310, 290, 180, 95];
  demand_base := ARRAY[1180, 790, 320, 275, 240, 150];

  FOREACH m IN ARRAY months LOOP
    i := 1;
    FOR rid IN SELECT id FROM regions ORDER BY id LOOP
      INSERT INTO supply_demand (region_id, commodity_id, period_month, supply_ton, demand_ton, production_ton)
      VALUES (
        rid, beras_id, m,
        (supply_base[i] * 1000 * (0.95 + random() * 0.1))::DECIMAL(14,2),
        (demand_base[i] * 1000 * (0.97 + random() * 0.06))::DECIMAL(14,2),
        (supply_base[i] * 1000 * 0.85 * (0.95 + random() * 0.1))::DECIMAL(14,2)
      )
      ON CONFLICT (region_id, commodity_id, period_month) DO NOTHING;
      i := i + 1;
    END LOOP;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────
-- COMMODITY PRICES (12 months of data)
-- Fixed: use (d - DATE '2025-04-01') which returns integer days directly
-- ─────────────────────────────────────────────
DO $$
DECLARE
  region_rec RECORD;
  commodity_rec RECORD;
  d DATE := '2025-04-01';
  price DECIMAL(12,2);
  base_prices DECIMAL[] := ARRAY[14800, 6400, 12100, 38500, 28000, 14000, 15500, 130000];
  ci INTEGER;
  days_elapsed INTEGER;
BEGIN
  WHILE d <= '2026-04-01' LOOP
    ci := 1;
    days_elapsed := d - DATE '2025-04-01';
    FOR commodity_rec IN SELECT id FROM commodities ORDER BY id LOOP
      FOR region_rec IN SELECT id FROM regions LOOP
        price := base_prices[ci] * (
          1 +
          (sin(extract(doy from d) / 30.0) * 0.08) +
          ((random() - 0.5) * 0.06) +
          CASE WHEN ci IN (4,5) THEN (days_elapsed::DECIMAL / 86400) * 0.0008 ELSE 0 END
        );
        INSERT INTO commodity_prices (time, region_id, commodity_id, price_idr, price_source)
        VALUES (d::TIMESTAMPTZ, region_rec.id, commodity_rec.id, price::DECIMAL(12,2), 'seed')
        ON CONFLICT DO NOTHING;
      END LOOP;
      ci := ci + 1;
    END LOOP;
    d := d + INTERVAL '3 days';
  END LOOP;
END $$;

-- ─────────────────────────────────────────────
-- WEATHER FORECASTS (next 14 days)
-- ─────────────────────────────────────────────
DO $$
DECLARE
  region_rec RECORD;
  d DATE := CURRENT_DATE;
BEGIN
  WHILE d <= CURRENT_DATE + 14 LOOP
    FOR region_rec IN SELECT id FROM regions LOOP
      INSERT INTO weather_forecasts (region_id, forecast_date, temperature_c, rainfall_mm, humidity_pct, wind_speed_mps, weather_code)
      VALUES (
        region_rec.id, d,
        (25 + random() * 8)::DECIMAL(5,2),
        CASE region_rec.id
          WHEN 4 THEN (15 + random() * 50)::DECIMAL
          WHEN 1 THEN (12 + random() * 40)::DECIMAL
          ELSE (random() * 20)::DECIMAL
        END,
        (70 + random() * 25)::DECIMAL(5,2),
        (2 + random() * 8)::DECIMAL(5,2),
        CASE WHEN random() > 0.6 THEN 'heavy_rain'
             WHEN random() > 0.3 THEN 'moderate_rain'
             ELSE 'cloudy' END
      )
      ON CONFLICT (region_id, forecast_date) DO NOTHING;
    END LOOP;
    d := d + 1;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────
-- HARVEST RISK SCORES
-- ─────────────────────────────────────────────
INSERT INTO harvest_risk_scores
  (region_id, commodity_id, risk_score, risk_level, rainfall_dev, drought_index,
   flood_risk, elnino_phase, estimated_loss_ton, estimated_loss_pct, notes)
SELECT
  r.id, c.id,
  CASE r.code WHEN 'SL' THEN 78 WHEN 'JW' THEN 61 WHEN 'NT' THEN 44
              WHEN 'KL' THEN 28 WHEN 'SM' THEN 22 ELSE 18 END,
  CASE r.code WHEN 'SL' THEN 'critical' WHEN 'JW' THEN 'high'
              WHEN 'NT' THEN 'medium'   ELSE 'normal' END,
  CASE r.code WHEN 'SL' THEN 38 WHEN 'NT' THEN -25 ELSE (random()*10)::DECIMAL END,
  CASE r.code WHEN 'NT' THEN 3.2 ELSE (random()*1.5)::DECIMAL END,
  CASE r.code WHEN 'SL' THEN 72 WHEN 'JW' THEN 55 ELSE (random()*20)::DECIMAL END,
  'weak_la_nina',
  CASE r.code WHEN 'SL' THEN 78000 WHEN 'JW' THEN 49500 WHEN 'NT' THEN 22000 ELSE 0 END,
  CASE r.code WHEN 'SL' THEN 42 WHEN 'JW' THEN 18 WHEN 'NT' THEN 35 ELSE 0 END,
  CASE r.code
    WHEN 'SL' THEN 'Curah hujan ekstrem +38% di atas normal, risiko banjir sawah'
    WHEN 'JW' THEN 'Hujan deras persisten Jawa Tengah, OPT wereng meningkat'
    WHEN 'NT' THEN 'Kekeringan musim tanam kedua, debit irigasi turun'
    ELSE 'Kondisi normal'
  END
FROM regions r
CROSS JOIN commodities c
WHERE c.code = 'BERAS';

-- ─────────────────────────────────────────────
-- WEATHER ALERTS
-- ─────────────────────────────────────────────
INSERT INTO weather_alerts (region_id, alert_type, severity, title, description, valid_until)
VALUES
  (4, 'flood',   'emergency', 'Banjir sawah ekstrem — Sulawesi Selatan',
   'Curah hujan 38% di atas normal diprakirakan berlanjut hingga Juni 2026. Risiko banjir sawah di 12 kabupaten sentra padi.',
   CURRENT_TIMESTAMP + INTERVAL '60 days'),
  (1, 'pest',    'warning',   'Serangan OPT wereng coklat — Jawa Tengah',
   'Kelembaban tinggi memicu lonjakan populasi wereng coklat di Brebes, Demak, dan Pati.',
   CURRENT_TIMESTAMP + INTERVAL '45 days'),
  (5, 'drought', 'warning',   'Kekeringan musim tanam — Nusa Tenggara Timur',
   'Debit irigasi turun 35% dari kapasitas normal. Musim tanam kedua terancam mundur 3-4 minggu.',
   CURRENT_TIMESTAMP + INTERVAL '90 days');

-- ─────────────────────────────────────────────
-- DISTRIBUTION ROUTES
-- ─────────────────────────────────────────────
INSERT INTO distribution_routes
  (origin_id, destination_id, route_name, transport_mode, distance_km, duration_days, cost_per_ton, capacity_ton)
VALUES
  (1, 5, 'Tanjung Priok → Lembar → Kupang',  'sea', 1350, 3.5, 285000, 20000),
  (2, 6, 'Belawan → Ambon → Jayapura',        'sea', 3800, 8.5, 410000, 18000),
  (4, 6, 'Makassar → Ambon → Sorong',         'sea', 2100, 5.0, 310000, 15000),
  (1, 3, 'Tanjung Priok → Balikpapan',        'sea', 1600, 4.0, 240000, 22000),
  (2, 1, 'Belawan → Tanjung Priok',           'sea',  900, 2.5, 180000, 25000),
  (1, 4, 'Tanjung Priok → Makassar',          'sea', 1850, 4.5, 265000, 20000);
-- SAMPLE SHIPMENTS FOR LOGISTICS MVP
DO $$
DECLARE
  beras_id INTEGER;
BEGIN
  SELECT id INTO beras_id FROM commodities WHERE code = 'BERAS';

  INSERT INTO shipments
    (route_id, commodity_id, volume_ton, departure_date, arrival_date, status, efficiency_pct, actual_cost, notes)
  VALUES
    (1, beras_id, 14500, CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE - INTERVAL '4 days', 'delivered', 82, 4132500000, 'Pilot redistribusi stok ke Nusa Tenggara'),
    (2, beras_id, 12000, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '3 days', 'in_transit', 64, 4920000000, 'Rute jauh, perlu konsolidasi muatan'),
    (3, beras_id, 9500, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '2 days', 'in_transit', 73, 2945000000, 'Konsolidasi suplai timur'),
    (4, beras_id, 11000, CURRENT_DATE + INTERVAL '1 days', CURRENT_DATE + INTERVAL '5 days', 'planned', 78, 2640000000, 'Pre-positioning stok Kalimantan'),
    (6, beras_id, 13000, CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '7 days', 'planned', 76, 3445000000, 'Mitigasi risiko panen Sulawesi')
  ON CONFLICT DO NOTHING;
END $$;
