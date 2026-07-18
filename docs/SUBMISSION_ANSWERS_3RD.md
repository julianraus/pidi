# Jawaban Submission Tahap 3 - Kepang AI

Draft ini mengikuti struktur "Buku Panduan 3rd Submission Proposal" (PIDI -
Digdaya x Hackathon 2026). Semua section sudah diverifikasi dengan word
counter dan berada di bawah limit guideline (lihat tabel di bagian akhir
dokumen). Bagian bertanda `[CEK]` perlu dikonfirmasi ulang oleh tim sebelum
submit (terutama Team ID dan nama anggota).

---

## TEAM IDENTITY

**TEAM ID**: P0684 `[CEK ulang sesuai akun pendaftaran]`

**TEAM NAME**: J4

**FINAL SOLUTION TITLE**: Kepang AI: Decision Intelligence untuk Resiliensi
Ketahanan Pangan Daerah

**PROBLEM STATEMENT**: Peningkatan Produktivitas, Ketahanan Pangan, dan
Penciptaan Lapangan Kerja

**SUB-PROBLEM STATEMENT**: Digitalisasi Ketahanan Pangan

---

## FINAL TEAM COMPOSITION (maks. 100 kata)

Julian Raus sebagai Ketua Tim dan Product Lead, bertanggung jawab atas arah
produk, validasi masalah, dan strategi implementasi. Wiennetou Joel sebagai
Backend Engineer, berfokus pada API, database, dan integrasi data eksternal
(BI Harga Pangan, BMKG). Jati Kusuma sebagai Frontend Engineer, berfokus pada
dashboard, visualisasi, dan UX institusional. Jonathan Wibowo sebagai
Data/AI Engineer, berfokus pada risk scoring, forecasting, dan logika
rekomendasi. Tidak ada perubahan peran sejak 2nd submission; komposisi ini
menutup kebutuhan end-to-end produk, data, backend, frontend, dan
implementasi. `[CEK nama dan peran final]`


---

## FINAL SOLUTION SUMMARY (maks. 150 kata)

Kepang AI adalah decision intelligence platform untuk memperkuat ketahanan
pangan daerah. Pengguna utamanya adalah TPID, Bapanas, Bulog, BI regional,
dan dinas pangan. Masalah yang diselesaikan adalah policy lag: harga, stok,
cuaca, logistik, dan tekanan rupiah biasanya dianalisis terpisah sehingga
intervensi terlambat. Kepang AI menggabungkan data harga pangan real-time
(BI Harga Pangan), cuaca real-time (BMKG), indeks ENSO (NOAA), serta rilis
resmi makro (BPS/BI) menjadi Resilience Score, scenario planning kurs, dan
rekomendasi aksi dengan data lineage yang jujur — setiap angka diberi label
real-time, official-release, forecast, atau unavailable, tidak ada data
sintetis yang diklaim sebagai data asli. Status saat ini adalah functional
prototype: backend Express + frontend React berjalan end-to-end di atas
PostgreSQL/Supabase, dengan tiga sumber data eksternal terverifikasi hidup.
Manfaat utama: identifikasi wilayah defisit dan prioritas tindakan dalam
hitungan menit, bukan hari.


---

## PROGRESS AND CHANGE LOG (maks. 150 kata)

Sejak 2nd submission, fokus utama adalah menghilangkan ketergantungan pada
data dummy/mock yang sebelumnya dipakai untuk demo. Perubahan konkret:
(1) mengaktifkan BI Harga Pangan scraper real-time — terverifikasi menarik
180 data harga aktual per commodity/region; (2) mengaktifkan BMKG Open Data
untuk 6/6 wilayah pilot (memperbaiki satu kode wilayah adm4 yang ternyata
tidak valid); (3) mengganti asumsi fase ENSO yang sebelumnya di-hardcode
dengan data live dari NOAA Oceanic Nino Index — hasilnya mengoreksi asumsi
lama (weak La Nina) menjadi kondisi aktual (El Nino); (4) memperbaiki bug
data-provenance di mana harga sintetis sempat diberi label sumber resmi
'bps'; (5) memperbaiki logika fallback frontend agar badge "forecast mode"
konsisten muncul saat data asli tidak tersedia. Perubahan didorong oleh audit
kode internal, bukan feedback eksternal.


---

## USE CASE CLARITY & ALIGNMENT WITH USER PROBLEM

### Validated User Problem and Evidence (maks. 250 kata)

