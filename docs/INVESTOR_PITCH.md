# Kepang AI — Investor Pitch

> Positioning satu kalimat: **Kepang AI adalah decision intelligence platform yang menganyam data harga, cuaca, pasokan, dan logistik menjadi satu rekomendasi keputusan ketahanan pangan — dari monitoring menjadi aksi dalam hitungan menit, bukan minggu.**

Live demo: https://pidi-seven.vercel.app (frontend) - https://kepang-ai-api.onrender.com/api/health (backend)

---

## 1. Hook (30 detik pertama)

> "Juni 2026: inflasi pangan bergejolak (volatile food) 5,58% YoY — hampir dua kali inflasi umum yang 3,34%. Rupiah di Rp17.944 per dolar menekan harga impor pangan. BI sudah menaikkan suku bunga ke 5,75%. Dan NOAA mengonfirmasi kita sedang dalam fase El Niño.
>
> Empat sinyal krisis itu tersebar di empat institusi berbeda — BPS, BI, BMKG, NOAA. Hari ini, pengambil keputusan pangan daerah harus membuka empat dashboard, menyalin ke Excel, dan rapat dulu sebelum bertindak. Itu namanya *policy lag* — dan setiap minggu keterlambatan dibayar rakyat lewat harga cabai dan beras.
>
> Kepang AI menganyam keempat untai data itu menjadi satu keputusan."

Semua angka di atas real, terverifikasi, dan tampil live di aplikasi (BPS rilis Juni 2026, JISDOR 17 Juli 2026, RDG BI Juni 2026, NOAA ONI).

## 2. Problem

1. **Data pangan terfragmentasi.** Harga di BI/Bapanas, produksi di BPS, cuaca di BMKG, logistik tersebar. Tidak ada satu tempat yang menggabungkannya *dengan konteks keputusan*.
2. **Policy lag mahal.** Intervensi (operasi pasar, pre-positioning stok Bulog, subsidi angkut) sering datang setelah harga sudah meledak, karena sinyalnya telat dirangkai.
3. **Dashboard yang ada berhenti di monitoring.** Menampilkan angka ≠ mengatakan *apa yang harus dilakukan, oleh siapa, dalam berapa hari, dengan KPI apa*.

## 3. Solution — apa yang membedakan

| Fitur | Yang lain | Kepang AI |
|---|---|---|
| Data harga, cuaca, produksi | Terpisah per instansi | Dianyam dalam satu cockpit (BI, BMKG, BPS, NOAA — live) |
| Output | Grafik monitoring | **Decision brief**: aksi, owner, timeframe, KPI |
| Kejujuran data | Tidak jelas mana data asli | **Data lineage** per dataset: real-time / official-release / forecast / unavailable + skor *data confidence* |
| Risiko iklim | Cuaca harian | ENSO phase (El Niño/La Niña) NOAA → skor risiko panen per wilayah |
| Margin petani | Jarang ada | Harga produsen vs konsumen (BI price_type produsen) → deteksi siapa yang menikmati kenaikan harga |

**Data lineage adalah fitur kepercayaan** — di pasar B2G, kepercayaan adalah mata uangnya. Pemerintah tidak akan mengambil keputusan dari black box.

## 4. Why now

