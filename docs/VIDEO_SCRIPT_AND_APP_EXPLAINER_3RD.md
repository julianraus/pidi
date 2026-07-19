# Kepang AI — Penjelasan Aplikasi & Skrip Video (Submission Tahap 3)

## Bagian 1: Penjelasan Aplikasi (buat kamu paham luar kepala sebelum syuting)

### Satu kalimat inti

Kepang AI mengubah data harga, cuaca, produksi, dan logistik pangan yang
tersebar di banyak lembaga menjadi **satu rekomendasi tindakan** untuk
pengambil kebijakan pangan daerah — bukan sekadar dashboard monitoring.

### Siapa penggunanya, dan masalah apa yang diselesaikan

Pengguna utama: **TPID, Bapanas, Bulog, BI regional, dinas pangan daerah** —
orang-orang yang harus memutuskan kapan operasi pasar, kemana stok
dipindahkan, dan wilayah mana yang butuh perhatian duluan.

Masalah: **policy lag**. Harga naik, cuaca ekstrem, rupiah melemah, dan
gangguan logistik sering terjadi bersamaan, tapi datanya ada di sistem
berbeda-beda (BI untuk harga, BMKG untuk cuaca, BPS untuk makro/produksi,
tidak ada satupun yang menyatukannya jadi keputusan). Akibatnya intervensi
baru terjadi setelah harga sudah naik duluan, bukan sebelum.

### 7 modul aplikasi (urutan yang masuk akal untuk demo)

1. **Dashboard** — cockpit ringkas: Resilience Score, Source Confidence
   (persen data yang real-time vs forecast), decision brief prioritas hari
   ini, peta status nasional.
2. **Resilience Room** — ruang kerja utama: pressure breakdown (kontribusi
   harga/cuaca/rupiah terhadap skor), scenario planning (simulasi rupiah
   melemah/cuaca ekstrem/gagal panen), action plan dengan owner+timeframe+KPI.
3. **Supply & Demand** — neraca pasokan per wilayah, peta surplus-defisit,
   **skor risiko gagal panen per wilayah**, dan rencana redistribusi optimal.
4. **Food Inflation Monitor** — harga komoditas real-time vs HET, indeks
   inflasi pangan.
5. **Smart Food Logistics** — rekomendasi rute prioritas dengan skor
   (urgensi defisit + kapasitas + biaya + ETA + source confidence), peta
   jaringan distribusi.
6. **Weather Risk Engine** — forecast BMKG per wilayah, alert dini.
7. **Market & Evidence Room** — 4 tab: Demand (bukti masalah nyata),
   Data Trust (matrix status semua dataset), Business Case (kalkulator
   revenue/ROI interaktif), Pilot Roadmap.

### Apa yang REAL (bisa kamu klaim dengan percaya diri di video)

- **Harga pangan**: live dari BI Harga Pangan — konsumen *dan* produsen
  (dua level harga, baru diintegrasikan). Dari situ muncul **margin
  distribusi produsen-konsumen** — contoh nyata: Bawang Merah di Kalimantan,
  produsen Rp30.000 vs konsumen Rp45.810 (margin 52,7%). Ini sinyal
  inefisiensi rantai pasok yang jarang ditampilkan platform lain.
- **Cuaca**: live dari BMKG, 6/6 wilayah pilot terverifikasi.
- **Fase ENSO** (input model risiko panen): live dari NOAA, bukan asumsi
  statis lagi.
- **Produksi padi**: live dari BPS (var 2506), per provinsi, diagregasi ke
  6 wilayah — angka production_ton di Supply & Demand sekarang data
  pemerintah asli untuk beras.
- **Konteks makro selalu terkini**: inflasi 3,34% yoy dan BI-Rate 5,75%
  (rilis Juni 2026, per 19 Juli 2026) — BI menaikkan BI-Rate **tiga kali
  berturut-turut** sejak Mei 2026 (+100bps total) khusus untuk menahan
  pelemahan rupiah. Ini bukti nyata dan terbaru untuk narasi inti Kepang AI
  soal tekanan imported inflation — sebutkan di video, ini poin yang kuat.

### Apa yang MODEL/FORECAST (transparan, rule-based, bukan black-box — ini kekuatan, bukan kelemahan)

Resilience Score, skor risiko gagal panen, dan ranking rute logistik adalah
**hasil hitungan dari formula yang bisa ditelusuri** (bobot tetap: deviasi
curah hujan 40%, indeks banjir 30%, indeks kekeringan 20%, ENSO 10% —
bukan AI black-box). Ini justru relevan dengan kriteria "Algorithm Quality"
guideline yang eksplisit bilang tidak wajib pakai AI asal logikanya
transparan dan bisa ditelusuri.

### Apa yang JUJUR belum tersedia (jangan disembunyikan, tunjukkan sebagai kedewasaan produk)

Stok gudang, demand granular per wilayah, dan biaya/kapasitas logistik
aktual masih berlabel `forecast`/`unavailable` — karena data itu terkunci
di sistem internal Bapanas (S.A.P.A), bukan API publik. Ini **sudah dicek
langsung**, bukan asumsi. Tampilkan badge ini di video — justru
menunjukkan kejujuran data yang diminta guideline.

---

## Bagian 2: Skrip Video

Guideline merekomendasikan format **1-Minute Pitch + 2-Minute Demo**
(total pas 3 menit, sesuai batas maksimal). Skrip di bawah sudah dipecah
per detik sesuai rekomendasi guideline sendiri.

### FORMAT A — One-Minute Pitch (elevator pitch)