Pengguna utama adalah analis dan operator kebijakan pangan daerah — TPID,
dinas pangan, Bapanas, Bulog, dan BI regional. Masalah muncul saat harga,
stok, cuaca, dan tekanan rupiah bergerak bersamaan namun datanya tersebar di
lembaga berbeda tanpa satu ruang kerja yang menghubungkannya menjadi
rekomendasi aksi. Penyebab utamanya adalah fragmentasi data dan lemahnya
transparansi antara data asli, rilis resmi, dan forecast, sehingga keputusan
operasi pasar atau pre-positioning stok sering terlambat. Dampaknya adalah
intervensi yang reaktif, bukan preventif, saat tekanan harga sudah membesar.

Bukti pendukung saat ini bersifat data sekunder resmi: BPS mencatat inflasi
Mei 2026 sebesar 3,08% yoy dengan volatile food 6,24% yoy (cabai merah,
minyak goreng, bawang merah, tomat, beras sebagai pendorong); BI mencatat
USD/IDR Rp17.700 pada 19 Mei 2026, melemah 2,20% ptp; Renstra Bapanas
2025-2029 menegaskan produksi pangan terpusat di Jawa-Sumatera sementara
wilayah lain rawan defisit dan disparitas harga akibat logistik.

Sejak 2nd submission, penajaman pemahaman masalah difokuskan ke sisi teknis:
memverifikasi sumber data mana yang benar-benar dapat diaudit secara
real-time (BI, BMKG, NOAA) versus mana yang masih memerlukan kemitraan
institusional (stok Bapanas/Bulog, biaya logistik). Validasi langsung ke
calon pengguna (wawancara terstruktur TPID/dinas pangan) belum sempat
dilakukan pada tahap ini dan menjadi prioritas validasi berikutnya, bukan
diklaim sebagai sudah tervalidasi.


### End-to-End Use Case and Feature-to-Pain Mapping (maks. 300 kata)

Use case utama: **analis TPID mengidentifikasi wilayah prioritas saat harga
cabai naik cepat.**

Kondisi awal: analis membuka Dashboard dan melihat Resilience Score turun ke
level "siaga" dengan badge Source Confidence yang merinci berapa persen data
di belakangnya real-time vs forecast. Pemicu: alert harga di atas HET pada
komoditas cabai di satu wilayah, dikombinasikan dengan alert cuaca BMKG
(curah hujan di atas normal, dihitung dari deviasi terhadap baseline
bulanan). Tindakan pengguna: analis masuk ke Resilience Room untuk melihat
pressure breakdown — kontribusi harga, cuaca, logistik, dan rupiah terhadap
skor. Input sistem: harga harian dari BI Harga Pangan, forecast cuaca BMKG,
fase ENSO dari NOAA, dan kurs dari rilis BI. Proses sistem: risk scoring
(rainfall deviation, flood/drought index, ENSO multiplier) menghasilkan skor
risiko panen per wilayah-komoditas; resilience model menggabungkan tekanan
harga, cuaca, dan makro menjadi Resilience Score dan action plan berprioritas
dengan owner dan timeframe. Output: decision brief berisi rekomendasi
pre-positioning stok ke wilayah defisit, dengan expected metric terukur.
Tindakan lanjutan: analis membuka Logistics untuk melihat rute dan estimasi
biaya redistribusi. Hasil yang diterima: waktu identifikasi wilayah prioritas
memendek dari menyusun spreadsheet manual lintas sumber menjadi satu cockpit.

Feature-to-pain mapping: Resilience Room (skor + pressure breakdown)
mengatasi fragmentasi data lintas sumber; Data Lineage/Source Confidence
mengatasi ketidakjelasan mana data asli vs estimasi; Weather Risk Engine
mengatasi keterlambatan mendeteksi risiko panen; Logistics Recommendation
mengatasi kesulitan menentukan rute redistribusi; Decision Plan (owner,
timeframe, KPI) mengatasi rekomendasi yang terlalu abstrak untuk
ditindaklanjuti.


### Operational Context, Solution Boundary, and Adoption (maks. 200 kata)

Kepang AI dijalankan sebagai layer analitik di atas data yang sudah ada,
bukan pengganti sistem regulator. Pihak yang terlibat: TPID/pemda/dinas
pangan sebagai pengguna utama pengambil keputusan; Bapanas/Bulog sebagai
pemilik data stok dan pelaksana redistribusi; BMKG/BPS/BI sebagai sumber data
referensi; mitra logistik sebagai pemilik data operasional rute.