- **APBN 2026 mengalokasikan Rp210,4 triliun untuk ketahanan pangan** — naik dari Rp144,6 T di 2025. Ketahanan pangan adalah prioritas politik tertinggi pemerintahan saat ini. ([CNBC Indonesia](https://www.cnbcindonesia.com/news/20251209180158-4-692641/anggaran-ketahanan-pangan-naik-jadi-rp-2104-t-di-2026-ini-alasannya), [Badan Pangan Nasional](https://badanpangan.go.id/blog/post/anggaran-ketahanan-pangan-2026-konsistensi-pemerintah-jalankan-program-sphp))
- Bahkan 0,1% dari anggaran itu yang dialihkan ke *decision infrastructure* = pasar Rp210 miliar/tahun.
- El Niño aktif + rupiah lemah = tekanan pangan 2026–2027 nyata dan sedang terjadi.
- API publik pemerintah (BPS WebAPI, BMKG Open Data) baru dalam beberapa tahun terakhir cukup matang untuk produk seperti ini — *timing teknis baru terbuka*.

## 5. Market (asumsi dilabeli jelas)

- **TAM (fakta struktur):** 38 provinsi + 514 kabupaten/kota — setiap daerah punya TPID (Tim Pengendalian Inflasi Daerah) yang wajib rapat dan melapor rutin. Ditambah Bapanas, Bulog, Kementan, BI regional.
- **SAM (asumsi):** ~150 daerah dengan kapasitas fiskal & urgensi tinggi (provinsi + kota besar + daerah defisit pangan). Dengan asumsi lisensi Rp150–300 juta/tahun per instansi → **Rp22–45 miliar ARR potensial** dari B2G saja.
- **SOM 24 bulan (asumsi konservatif):** 5–10 pemda pilot berbayar → Rp1–3 miliar ARR.
- **Ekspansi B2B (opsional, margin lebih tinggi):** agribisnis & FMCG (perencanaan procurement), asuransi parametrik pertanian (skor risiko panen), bank/pembiayaan agri (early warning kredit macet petani). Data risiko panen per wilayah adalah input langsung untuk pricing mereka.

> Catatan kejujuran: angka SAM/SOM adalah asumsi perencanaan, belum divalidasi kontrak. Yang sudah nyata: produk live dengan data pemerintah asli.

## 6. Business model

1. **SaaS B2G** — lisensi tahunan per instansi (tier: kabupaten/kota, provinsi, nasional). Termasuk pelatihan & dukungan rapat TPID.
2. **API & data licensing B2B** — skor risiko panen, indeks tekanan harga, margin produsen-konsumen sebagai feed untuk asuransi, bank, trader komoditas.
3. **Analytics-as-a-service** — laporan kesiapan pangan kustom (mis. jelang Ramadan/Nataru, saat episode El Niño).

Struktur biaya ringan: sumber data utama adalah API publik (BPS, BMKG, NOAA — gratis; BI Harga Pangan publik). Biaya utama = tim + infra cloud → **gross margin software klasik 80%+ (asumsi)**.

## 7. Traction & bukti eksekusi (semua bisa dicek live)

- **Produk live & publik**, bukan mockup: frontend Vercel + backend Render + Supabase.
- **4 integrasi data pemerintah/ilmiah berjalan otomatis**: BI Harga Pangan (harga konsumen & produsen, 38 provinsi → 6 wilayah), BMKG (prakiraan 12 titik terverifikasi, 2 per wilayah), BPS (produksi beras bulanan via WebAPI resmi), NOAA (fase ENSO).
- **Engine keputusan**: resilience score, decision plan berprioritas dengan owner/timeframe/KPI, provenance per dataset.
- **Disiplin data**: sistem menolak memalsukan data — dataset yang belum ada diberi label `unavailable`, bukan diisi angka fiktif. Ini dibangun sebagai prinsip arsitektur, bukan tambalan.
- Dibangun oleh tim kecil dalam waktu hackathon — bukti kecepatan eksekusi.

## 8. Moat

1. **Anyaman data + provenance** — pesaing bisa menyalin UI, tapi pipeline multi-sumber dengan lineage yang diaudit adalah kerja infrastruktur yang membosankan dan mahal untuk ditiru.
2. **Workflow fit B2G** — decision brief dirancang mengikuti cara kerja TPID/dinas pangan (owner, timeframe, KPI = format rapat mereka). Switching cost naik begitu masuk rutinitas rapat.
3. **Data historis terakumulasi** — semakin lama berjalan, semakin kaya time-series lintas sumber yang tidak bisa dibeli di tempat lain.
4. **Trust positioning** — di pasar pemerintah, reputasi "tidak pernah mengarang angka" adalah moat yang sesungguhnya.

## 9. Competition

- **Panel Harga Bapanas / PIHPS BI**: monitoring harga saja, tanpa rekomendasi, tanpa cuaca/logistik. Kami *melengkapi*, bukan melawan — mereka justru sumber data kami.
- **Konsultan/BI tools (Tableau dsb.)**: mahal, statis, butuh analis khusus. Kepang AI adalah produk jadi dengan bahasa keputusan.
- **Startup agritech (harga/marketplace)**: fokus transaksi petani, bukan decision intelligence pemerintah. Ruang B2G decision layer masih kosong.

## 10. Ask & use of funds (template — sesuaikan)

- **Ask (contoh): Rp2–3 miliar seed** untuk 18 bulan runway.
- Alokasi: 50% tim (2 engineer + 1 govrel/BD), 20% pilot berbayar 3–5 pemda (validasi harga & workflow), 15% infra & keamanan (ISO 27001 path, on-prem option), 15% operasional.
- **Milestone 18 bulan:** 5 pemda pilot berbayar, 1 kontrak B2B data feed, cakupan komoditas 6 → 12, cakupan wilayah 6 agregat → 38 provinsi.

## 11. Antisipasi pertanyaan investor

| Pertanyaan | Jawaban |
|---|---|
| "Pemerintah kan bisa bikin sendiri?" | Bisa, tapi sejarah menunjukkan e-gov procurement lebih cepat membeli daripada membangun; kami juga siap skema whitelabel/karya bersama. Moat kami kecepatan iterasi + data historis. |
| "Sales cycle B2G lama?" | Benar (6–18 bulan). Mitigasi: mulai dari APBD perubahan & dana dekonsentrasi yang lebih lincah, jalur BUMN (Bulog/ID FOOD), dan revenue B2B paralel yang cycle-nya pendek. |
| "Datanya kan publik, apa nilainya?" | Nilai bukan di data mentah tapi di anyaman + konteks keputusan + lineage. Bloomberg juga "hanya" mengemas data publik. |
| "Akurasinya?" | Kami tidak menjual ramalan sempurna; kami menjual *time-to-insight* yang turun drastis dan transparansi sumber. Setiap angka bisa diklik balik ke sumbernya. |
| "Kenapa tim ini?" | Produk live dalam hitungan minggu, integrasi 4 sumber data pemerintah yang terkenal rewel (WAF BPS, endpoint BI tak terdokumentasi) — bukti kemampuan eksekusi teknis di domain yang sulit. |

---

## Struktur slide (10 slide, 5 menit)

1. **Judul + satu kalimat positioning** (logo anyaman)
2. **Hook 4 sinyal krisis** (5,58% - Rp17.944 - 5,75% - El Niño)
3. **Problem: policy lag** (ilustrasi 4 dashboard → Excel → rapat → telat)
4. **Solusi: demo screenshot hero cockpit** (decision brief + score ring)
5. **Why now: Rp210,4 T + El Niño + API pemerintah matang**
6. **Market: TAM/SAM/SOM** (label asumsi)
7. **Business model: 3 aliran revenue**
8. **Traction: 4 integrasi live + disiplin no-fake-data**
9. **Moat & kompetisi**
10. **Ask + milestone + tim**

Sumber angka: [BPS Inflasi Juni 2026], [JISDOR BI 17 Jul 2026], [RDG BI Jun 2026], [NOAA ONI], [CNBC Indonesia — APBN 2026](https://www.cnbcindonesia.com/news/20251209180158-4-692641/anggaran-ketahanan-pangan-naik-jadi-rp-2104-t-di-2026-ini-alasannya), [Badan Pangan Nasional](https://badanpangan.go.id/blog/post/anggaran-ketahanan-pangan-2026-konsistensi-pemerintah-jalankan-program-sphp). Detail sitasi lengkap ada di `docs/DATA_SOURCES_AND_FORECASTING.md` dan halaman Market & Evidence di aplikasi.
