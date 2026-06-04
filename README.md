# Kepang AI - Platform Resiliensi Ketahanan Pangan

Kepang AI adalah prototype decision intelligence untuk membantu TPID, Bapanas,
Bulog, BI regional, dan pemerintah daerah mengambil keputusan pangan yang lebih
cepat dan resilient. Fokusnya bukan hanya memantau harga, tetapi menghubungkan
data supply-demand, inflasi volatile food, cuaca, logistik, dan tekanan makro
seperti pelemahan rupiah menjadi rekomendasi aksi.

Modul utama:
- **Resilience Room** - cockpit keputusan dengan score resiliensi, tekanan rupiah, volatile food, scenario planning, dan prioritas tindakan
- **Supply & Demand Matching** - pemetaan surplus-defisit antar wilayah
- **Food Inflation Monitor** - pemantauan harga, HET, dan tekanan komoditas
- **Smart Food Logistics** - optimasi distribusi, kapasitas rute, dan biaya per ton
- **Weather Risk Engine** - prediksi risiko gagal panen berbasis BMKG dan model forecast berlabel
- **AI Forecasting** - ringkasan risiko, rekomendasi kebijakan, dan analisis redistribusi

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18, Vite, Recharts, TailwindCSS |
| Backend | Node.js 20, Express 5 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Container | Docker + Docker Compose |

## Prasyarat

- Docker & Docker Compose v2
- Node.js 20+ (untuk development lokal)
- API key BMKG atau konfigurasi kode wilayah BMKG untuk data cuaca real-time
- Google Maps Platform key opsional untuk Google Routes API dan Maps Embed API

## Setup Cepat (Docker)

```bash
# 1. Clone dan masuk ke direktori
cd food-security-platform

# 2. Salin file environment
cp backend/.env.example backend/.env
# Opsional untuk peta frontend
cp frontend/.env.example frontend/.env

# 3. Jalankan semua service
docker compose up -d

# 4. Inisialisasi database (sekali saja)
docker compose exec backend npm run db:migrate
docker compose exec backend npm run db:seed

# 5. Tarik histori harga riil dari Bank Indonesia (opsional, direkomendasikan)
docker compose exec backend npm run prices:test-scraper -- 7
docker compose exec backend npm run prices:backfill -- 30

# 6. Tarik refresh cuaca dan alert riil dari BMKG
docker compose exec backend npm run weather:backfill

# 7. Opsional: aktifkan Google route intelligence
# backend/.env: GOOGLE_MAPS_API_KEY=...
# frontend/.env: VITE_GOOGLE_MAPS_EMBED_API_KEY=...

# 8. Buka browser
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
```

## Setup Development Lokal

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend (terminal baru)
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Struktur API

```text
GET  /api/supply/regions          - Data pasokan & permintaan per wilayah
GET  /api/supply/balance          - Neraca penawaran nasional
POST /api/supply/redistribute     - Hitung rencana redistribusi optimal

GET  /api/weather/forecast        - Prakiraan cuaca per wilayah
GET  /api/weather/risk            - Skor risiko gagal panen
GET  /api/weather/alerts          - Peringatan dini aktif

GET  /api/prices/commodities      - Harga komoditas terkini
GET  /api/prices/inflation        - Indeks inflasi pangan
GET  /api/prices/history/:id      - Historis harga per komoditas

GET  /api/logistics/routes        - Rute distribusi aktif
GET  /api/logistics/efficiency    - Metrik efisiensi per rute
GET  /api/logistics/recommendations - Ranking rute, Google ETA opsional, dan data lineage
POST /api/logistics/optimize      - Optimasi rute dengan algoritma greedy

GET  /api/forecast/resilience     - Cockpit resiliensi pangan berbasis makro + operasional
GET  /api/forecast/overview       - Analisis AI kondisi pangan nasional
GET  /api/forecast/redistribution - Rekomendasi redistribusi AI
POST /api/forecast/ask            - Tanya jawab analis AI
```

## Integrasi Data Eksternal

- **Bank Indonesia Harga Pangan** - histori harga komoditas per provinsi, diagregasi ke wilayah aplikasi
- **BMKG API** - curah hujan, suhu, indeks kekeringan
- **BPS API** - baseline statistik resmi untuk pengayaan data
- **BAPANAS** - data stok Bulog regional
- **Google Routes API** - ETA dan jarak rute jalan ketika `GOOGLE_MAPS_API_KEY` tersedia
- **Google Maps Embed API** - peta arah di frontend ketika `VITE_GOOGLE_MAPS_EMBED_API_KEY` tersedia

Konfigurasi di `backend/.env`. Untuk harga riil, aktifkan `USE_REAL_PRICE_DATA=true`. Jika provider riil gagal, backend menandai dataset sebagai `unavailable` atau `forecast`; data sintetis hanya boleh diaktifkan eksplisit dengan `ALLOW_SYNTHETIC_FALLBACK=true` untuk eksperimen lokal dan tidak boleh diklaim sebagai data asli.

Untuk logistik, Google dipakai sebagai sumber real-time hanya untuk jarak dan ETA rute jalan yang dapat dirutekan. Biaya per ton, kapasitas, congestion pelabuhan, carrier, dan stok gudang tetap dilabeli `forecast`/`unavailable` sampai ada integrasi Bulog, operator pelabuhan, carrier, atau warehouse feed. Kunci Google server-side tidak dikirim ke browser; frontend memakai key embed terpisah yang harus dibatasi HTTP referrer.

## Dokumentasi Prototype

- `docs/MARKET_FIT_AND_UX.md` - analisa target user, problem-market fit, UX rationale, dan model bisnis.
- `docs/DATA_SOURCES_AND_FORECASTING.md` - policy data real-time, scraping/API, forecast, unavailable source, dan expected production fields.
- `docs/TESTING.md` - automated checks, manual demo checks, skenario UX test, dan batasan MVP.
- `docs/DEPLOYMENT.md` - panduan deploy Render backend, Vercel frontend, dan Supabase Postgres.

## Catatan MVP

Prototype saat ini memakai pilot 6 wilayah agregasi dan 8 komoditas utama.
Kepang AI tidak mengklaim proxy/seed sebagai data asli. Halaman Resilience Room
menampilkan Data Lineage untuk membedakan `real-time`, `official-release`,
`forecast`, dan `unavailable`. Roadmap berikutnya adalah perluasan ke 34
provinsi, 514 kabupaten/kota, integrasi stok/gudang, dan validasi lapangan
bersama calon pengguna.