Yang **sudah bisa** dilakukan solusi: memantau harga real-time, memantau
cuaca dan risiko panen real-time, menghitung Resilience Score dan skenario
shock rupiah, merekomendasikan prioritas redistribusi berbasis data yang
tersedia. Yang **belum bisa**: mengetahui stok gudang aktual, biaya logistik
aktual per rute, atau kapasitas carrier — bagian ini masih berlabel forecast
atau unavailable secara eksplisit di UI.

Ketergantungan utama: akses API/scraper BI dan BMKG tetap tersedia; kemitraan
data dengan Bapanas/Bulog/mitra logistik untuk data operasional. Hambatan
adopsi terbesar adalah kepercayaan terhadap model dan akses data stok
granular; mitigasinya adalah data lineage eksplisit sehingga setiap
rekomendasi dapat ditelusuri dan divalidasi manual sebelum dieksekusi.


---

## IMPLEMENTATION FEASIBILITY

### Innovation Level (maks. 50 kata)

**Level 3 - Prototype, Validasi, atau Implementasi Awal.** Bukti: functional
prototype end-to-end (frontend + backend + database), source code repository
aktif, tiga integrasi data eksternal real-time terverifikasi (BI Harga
Pangan, BMKG, NOAA ENSO), API dapat diuji langsung. Validasi pengguna
eksternal formal belum dilakukan.


### Current Technical Reality, Data, and Integration (maks. 300 kata)

**Sudah berfungsi (real-time, terverifikasi)**: BI Harga Pangan scraper
(endpoint `GetGridDataDaerah`, teruji menarik data harga aktual per
provinsi, diagregasi ke 6 wilayah); BMKG Open Data untuk forecast cuaca 3
hari per wilayah (6/6 titik adm4 tervalidasi hidup); NOAA Oceanic Nino Index
untuk fase ENSO (feed publik, di-refresh tiap polling cycle, menggantikan
asumsi statis sebelumnya). Rilis resmi BPS/BI untuk makro dan inflasi
digunakan sebagai referensi periodik.

**Masih forecast/simulasi**: Resilience Score, pressure breakdown, dan
skenario shock adalah output model (rule-based, bukan black-box), bukan data
mentah. Supply-demand (produksi, stok) masih berbasis seed database karena
data granular Bapanas/Bulog tidak tersedia secara publik — sudah dicek
langsung, portal data Bapanas mensyaratkan akses aplikasi internal (S.A.P.A),
bukan API terbuka.

**Masih direncanakan**: integrasi produksi BPS (WebAPI tersedia, perlu
registrasi API key gratis), stok riil via kemitraan Bapanas/Bulog, biaya dan
kapasitas logistik via mitra carrier/operator pelabuhan.

Komponen teknis inti: React/Vite frontend, Node.js/Express backend,
PostgreSQL (Supabase), Redis opsional. Setiap dataset disimpan dengan source
label dan timestamp sehingga status data (`real-time`/`official-release`/
`forecast`/`unavailable`) dapat diaudit dari API response, bukan hanya
klaim di UI. Keamanan: API key backend-only (tidak dikirim ke browser),
environment variable divalidasi saat startup, CORS dan rate limiting aktif,
tidak ada data personal yang diproses.


### MVP Execution and Deployment Plan (maks. 250 kata)

Scope MVP saat ini: 6 wilayah agregasi, 8 komoditas strategis, 7 modul
(Dashboard, Resilience Room, Supply-Demand, Food Inflation, Smart Logistics,
Weather Risk, AI Forecasting). Fitur prioritas yang sudah selesai: data
lineage eksplisit, integrasi harga dan cuaca real-time, risk scoring
transparan, rekomendasi rute dengan Google Routes API opsional. Fitur yang
belum dimasukkan: role-based access, notifikasi push, export decision brief
ke PDF, dan integrasi stok/logistik mitra.

Milestone berikutnya: (1) 0-2 minggu - registrasi BPS API key untuk data
produksi, deploy publik yang stabil (Render backend + Vercel frontend sesuai
`docs/DEPLOYMENT.md`), PIC: Backend Engineer; (2) 2-6 minggu - validasi
lapangan dengan 5-10 wawancara TPID/dinas pangan, PIC: Product Lead;
(3) 1-3 bulan - eksplorasi kemitraan data Bapanas/Bulog untuk stok riil,
PIC: Product Lead + Data Engineer.

