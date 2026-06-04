# Kepang AI Testing Notes

This document defines the test coverage used for the hackathon MVP and the
manual checks expected before a demo or submission.

## Product Scope Under Test

- Decision cockpit: Dashboard and Resilience Room.
- Data integration: supply-demand, commodity prices, harvest risk, logistics,
  and macro reference context.
- Decision output: resilience score, pressure index, imported inflation
  exposure, scenario planning, and priority action cards.
- Transparency: data provenance that separates public reference data, pilot
  seed/proxy data, forecast output, unavailable source, and real-time data.

## Automated Checks

Run these from the project root:

```bash
cd frontend
npm run build
```

Run these from the backend folder:

```bash
node --check src/routes/forecast.js
node --check src/routes/prices.js
node --check src/routes/logistics.js
node --check src/services/aiService.js
node --check src/services/googleRoutesService.js
```

Expected result:

- Frontend builds without syntax or bundling errors.
- Backend route files pass JavaScript syntax checks.
- No stale branding appears in the active UI for the core product name.

## Local Demo Checks

1. Start the stack with Docker Compose or the existing local setup.
2. Re-run database migration and seed if the database is new.
3. Open the frontend and check these pages:
   - Dashboard: resilience score, rupiah risk, volatile food, deficit regions.
   - Resilience Room: pressure breakdown, scenario sliders, action cards,
     imported inflation exposure, and data provenance.
   - AI Forecasting: suggested questions include rupiah, logistics, and
     resilience decision scenarios.
   - Logistics: route and shipment data are visible after seeding.
   - Logistics recommendations: top route cards show route score, forecast or
     real-time labels, recommended volume, ETA, and expected production data.
   - Without Google key: recommendation panel still loads and labels Google as
     unavailable or forecast.
   - With Google key: road-routable routes can return Google distance/ETA while
     sea/cargo routes remain labelled as requiring operator data.

## Manual UX Test Scenarios

Use these tasks with target users such as TPID analysts, food-agency operators,
Bulog planners, and regional BI analysts.

1. Identify which region requires the fastest stock intervention.
2. Explain why the current resilience score is not fully safe.
3. Simulate a 5-10% rupiah weakening and identify which commodities become
   more fragile.
4. Choose one logistics action and state the KPI that would prove it worked.
5. Check whether Google-based route information is understood as ETA/distance,
   not proof of cargo cost or carrier availability.
6. Check whether the data provenance is clear enough to trust the dashboard in
   a coordination meeting.

Success criteria:

- User can identify the top intervention in under 3 minutes.
- User can explain the problem-solution-outcome link without outside guidance.
- User understands that forecast/proxy values are model output, not a production
  claim of real-time observations.
- User can distinguish `real-time`, `official-release`, `forecast`, and
  `unavailable` labels without explanation.
- User can name at least one decision the tool would improve.

## Market Fit Validation

The MVP is considered directionally fit if interviews or tests show that:

- Stakeholders currently combine data manually across BPS, BI, BMKG, Bapanas,
  Bulog, and regional reports.
- The pain is decision latency, not only lack of dashboards.
- Scenario planning around rupiah, logistics cost, and harvest risk is useful
  for coordination.
- A paid institutional package is plausible when the tool reduces analysis time,
  improves meeting readiness, or supports earlier intervention.

## Known Limits

- Pilot coverage is limited to 6 aggregated regions and selected commodities.
- Some datasets are forecast/proxy values until institutional data integration is
  available.
- Production rollout needs audited data-sharing agreements, access control,
  monitoring, and a stronger validation dataset.
