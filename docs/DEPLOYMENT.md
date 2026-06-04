# Kepang AI Deployment Guide

This project is deployed as a small monorepo:

- `backend/` to Render as a Node web service.
- `frontend/` to Vercel as a Vite static app.
- Supabase Postgres as the hosted database.
- Redis is optional for the MVP and can be disabled with `DISABLE_REDIS=true`.

## 1. Push To GitHub

Create a GitHub repository from this folder. Do not commit `.env` files.

Important local files:

```text
.gitignore
render.yaml
backend/.env.example
frontend/.env.example
frontend/vercel.json
```

## 2. Render Backend

In Render, create a new Blueprint or Web Service from the GitHub repository.

If using the Blueprint, Render reads `render.yaml` from the repo root.

Required secrets:

```text
DATABASE_URL
FRONTEND_URL
GOOGLE_MAPS_API_KEY
ANTHROPIC_API_KEY
```

Recommended initial values:

```text
DISABLE_REDIS=true
USE_REAL_PRICE_DATA=true
USE_REAL_WEATHER_DATA=false
ALLOW_VERCEL_PREVIEWS=true
```

After the backend deploys, run the database commands once from Render Shell or a
local terminal pointed at the same `DATABASE_URL`:

```bash
cd backend
npm run db:migrate
npm run db:seed
```

Health check:

```text
https://YOUR-RENDER-SERVICE.onrender.com/api/health
```

## 3. Vercel Frontend

In Vercel, import the same GitHub repository and set:

```text
Root Directory: frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

Required environment variables:

```text
VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com
VITE_GOOGLE_MAPS_EMBED_API_KEY=
```

The `frontend/vercel.json` file provides SPA fallback routing to `index.html`.

## 4. CORS

After Vercel gives you a production URL, set this in Render:

```text
FRONTEND_URL=https://YOUR-VERCEL-APP.vercel.app
```

For multiple frontend origins, separate them with commas:

```text
FRONTEND_URL=https://app.example.com,https://preview.example.com
```

## 5. Security Notes

- Never commit `.env`.
- Rotate the Supabase database password after setup because it was shared during
  local configuration.
- Restrict `GOOGLE_MAPS_API_KEY` to backend/server usage and Google Routes API.
- Restrict `VITE_GOOGLE_MAPS_EMBED_API_KEY` by HTTP referrer and Maps Embed API.