Risiko utama: (1) teknis - ketergantungan pada stabilitas endpoint BI/BMKG
yang tidak resmi didokumentasikan sebagai API publik, mitigasi dengan
fallback berlabel forecast, bukan data palsu; (2) operasional - hosting
database (Supabase) sempat mengalami gangguan koneksi selama pengembangan,
mitigasi dengan monitoring health-check dan rencana migrasi provider jika
berulang; (3) legal/kemitraan - data stok dan logistik institusional
memerlukan perjanjian berbagi data yang belum ada, mitigasi dengan tetap
menandai data tersebut unavailable hingga kemitraan resmi terbentuk.


---

## ALGORITHM QUALITY & USER EXPERIENCE

### Algorithm or Rule Quality and Decision Transparency (maks. 300 kata)

Kepang AI memakai sistem rule-based dan scoring transparan, bukan model
black-box, sehingga setiap output dapat ditelusuri ke input dan formula
penyusunnya.

**Weather Risk Scoring**: input berupa deviasi curah hujan forecast terhadap
baseline bulanan historis, curah hujan maksimum harian, dan fase ENSO
(NOAA). Skor 0-100 dihitung dari bobot tetap: deviasi curah hujan 40%,
indeks banjir 30%, indeks kekeringan 20%, multiplier ENSO 10%. Level risiko
(normal/medium/high/critical) mengikuti threshold skor. Estimasi kehilangan
panen memakai kurva linear terhadap skor risiko di atas ambang 30.

**Resilience Score**: menggabungkan tekanan harga (persentase di atas HET),
tekanan cuaca (risk score wilayah tertinggi), dan tekanan makro (perubahan
USD/IDR dan volatile food yoy) menjadi satu skor keputusan, dengan decision
plan berprioritas yang memuat owner, timeframe, dan expected metric per
tindakan.

**Route Recommendation**: algoritma greedy yang meranking rute berdasarkan
efisiensi biaya dan waktu; ETA/jarak jalan real-time dari Google Routes API
saat key tersedia, sisanya (biaya, kapasitas) tetap berlabel forecast dari
tabel rute karena belum ada feed carrier.

Alasan pemilihan pendekatan rule-based: pada domain kebijakan publik,
keterlusuran (traceability) lebih penting daripada akurasi marjinal dari
model machine learning yang sulit dijelaskan ke pengambil kebijakan.
Keterbatasan: formula bobot (40/30/20/10, dst) adalah asumsi awal berdasarkan
literatur risiko panen, belum dikalibrasi dengan data historis kejadian
gagal panen aktual — kalibrasi ini menjadi bagian dari roadmap validasi.

Operator dapat menelusuri setiap hasil karena API mengembalikan komponen
penyusun skor (bukan hanya angka akhir), serta status sumber data
(`real-time`/`forecast`/`unavailable`) per dataset, sehingga koreksi manual
dapat dilakukan sebelum rekomendasi dieksekusi.


---

## COMPLEXITY

### Problem and System Complexity (maks. 200 kata)

Kompleksitas berasal dari kebutuhan menyatukan lima sumber data dengan
karakteristik berbeda: harga (harian, per komoditas-wilayah), cuaca
(forecast 3 hari, per titik geografis), makro (bulanan, nasional), stok
(belum tersedia publik), dan logistik (rute, biaya, kapasitas). Setiap
sumber punya format, frekuensi update, dan tingkat keandalan berbeda,
sehingga sistem harus punya lapisan normalisasi dan pelabelan status data
per dataset, bukan asumsi bahwa semua data setara kualitasnya.

Variabel yang saling memengaruhi: kenaikan curah hujan memengaruhi risk
score panen, yang memengaruhi proyeksi produksi, yang memengaruhi neraca
supply-demand wilayah, yang memengaruhi kebutuhan redistribusi via rute
logistik — sementara secara paralel pelemahan rupiah memengaruhi biaya
impor dan energi yang menekan biaya distribusi. Pendekatan manual
(spreadsheet per sumber data) tidak memadai karena hubungan antar-variabel
ini sulit dilihat tanpa satu model yang menghitungnya bersamaan secara
konsisten dan berulang.

Pendekatan yang dipilih adalah modular: setiap sumber data punya service
terpisah, dengan satu lapisan scoring yang mengonsumsi output ternormalisasi
dari masing-masing, bukan satu pipeline monolitik.


