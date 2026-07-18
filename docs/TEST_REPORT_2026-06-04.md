# Test Report - 2026-06-04

This report summarizes the verification performed after adding the Evidence
Room, refining submission documentation, and cleaning Dashboard encoding.

## Environment

- Frontend: Vite dev app at `http://127.0.0.1:5173/`
- Backend: Express API at `http://localhost:3000`
- Database: Supabase PostgreSQL connection in local backend `.env`
- Redis: disabled locally with `DISABLE_REDIS=true`

## Automated Checks

| Check | Result | Notes |
|---|---|---|
| `npm.cmd run build` in `frontend` | Pass | Vite production build completed; chunk-size warning is non-blocking |
| `node --check src/routes/forecast.js` | Pass | Syntax valid |
| `node --check src/routes/logistics.js` | Pass | Syntax valid |
| `node --check src/services/googleRoutesService.js` | Pass | Syntax valid |

## API Checks

| Endpoint | Result | Key Observation |
|---|---|---|
| `GET /api/health` | Pass | `status=ok`, `database=ok`, `redis=disabled` |
| `GET /api/forecast/resilience` | Pass | Returns macro context, resilience score, data policy, data requirements, and data provenance |
| `GET /api/logistics/recommendations` | Pass | Returns ranked route recommendations and expected production data |

## Browser Checks

| Page | Result | Checks |
|---|---|---|
| Evidence Room | Pass | Heading, official data cards, data source matrix, business model, open gaps, no mojibake |
| Dashboard | Pass | Heading, Resilience Score, supply title, route arrow, no mojibake |

## Important Data Notes

- Google Maps Platform key is not configured locally, so route ETA/distance from
  Google is not claimed as real-time.
- Sea/cargo routes remain labelled as `unavailable` for Google ETA because
  Google road routing does not represent maritime freight operations.
- Route cost/capacity and stock balance remain `forecast` or `unavailable`
  until production data is integrated from Bulog, carriers, ports, warehouses,
  or other operational partners.
- The app is aligned with the data policy: no seed/proxy data is presented as
  audited real-time data.

## Submission Evidence Value

The current prototype now supports the guidebook story through:

- A visible Evidence Room for judge-facing source, KPI, and business model proof.
- Data lineage in Resilience Room.
- Separate documentation for refined submission answers, guidebook alignment,
  data source policy, market fit, and test evidence.
