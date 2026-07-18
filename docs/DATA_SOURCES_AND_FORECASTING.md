# Kepang AI Data Sources and Forecasting Policy

Kepang AI must not present dummy/proxy values as real data. Every dataset in the
prototype is classified as one of four states:

- `real-time`: collected from an API/scraper/source endpoint that can be audited.
- `official-release`: taken from a public official release, not a streaming feed.
- `forecast`: model output derived from available data, assumptions, or scenario inputs.
- `unavailable`: no reliable source is connected yet; the required fields are stated.

## Current Source Plan

| Dataset | Status | Source / Method | Notes |
|---|---|---|---|
| Weather forecast | real-time capable | BMKG Open Data `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=...` | BMKG exposes village-level 3-day forecasts; Kepang AI derives harvest-risk forecasts from it. |
| Food prices | real-time capable | BI Harga Pangan scraper/API and Bapanas Panel Harga when endpoint access is stable | Bapanas Panel Harga states daily updates by enumerators; main panel may be under maintenance, so API availability must be validated before production. |
| Macro rupiah/inflation | official-release | BPS and BI releases | These are official reference data, not tick-level market data. |
| Supply-demand and stock | production_ton: official-release (rice only); demand_ton/stock_ton: unavailable | BPS WebAPI var 2506 "Produksi Padi Menurut Provinsi (Bulanan)", aggregated from 38 provinces to 6 regions. Requires Bapanas/Bulog/Dinas Pangan/warehouse integration for demand/stock. | `supply_demand.production_source` distinguishes `bps` rows from `seed` rows within the same table. Corn (var 2507) is available from BPS but has no matching seed rows to update yet. Public real-time demand/stock by warehouse is not yet connected. |
| Logistics route ETA/distance | real-time capable | Google Routes API when `GOOGLE_MAPS_API_KEY` is configured | Only valid for road-routable legs. Sea/cargo legs require port and carrier data, so they are not labelled as Google real-time. |
| Logistics route cost/capacity | forecast / unavailable | Current MVP uses route-table estimates; production requires Bulog/operator/logistics partner integration | Route cost/capacity data is operational partner data and must not be claimed as real-time without a carrier feed. |
| Resilience score, shock scenario, action plan | forecast | Kepang AI model | These outputs must always be labelled model-derived and validated against operational data. |
| ENSO phase (harvest risk input) | real-time capable | NOAA CPC Oceanic Nino Index `https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt` | Public ASCII feed, no API key. Replaces the previously hardcoded `weak_la_nina` assumption; fetched once per weather poll cycle and classified into `neutral`/`weak_la_nina`/`strong_la_nina`/`el_nino`. |

## Scraping / API Rules

- Prefer official APIs over scraping when available.
- If scraping is used, store the source URL, fetch timestamp, parsing method, and failure state.
- If a source is down or under maintenance, do not generate a fake observation. Mark the dataset as `unavailable` or use a clearly labelled `forecast` output.
- Never write forecast data into the database with a source label such as `bps`, `bi`, or `bapanas`.

## Local Scraper Integration

The workspace folder `Scraper/` contains a Python prototype and HAR capture for
BI Harga Pangan:

- `Scraper/scraper.py` calls `GetChartDaerah`.
- `Scraper/hargapanganapi.har` confirms `GetChartDaerah`, `GetGridDataDaerah`,
  `GetRefProvince`, `GetRefRegency`, and `GetRefMarket` endpoints.
- `Scraper/harga_pangan.csv` is a captured wide-format grid sample.

Kepang AI integrates the feasible part of this logic in Node through
`backend/src/services/biPriceService.js`:

- Regional data first: `GetGridDataDaerah` by province, aggregated to 6 regions.
- National fallback candidate: `GetChartDaerah`, labelled `bi_chart_national`
  if it returns data.
- If national chart data is replicated into regional buckets for schema
  compatibility, the source label remains `bi_chart_national` so it is not
  interpreted as regional market observation.
- Validation on June 3, 2026 showed `GetGridDataDaerah` returned BI price
  records, while `GetChartDaerah` returned an empty `data:[{}]` payload for both
  the current range and the HAR sample range. Therefore production ingestion
  should rely on `GetGridDataDaerah` unless the chart endpoint becomes populated
  again.

Test without writing to the database:

```bash
cd backend
npm run prices:test-scraper -- 7
```

Backfill into the prototype database:

```bash
cd backend
npm run prices:backfill -- 30
```

## Expected Data For Production

### Supply-Demand and Stock

Needed fields:

```text
commodity_code
region_code
period_date
production_ton
stock_ton
demand_ton
warehouse_id
last_updated_at
source_owner
```

Preferred sources:

- Bapanas availability and stock data.
- Bulog warehouse and stock movement systems.
- Dinas Pangan regional reports.
- Market operator reports for demand signals.

### Logistics Route Cost and Capacity

Needed fields:

```text
origin_region
destination_region
transport_mode
capacity_ton
cost_per_ton
lead_time_days
carrier
congestion_status
last_updated_at
```

Preferred sources:

- Bulog logistics planning.
- Port/operator data.
- Transport partner APIs.
- Aggregated shipment records.

### Google Route Intelligence

Connected fields when a Google Maps Platform key is configured:

```text
origin_latitude
origin_longitude
destination_latitude
destination_longitude
google_distance_km
google_duration_hours
google_polyline
fetched_at
```

MVP behavior:

- Backend endpoint: `GET /api/logistics/recommendations`.
- Server key: `GOOGLE_MAPS_API_KEY`, restricted to Google Routes API.
- Frontend embed key: `VITE_GOOGLE_MAPS_EMBED_API_KEY`, restricted by HTTP referrer and Maps Embed API.
- If the key is missing, the endpoint returns `forecast` route metrics from the route table and states the missing configuration.
- If the route is sea/cargo, Google is marked `unavailable` for real-time ETA because Google road routing does not represent maritime freight cost, carrier capacity, or port congestion.
- The output includes `expected_production_data` so operators can see which fields are still needed from Bulog, port operators, carriers, or warehouse systems.

### Price Data

Needed fields:

```text
commodity_code
province_or_market_code
price_level
price_idr
observed_at
source_url
enumerator_or_provider
```

Preferred sources:

- BI Harga Pangan.
- Bapanas Panel Harga.
- BPS official price tables for lower-frequency validation.

## Research Notes: Supply-Demand and Stock Sourcing (2026-07-18)

Investigated whether `supply_demand`, `distribution_routes`, and `shipments` (currently
seed-only, fabricated tables) could be connected to a real public source:

- **Bapanas stock data (`data.badanpangan.go.id`)**: dataset pages advertise CSV/JSON/XLSX
  export, but the actual files are gated behind the internal S.A.P.A application
  (`https://sapa.badanpangan.go.id`), not a public API or direct download link. Requires
  an institutional account; not self-serve. Confirms the current `unavailable` status is
  accurate, not a shortcut that was missed.
- **BPS production data (padi/jagung per provinsi)**: BPS WebAPI (`webapi.bps.go.id`) can
  serve this as a dynamic table via the same `/list/model/data` pattern already used for
  prices in `priceService.js`, but requires (a) a free `BPS_API_KEY` from
  `https://webapi.bps.go.id/developer/`, and (b) looking up the specific `var`/table id for
  production statistics (different from the price `var` ids already in
  `BPS_COMMODITY_VARS`). This would only cover the production side of supply-demand, not
  demand or warehouse stock, which still requires Bapanas/Bulog/Dinas Pangan integration.
- **Logistics cost/capacity/carrier data**: no public API found; this is operational partner
  data by nature (Bulog, port operators, freight carriers) and is not expected to have an
  open endpoint. Google Routes API (already integrated) remains the only real-time piece
  (distance/ETA for road legs).

**Update 2026-07-19**: the recommended next step above was completed. A BPS API key was
registered and `backend/src/services/bpsProductionService.js` now pulls real monthly rice
production (BPS var 2506, "Produksi Padi Menurut Provinsi (Bulanan)") for all 38 provinces,
aggregated to the 6 pilot regions. `backend/src/scripts/backfillProduction.js` updates
`production_ton` on existing `supply_demand` rows only (never inserts fabricated
`supply_ton`/`demand_ton` alongside it) and tags them `production_source = 'bps'` so real
and seed rows remain distinguishable within the same table. Corn (var 2507) is also wired
up but currently has no matching seed rows to update since `supply_demand` was only seeded
for rice. `demand_ton`, `stock_ton`, and logistics cost/capacity remain `unavailable` until
an institutional data-sharing agreement exists.

## Public References

- BMKG Open Data forecast documentation: https://data.bmkg.go.id/prakiraan-cuaca
- Bapanas Panel Harga FAQ: https://dev-panelharga.badanpangan.go.id/faq
- Bapanas Open Data portal: https://data.badanpangan.go.id/
- Google Routes API overview: https://developers.google.com/maps/documentation/routes/overview
- Google Maps Embed API overview: https://developers.google.com/maps/documentation/embed/get-started
- BPS May 2026 inflation release: https://www.bps.go.id/id/pressrelease/2026/06/02/2579/inflasi-year-on-year--y-on-y--pada-mei-2026-sebesar-3-08-persen-.html
- BI May 2026 RDG release: https://www.bi.go.id/id/publikasi/ruang-media/news-release/Pages/sp_2810726.aspx