### Processing Pipeline and Engineering Depth (maks. 250 kata)

Alur: pengumpulan data (scraper BI, API BMKG, feed NOAA, input manual rilis
BPS/BI) → normalisasi (parsing tanggal/harga/format wilayah ke skema
internal, pelabelan source dan timestamp) → penyimpanan (PostgreSQL dengan
kolom source per baris, bukan tabel terpisah per sumber) → scoring (risk
scoring cuaca, resilience scoring gabungan, route ranking) → validasi
(perbandingan terhadap baseline historis untuk deteksi anomali dasar) →
output (API JSON dengan komponen skor dan status data) → frontend
(dashboard dengan badge forecast/offline mode saat data asli tidak
tersedia).

Aspek rekayasa yang relevan: modularitas (setiap sumber data adalah service
terpisah - `biPriceService`, `bmkgService`, `googleRoutesService` - sehingga
kegagalan satu sumber tidak menjatuhkan yang lain); reliability (fallback
eksplisit berlabel forecast, bukan silent failure atau data palsu; validasi
environment variable saat startup untuk mendeteksi konfigurasi salah lebih
awal daripada gagal diam-diam saat query pertama); caching opsional (Redis)
untuk endpoint yang sering diakses; rate limiting dan CORS untuk keamanan
API publik.

Keterbatasan rekayasa saat ini: belum ada scheduler monitoring terpusat
untuk status kesehatan tiap sumber data, insert database masih per-baris
(bukan batch) sehingga belum optimal untuk skala besar, dan belum ada test
suite otomatis untuk regresi logika scoring.


### User Flow, Usability Testing, and Product Iteration (maks. 250 kata)

Alur pengguna: analis membuka Dashboard untuk gambaran nasional cepat →
memeriksa Source Confidence untuk menilai keandalan data yang ditampilkan →
masuk ke Resilience Room untuk pressure breakdown dan skenario shock →
memeriksa Weather Risk untuk wilayah dengan risiko tertinggi → membuka
Logistics untuk opsi redistribusi → mencatat action plan dengan owner dan
timeframe sebagai tugas tindak lanjut.

Pengujian yang telah dilakukan pada tahap ini bersifat teknis internal,
bukan usability testing formal dengan pengguna eksternal: verifikasi
endpoint API (health check, resilience, logistics recommendations),
verifikasi build frontend, dan verifikasi langsung terhadap scraper/API
eksternal (BI, BMKG, NOAA) untuk memastikan data yang ditampilkan benar-benar
dapat ditarik secara live, bukan hanya asumsi bahwa integrasi bekerja.
Verifikasi ini menemukan dan memperbaiki dua bug nyata: kode wilayah BMKG
yang tidak valid untuk satu wilayah, dan label sumber data yang salah pada
jalur fallback harga.

Usability testing dengan pengguna eksternal (TPID/dinas pangan) **belum
dilakukan** dan menjadi keterbatasan yang diakui secara terbuka pada tahap
ini, bukan diklaim sebagai sudah tervalidasi. Mekanisme pencegahan kesalahan
yang sudah ada: badge "Forecast/offline mode" yang konsisten muncul di
seluruh field data setiap kali sistem menggunakan fallback, sehingga
pengguna tidak salah mengira data forecast sebagai data real-time.


---

## BUSINESS PLAN & ROI

### Quantified Value, Business Model, and ROI (maks. 300 kata)

Model pendapatan: B2G/institutional SaaS dengan lima aliran - (1) lisensi
tahunan dashboard untuk pemda/TPID/Bapanas/Bulog/BI regional berdasarkan
jumlah wilayah, pengguna, dan modul aktif; (2) implementation fee untuk
setup, integrasi data, dan training; (3) managed analytics report bulanan;
(4) API subscription untuk risk score dan route intelligence bagi institusi,
mitra logistik, dan asuransi pertanian; (5) logistics add-on untuk optimasi
rute dan backhaul bagi carrier/warehouse partner.

Yang memperoleh manfaat: TPID/pemda (identifikasi wilayah prioritas lebih
cepat), Bapanas/Bulog (rekomendasi redistribusi berbasis data), BI regional
(evidence koordinasi inflasi pangan), mitra logistik (prioritas rute).
Yang membayar: institusi pilot melalui lisensi dan implementation fee pada
tahap awal; ekspansi ke API subscription dan logistics add-on setelah pilot
tervalidasi.

