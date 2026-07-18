# Guidebook Alignment Checklist

Dokumen ini memetakan isi prototype dan lampiran terhadap kriteria guidebook
Submission Tahap 2.

## Kriteria Utama

| Kriteria Guidebook | Bukti di Kepang AI | Status | Gap Berikutnya |
|---|---|---|---|
| Alignment with Problem Statement | Problem diarahkan ke Digitalisasi Ketahanan Pangan, policy lag, supply-demand, harga, cuaca, logistik, dan rupiah | Ready | Pastikan form memakai problem statement yang sama dengan prototype |
| Effectiveness & Impact | Resilience Score, action cards, impact KPI, target time-to-insight, supply gap, dan route efficiency | Ready for MVP | Validasi KPI dengan 5-10 calon user |
| Uniqueness / Creativity | Decision cockpit, scenario shock rupiah, data lineage, dan rekomendasi logistik source-aware | Ready | Tambahkan video demo agar kebaruan terlihat cepat |
| Technical Quality | React/Vite, Express, PostgreSQL/Supabase, API modular, BI scraper, BMKG service, Google route optional | Ready for prototype | Production hardening: auth, scheduler, monitoring, backup |
| Business Model Feasibility | B2G SaaS, implementation fee, managed analytics, API subscription, logistics add-on | Ready | Tambahkan estimasi pricing saat ada data pilot |

## Identitas Tim

| Field | Kebutuhan Guidebook | Status |
|---|---|---|
| ID Tim | Harus sesuai data pendaftaran | P0684 |
| Nama Tim | Nama resmi tim | Draft memakai J4 |
| Team Composition | Maksimal 120 kata menurut guidebook | Draft sudah ringkas, perlu cek ulang nama/peran final |
| Executive Summary | Maksimal 150 kata menurut guidebook | Draft sudah diarahkan ke problem, solusi, dan dampak |

## Problem and Ecosystem

| Field | Prinsip Jawaban | Evidence |
|---|---|---|
| Problem Statement | Satu pertanyaan masalah yang tajam | Policy lag saat data harga, stok, cuaca, logistik, dan rupiah berubah bersamaan |
| Primary Sub-Problem | Ambil dari tema guidebook | Digitalisasi Ketahanan Pangan |
| Problem Validation | Gunakan data terbaru dan akar masalah | BPS inflasi Mei 2026, BI RDG Mei 2026, Bapanas Renstra 2025-2029 |
| Ecosystem Alignment | Jelaskan stakeholder dan regulasi | TPID, Bapanas, Bulog, BI, BMKG, BPS, pemda, mitra logistik |

## Solution and Technical Validation

| Field | Bukti Prototype |
|---|---|
| Solution Approach & Mechanism | Resilience Room menghubungkan data -> score -> skenario -> action card |
| System Architecture | Frontend, backend, database, cache optional, service BI/BMKG/Google, data lineage |
| Data & Feasibility | Data source matrix membedakan real-time capable, official-release, forecast, dan unavailable |
| Security & Compliance | Env secrets, backend-only API key, no PII, CORS, Helmet, rate limit, auditability |
| Implementation Readiness | MVP berjalan lokal dengan Supabase, seed, backend API, dan frontend dashboard |

## Business and Market Validation

| Field | Jawaban yang Disarankan |
|---|---|
| Value Proposition | Keputusan pangan lebih cepat, presisi, dan resilient |
| Revenue Model | B2G SaaS, implementation fee, managed analytics, API subscription, logistics add-on |
| Cost Structure | Product, cloud, data integration, security, model, support, partnership |
| Scalability | 6 wilayah agregasi -> 34 provinsi -> 514 kabupaten/kota |
| Partnership | TPID/pemda/Bapanas/Bulog/BI regional sebagai pilot; BMKG/BPS/BI sebagai referensi; logistik sebagai data partner |
| Evidence of Demand | Desk research kuat; interview calon user masih perlu ditambah |

## Lampiran yang Disarankan

- `docs/SUBMISSION_ANSWERS_REFINED.md` untuk jawaban form.
- `docs/SUBMISSION_SUPPORTING_EVIDENCE.md` untuk diagram, data source, KPI, business model, dan gap.
- `docs/EVIDENCE_OF_DEMAND_RESEARCH.md` untuk riset problem nyata, demand driver, dan mapping solusi.
- `docs/DATA_SOURCES_AND_FORECASTING.md` untuk policy data asli/forecast/unavailable.
- `docs/MARKET_FIT_AND_UX.md` untuk analisa calon user, UX, dan market fit.
- `docs/TESTING.md` serta test report terbaru untuk bukti kesiapan teknis.
- Screenshot Resilience Room, Logistics, Dashboard, dan Evidence Room.
- Video walkthrough 2-3 menit.

## Risiko Jika Tidak Ditutup

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Identitas tim belum final | Form tidak bisa submit | Isi ID tim dan cek komposisi final |
| Evidence of demand masih desk research | Nilai market validation bisa turun | Lakukan 5-10 interview singkat dan tambahkan ringkasan |
| Data stok/logistik belum real-time | Klaim data bisa dipertanyakan | Tampilkan sebagai unavailable/forecast dan tulis expected production data |
| Hosting belum final | Demo publik belum stabil | Gunakan video walkthrough dan screenshot sebagai backup |
| Google Maps key belum aktif | ETA/jarak real-time belum muncul | Biarkan mode forecast, jelaskan hanya ETA/jarak Google yang real-time |