| Waktu | Narasi (draft, sesuaikan gaya bicara kamu) | Visual |
|---|---|---|
| **0–5 detik** | "Kami J4, dan ini Kepang AI." | Logo/judul: "Kepang AI — Decision Intelligence untuk Resiliensi Ketahanan Pangan Daerah" |
| **5–15 detik** | "Bank Indonesia sudah menaikkan suku bunga tiga kali berturut-turut demi menahan rupiah. TPID dan dinas pangan butuh cara cepat menghubungkan tekanan ini ke keputusan stok pangan — bukan data yang tersebar di sistem berbeda." | Cuplikan Dashboard/Evidence Room: fact card BI-Rate 5,75% dan inflasi 3,34% |
| **15–35 detik** | "Kepang AI menyatukan semuanya jadi satu Resilience Score dan rekomendasi tindakan. Di sini, harga bawang merah — data produsen dan konsumen, live dari Bank Indonesia — menunjukkan margin distribusi 52 persen di Kalimantan. Sistem langsung merekomendasikan wilayah mana yang perlu diprioritaskan." | Screen record: Resilience Room → pressure breakdown → Supply & Demand → margin/harga |
| **35–45 detik** | "Skornya dihitung dari formula yang bisa ditelusuri — bukan black-box — dari data cuaca BMKG, harga BI, produksi BPS, dan indeks iklim NOAA yang semuanya live." | Cuplikan Weather Risk / data lineage badge |
| **45–55 detik** | "Hasilnya: waktu identifikasi wilayah prioritas turun dari berjam-jam jadi di bawah 3 menit — dan berpotensi menjadi produk SaaS institusional dengan model lisensi tahunan ke pemda dan Bapanas." | Cuplikan Evidence Room tab Business Case |
| **55–60 detik** | "Prototype sudah berjalan end-to-end dengan data real. Kami membuka kolaborasi dengan TPID dan Bapanas untuk pilot pertama." | Closing card: nama tim + call to action |

### FORMAT B — Two-Minute Demo (kalau kamu pilih format terpisah, bukan 3 menit gabungan)

| Waktu | Fokus | Yang ditampilkan |
|---|---|---|
| **0–10 detik** | Pengantar | "Ini adalah alur kerja seorang analis TPID saat harga cabai naik cepat di satu wilayah." |
| **10–60 detik** | Bukti utama | Screen record nyata: buka Dashboard → lihat Resilience Score turun → masuk Resilience Room → lihat pressure breakdown (kontribusi harga/cuaca/rupiah) → buka Supply & Demand, tunjukkan peta surplus-defisit dan skor risiko gagal panen per wilayah |
| **60–90 detik** | Cara kerja & kedalaman | Jelaskan singkat: "Input-nya harga harian BI, forecast BMKG, fase ENSO NOAA, produksi BPS. Diproses jadi risk score dengan bobot tetap, lalu resilience score gabungan. Semua data diberi label real-time/forecast/unavailable — bisa diaudit dari API, bukan cuma diklaim di layar." (tunjukkan badge data lineage) |
| **90–110 detik** | Bukti validasi | "Kami verifikasi langsung setiap integrasi — bukan asumsi. Contoh: kami temukan dan perbaiki kode wilayah cuaca yang salah, dan bug label data yang bisa membuat data sintetis diklaim sebagai data resmi." (opsional: cuplikan kode/terminal test kalau mau kasih kredibilitas teknis) |
| **110–120 detik** | Status jujur & closing | "Harga, cuaca, dan produksi sudah real. Stok gudang dan biaya logistik masih kami tandai forecast sampai ada kemitraan data dengan Bapanas dan Bulog. Kami siap pilot dengan TPID dan dinas pangan." |

### Rekomendasi teknis (dari guideline, wajib dipatuhi)

- Durasi maksimal **180 detik total**, termasuk logo/bumper/credit.
- Resolusi minimum **1920×1080 (Full HD)**, rasio **16:9 horizontal**.
- Upload ke **YouTube, harus publik** (bukan private/unlisted-only kalau
  panitia perlu akses langsung — cek instruksi submission form lagi soal
  unlisted vs public).
- Subtitle sangat direkomendasikan.
- Audio narasi jelas, musik latar tidak boleh menutupi suara.

### Do's yang paling relevan buat kamu

- Tunjukkan data real (harga produsen-konsumen, margin, angka BPS) —
  ini "bukti yang dapat dipertanggungjawabkan" persis yang diminta guideline.
- Jangan sembunyikan bagian yang masih forecast/unavailable — tunjukkan
  badge-nya. Guideline eksplisit menghargai kejujuran status.
- Screen recording asli dari aplikasi berjalan > slide statis.

---

## Bagian 3: Checklist sebelum submit

- [ ] Konfirmasi Team ID final di form pidi.id (draft pakai P0684, cek ulang)
- [ ] Rekam video sesuai skrip di atas, upload YouTube publik
- [x] Deploy publik live — Frontend `https://pidi-seven.vercel.app`,
      Backend `https://kepang-ai-api.onrender.com` (terverifikasi
      menampilkan data real)
- [ ] Kumpulkan link LinkedIn/CV 4 anggota tim
- [ ] Copy-paste jawaban dari `docs/SUBMISSION_ANSWERS_3RD.md` ke form,
      sesuaikan bagian `[CEK]`
- [ ] Upload `submission_attachments/P0684 - Kepang AI Lampiran Submission Tahap 3.pdf`
      sebagai File Attachment
- [ ] Submit sebelum deadline

## Update video script — pakai URL live

Untuk bagian demo di video, buka langsung `https://pidi-seven.vercel.app`
di browser (bukan localhost) supaya juri bisa lihat ini benar-benar
ter-deploy, bukan cuma jalan di laptop kamu. Sebutkan di narasi kalau mau:
"aplikasi ini sudah live di internet, bukan cuma prototype lokal."