Asumsi break-even awal (berdasarkan model bisnis internal, bukan hasil
negosiasi klien aktual): sekitar 6 klien lisensi standar aktif dengan
kontribusi recurring revenue rata-rata Rp192 juta per klien per tahun sudah
menutup biaya operasional dasar (cloud, data integration, support). Biaya
utama: pengembangan produk, hosting cloud/database, biaya API pihak ketiga
(Google Routes bila dipakai), keamanan, dan customer success.

Nilai terukur yang ditargetkan: penurunan waktu identifikasi wilayah
prioritas minimal 50% dibanding proses manual lintas spreadsheet, potensi
efisiensi biaya logistik 5-10% setelah data rute mitra tervalidasi, dan
penurunan simulated supply gap minimal 30% pada skenario redistribusi.
Angka-angka ini adalah target simulasi MVP, bukan hasil implementasi
lapangan, dan akan divalidasi lebih lanjut saat pilot berjalan.


---

## TEAM READINESS FOR STARTUP

### Team Capability and Execution Ownership (maks. 250 kata)

Pembagian peran: Julian Raus (Product/Ketua) memimpin arah produk, validasi
masalah, dan keputusan prioritas fitur; Wiennetou Joel (Backend/Technology)
membangun API, skema database, dan seluruh integrasi data eksternal
(BI Harga Pangan, BMKG, NOAA, Google Routes); Jati Kusuma (Frontend/UX)
membangun dashboard, visualisasi data lineage, dan pengalaman pengguna
institusional; Jonathan Wibowo (Data/AI) membangun logika risk scoring,
resilience model, dan forecasting.

Hasil kerja nyata yang dapat diverifikasi: repository kode aktif dengan
tujuh modul frontend dan lima service backend berjalan, tiga integrasi data
eksternal real-time terverifikasi (bukan klaim, sudah diuji langsung
menghasilkan data live), serta dokumentasi kebijakan data (data lineage
policy) yang konsisten diterapkan di seluruh endpoint.

Cara tim mengambil keputusan: perubahan arah produk dan prioritas fitur
diputuskan oleh Product Lead berdasarkan kesesuaian dengan kriteria
guidebook dan kesiapan data; keputusan teknis (arsitektur, pilihan library,
strategi fallback data) diputuskan oleh Backend/Data Engineer dengan prinsip
"tidak ada data palsu diklaim sebagai data asli". Untuk milestone
berikutnya (registrasi BPS API key, deploy publik stabil, validasi
lapangan), owner masing-masing adalah Backend Engineer untuk sisi teknis dan
Product Lead untuk sisi validasi pengguna.

`[CEK: sesuaikan dengan pembagian kerja aktual tim per hari ini]`


### Continuation Readiness (maks. 200 kata)

Target 6-12 bulan berikutnya: (1) 0-2 bulan - menutup integrasi data
produksi BPS, deploy publik stabil, mulai validasi lapangan dengan
5-10 institusi target; (2) 2-6 bulan - membangun kemitraan data awal dengan
minimal satu dinas pangan/TPID untuk pilot terbatas, mengkalibrasi bobot
risk scoring dengan data historis kejadian gagal panen; (3) 6-12 bulan -
memperluas cakupan wilayah dari 6 wilayah agregasi menuju granularitas
provinsi, serta mengeksplorasi kemitraan data stok dengan Bapanas/Bulog.

Komitmen tim: seluruh anggota melanjutkan pengembangan di luar hackathon
dengan pembagian waktu paruh-waktu yang disesuaikan progres pilot.
Kompetensi tambahan yang masih dibutuhkan: kontak institusional untuk
membuka akses data Bapanas/Bulog (S.A.P.A), serta kemampuan business
development untuk closing pilot pertama - tim berencana mencari advisor atau
mitra dari jaringan hackathon dan program inkubasi PIDI untuk menutup gap
ini. `[CEK: sesuaikan dengan rencana konkret tim per hari ini]`


### Adoption, Growth Strategy, and Competitive Moat (maks. 250 kata)

Strategi memperoleh pengguna pertama: mendekati TPID/dinas pangan di daerah
dengan volatile food tinggi atau disparitas harga besar melalui jaringan
program pengendalian inflasi daerah, menawarkan demo dashboard dan evidence
pack sebagai pembuka diskusi, bukan hard-selling lisensi di awal. Channel
utama: forum TPID, jaringan Bapanas/BI regional, dan program inkubasi PIDI.

