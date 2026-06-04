# Kepang AI Market Fit and UX Notes

## Target users

Kepang AI is designed for institutional users who need to coordinate food
security decisions under time pressure:

- TPID and local government analysts who monitor inflation and decide market interventions.
- Bapanas and Bulog operators who plan food stock movement and buffer placement.
- BI regional teams who need evidence for food inflation coordination.
- Logistics partners who validate route capacity, cost, and backhaul potential.

These users do not need a consumer-style app. They need a dense, credible, and
auditable decision surface: status, cause, recommended action, owner, timing, and
data source.

## Problem-market fit

The core market pain is policy lag. Food price data may be visible, but price,
stock, weather, regional balance, logistics cost, and macro pressure are not
usually interpreted in one operational workflow. This matters more when rupiah
weakens because imported inputs, energy, logistics, and some commodities become
more vulnerable to price pressure.

Recent evidence used by the prototype narrative:

- BPS reported May 2026 inflation at 3.08% yoy and 0.28% mtm.
- Volatile food reached 6.24% yoy, with pressure from cabai merah, minyak
  goreng, bawang merah, tomat, and beras.
- BI reported USD/IDR at Rp17,700 on 19 May 2026 and raised BI-Rate to 5.25%.
- Bapanas identifies structural food distribution gaps between surplus
  production centers and deficit regions across Indonesia's archipelago.

Reference sources:

- BPS May 2026 inflation release: https://www.bps.go.id/id/pressrelease/2026/06/02/2579/inflasi-year-on-year--y-on-y--pada-mei-2026-sebesar-3-08-persen-.html
- Bank Indonesia May 2026 RDG release: https://www.bi.go.id/id/publikasi/ruang-media/news-release/Pages/sp_2810726.aspx
- BPS February 2026 export-import release: https://www.bps.go.id/assets/pressrelease/2026/04/01/2557/ekspor-dan-impor-indonesia-februari-2026-masing-masing-tercatat-usd-22-17-miliar-dan-usd-20-89-miliar-.html
- Bapanas Renstra 2025-2029: https://peraturan.go.id/filespengundangan/peraturan-bapanas-no-9-tahun-2025.pdf
- Antara report on BI's May 2026 inflation assessment: https://www.antaranews.com/berita/5591537/bi-inflasi-mei-2026-terjaga-berkat-kebijakan-dan-sinergi

## UX strategy

The UX now follows a decision workflow:

1. See national resilience status.
2. Identify why the system is under pressure.
3. Simulate shocks such as weaker rupiah, higher logistics cost, and harvest loss.
4. Review priority action cards with owner, timeframe, and KPI.
5. Review logistics route ranking with ETA/distance, recommended volume, and
   source confidence.
6. Check provenance to distinguish reference, seed, fallback, and real data.

The most important UX shift is the new `Resilience Room`. It is intentionally a
working cockpit rather than a marketing page. It surfaces pressure breakdown,
imported inflation exposure, scenario planning, and action priorities in one view.

## Product decisions

- Keep MVP at 6 aggregate regions to make the demo manageable and honest.
- Make data lineage visible because some datasets are forecast outputs or
  currently unavailable without institutional integration.
- Treat rupiah pressure as a scenario input, not a deterministic claim.
- Translate analytics into policy actions: pre-positioning stock, climate
  mitigation, price intervention, and logistics optimization.
- Use Google Maps as route intelligence for distance/ETA only, while cost,
  capacity, carrier availability, and sea freight constraints require operator
  data before being treated as real-time.
- Use restrained dashboard styling for institutional credibility.

## Business model fit

The strongest model is B2G or institutional SaaS:

- Annual institutional licensing for dashboards by region/module.
- Implementation fee for data integration, training, and custom workflow.
- Managed analytics reports for monthly food risk and scenario planning.
- API subscriptions for risk scores, anomaly signals, and logistics optimization.
- Logistics add-on fees for route optimization and backhaul matching.

The product monetizes the intelligence layer, not raw public data.

## Next validation steps

Run 5-10 structured interviews with:

- TPID or local government analysts.
- Dinas pangan staff.
- Bulog/logistics operators.
- Commodity traders or market operators.
- BI regional or inflation coordination stakeholders.

Key questions:

1. What data do you check before deciding a food intervention?
2. Where does the current process become slow?
3. Which recommendation would be most useful: price alert, stock placement, or route optimization?
4. What proof is required before trusting a recommendation?
5. What KPI would make this tool worth adopting?