Tahapan pengembangan produk: mulai dari pilot 1-3 institusi dengan data
publik (harga, cuaca) yang sudah real-time, kemudian menambah data
operasional (stok, logistik) seiring kemitraan terbentuk, lalu ekspansi
wilayah dari 6 wilayah agregasi ke tingkat provinsi dan kabupaten/kota.

Faktor pembeda: (1) data lineage eksplisit sebagai bagian dari model
keputusan, bukan sekadar disclaimer - hampir tidak ada dashboard pangan
publik yang secara aktif membedakan data real-time, official-release,
forecast, dan unavailable pada level output, bukan hanya sumber; (2)
pendekatan scenario-based saat rupiah melemah, menghubungkan imported
inflation ke komoditas rentan dan mitigasi, bukan sekadar menampilkan angka
harga naik; (3) arsitektur modular yang membuat setiap sumber data baru
dapat ditambah tanpa mengubah keseluruhan sistem, mempercepat replikasi ke
wilayah baru.

Ini menyulitkan peniruan cepat karena kombinasi kejujuran data, model
keputusan, dan modularitas teknis butuh disiplin implementasi berkelanjutan,
bukan hanya fitur permukaan. Bukti ketertarikan pihak eksternal belum ada
pada tahap ini.


---

## ATTACHMENT

**VIDEO SUBMISSION**: `[ISI LINK YOUTUBE - unlisted/public, wajib publik]`

**FILE ATTACHMENT (PDF)**: satu PDF berisi ringkasan problem-solution,
screenshot Dashboard/Resilience Room/Logistics, diagram arsitektur (lihat
`docs/SUBMISSION_SUPPORTING_EVIDENCE.md`), data source matrix dengan status
terbaru, dan test evidence (scraper BI 180 record real, BMKG 6/6 wilayah,
NOAA ENSO live).

**LINK ATTACHMENT** (1 link, harus dapat diakses publik tanpa izin
tambahan): `[ISI - pilih salah satu: deploy publik (Render/Vercel per
docs/DEPLOYMENT.md) ATAU repository GitHub publik. Deploy publik lebih kuat
kalau sempat distabilkan sebelum deadline]`

**CV ATTACHMENT**: `[ISI link LinkedIn/CV Google Drive tiap anggota - Julian
Raus, Wiennetou Joel, Jati Kusuma, Jonathan Wibowo]`

---

## Catatan Pengisian

- Bagian `[CEK]` wajib diisi/diverifikasi tim sebelum submit - terutama Team
  ID, dan link attachment.
- Nada jawaban sengaja konsisten "jujur tentang keterbatasan" (evidence of
  demand belum ada wawancara langsung, usability testing belum formal)
  karena guideline eksplisit melarang melebih-lebihkan status/kesiapan/hasil
  solusi. Ini risiko yang disadari tim dan diterima pada submission ini.

## Verifikasi Jumlah Kata (dihitung program, bukan estimasi manual)

| Section | Kata | Limit |
|---|---:|---:|
| Final Team Composition | 79 | 100 |
| Final Solution Summary | 131 | 150 |
| Progress and Change Log | 120 | 150 |
| Validated User Problem and Evidence | 200 | 250 |
| End-to-End Use Case and Feature-to-Pain Mapping | 236 | 300 |
| Operational Context, Solution Boundary, and Adoption | 145 | 200 |
| Innovation Level | 43 | 50 |
| Current Technical Reality, Data, and Integration | 195 | 300 |
| MVP Execution and Deployment Plan | 195 | 250 |
| Algorithm or Rule Quality and Decision Transparency | 241 | 300 |
| Problem and System Complexity | 154 | 200 |
| Processing Pipeline and Engineering Depth | 185 | 250 |
| User Flow, Usability Testing, and Product Iteration | 192 | 250 |
| Quantified Value, Business Model, and ROI | 219 | 300 |
| Team Capability and Execution Ownership | 173 | 250 |
| Continuation Readiness | 127 | 200 |
| Adoption, Growth Strategy, and Competitive Moat | 192 | 250 |

Semua section di bawah limit. Kalau tim menambahkan detail saat memoles
jawaban, hitung ulang dengan `python3 -c "print(len(open('section.txt').read().split()))"`
atau tools sejenis sebelum submit.
