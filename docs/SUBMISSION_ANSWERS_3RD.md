# Jawaban Submission Tahap 3 - Kepang AI

Draft ini mengikuti struktur form 3rd Submission Proposal (PIDI - Digdaya x
Hackathon 2026) dan Buku Panduan resmi (22 halaman). Semua section sudah
diverifikasi dengan word counter dan berada di bawah limit (lihat tabel di
akhir). Bagian bertanda `[CEK]` wajib dikonfirmasi tim sebelum submit
(terutama Team ID, nama anggota, link CV, dan link video).

Prinsip pengisian: guideline eksplisit melarang klaim tanpa bukti dan melarang
melebih-lebihkan status. Nada jawaban sengaja jujur tentang keterbatasan
(belum ada usability testing formal; wawancara pengguna baru dijadwalkan).

---

## TEAM IDENTITY

**TEAM ID**: P0684 `[CEK terhadap akun resmi pidi.id sebelum submit]`

**TEAM NAME**: J4 `[CEK - samakan dengan submission ke-2]`

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
(BI Harga Pangan, BMKG, BPS, NOAA). Jati Kusuma sebagai Frontend Engineer,
berfokus pada dashboard, visualisasi peta nasional, dan UX institusional.
Jonathan Wibowo sebagai Data/AI Engineer, berfokus pada risk scoring,
forecasting, dan logika rekomendasi. Tidak ada perubahan peran sejak 2nd
submission; komposisi ini menutup kebutuhan end-to-end produk, data, backend,
frontend, dan implementasi. `[CEK nama dan peran final]`

---

## FINAL SOLUTION SUMMARY (maks. 150 kata)

Kepang AI adalah decision intelligence platform untuk memperkuat ketahanan
pangan daerah. Pengguna utamanya TPID, Bapanas, Bulog, BI regional, dan dinas
pangan. Masalah yang diselesaikan adalah policy lag: harga, stok, cuaca,
logistik, dan tekanan rupiah dianalisis terpisah sehingga intervensi
terlambat. Kepang AI menganyam harga pangan (BI Harga Pangan, level konsumen
dan produsen), cuaca (BMKG), fase ENSO (NOAA), dan rilis makro resmi (BPS/BI)
menjadi Resilience Score, simulator skenario shock, peta status nasional 34
provinsi, dan rekomendasi aksi berprioritas. Setiap angka diberi label data
lineage yang jujur — real-time, official-release, forecast, atau unavailable —
tanpa data sintetis yang diklaim asli. Status saat ini functional prototype
yang sudah live publik: backend Express + frontend React di atas
PostgreSQL/Supabase, empat sumber data eksternal terverifikasi hidup. Manfaat
utama: identifikasi wilayah prioritas dan rencana tindakan dalam hitungan
menit, bukan hari.

---

## PROGRESS AND CHANGE LOG (maks. 150 kata)

Sejak 2nd submission, tiga perubahan besar. Pertama, menghapus data dummy:
mengaktifkan scraper BI Harga Pangan (harga konsumen dan produsen),
BMKG (6/6 wilayah, satu kode adm4 tidak valid diperbaiki), dan mengganti fase
ENSO hardcoded dengan data live NOAA — mengoreksi asumsi lama (La Nina)
menjadi kondisi aktual (El Nino). Kedua, memperluas cakupan dari 6 wilayah
agregasi ke peta nasional 34 provinsi, dengan lapisan harga beras per provinsi
live dari BI (deviasi terhadap median nasional) — sudah ter-deploy. Ketiga,
mendesain ulang seluruh antarmuka ke sistem desain institusional (blueprint,
role switcher TPID/Bulog/BI/Logistik, simulator skenario, panel Source Health,
export decision brief). Perbaikan bug penting: harga sintetis sempat berlabel
sumber resmi 'bps', kini dilabeli benar. Perubahan didorong audit kode
internal dan rencana validasi pengguna, bukan feedback lapangan.

---

## USE CASE CLARITY & ALIGNMENT WITH USER PROBLEM

### Validated User Problem and Evidence (maks. 250 kata)

Pengguna utama adalah analis dan operator kebijakan pangan daerah — TPID,
dinas pangan, Bapanas, Bulog, dan BI regional. Masalah muncul saat harga,
stok, cuaca, dan tekanan rupiah bergerak bersamaan namun datanya tersebar di
lembaga berbeda tanpa satu ruang kerja yang menghubungkannya menjadi
rekomendasi aksi. Penyebab utamanya fragmentasi data dan lemahnya transparansi
antara data asli, rilis resmi, dan forecast, sehingga keputusan operasi pasar
atau pre-positioning stok sering terlambat. Dampaknya intervensi reaktif,
bukan preventif, saat tekanan harga sudah membesar.

Bukti pendukung saat ini data sekunder resmi, dipantau mendekati submission:
BPS mencatat inflasi Juni 2026 naik menjadi 3,34% yoy (dari 3,08% Mei), dengan
volatile food tetap tinggi 5,58% yoy (cabai merah, bawang merah, bawang putih,
beras sebagai pendorong); BI menaikkan BI-Rate tiga kali berturut sejak Mei
2026 menjadi 5,75% untuk menahan pelemahan rupiah, kurs JISDOR Rp17.944 pada
17 Juli 2026; Renstra Bapanas 2025-2029 menegaskan produksi terpusat di
Jawa-Sumatera sementara wilayah lain rawan defisit dan disparitas harga akibat
logistik. Data harga BI per provinsi kami sendiri menunjukkan disparitas nyata:
beras di Papua dan Kalimantan 20-23% di atas median nasional, sementara lumbung
padi (NTB, DIY, Sulsel) di bawah median.

Sejak 2nd submission, pemahaman masalah dipertajam pada sisi teknis
(memverifikasi sumber mana yang benar-benar dapat diaudit real-time).
Validasi langsung ke pengguna baru dijadwalkan — wawancara terstruktur dengan
BI yang menangani pangan sedang disiapkan — dan belum diklaim tervalidasi.

### End-to-End Use Case and Feature-to-Pain Mapping (maks. 300 kata)

Use case utama: **analis TPID mengidentifikasi wilayah prioritas saat harga
beras/cabai naik cepat.**

Kondisi awal: analis membuka Cockpit, memilih peran (TPID/Bulog/BI/Logistik)
sehingga decision brief dan daftar aksi menyesuaikan tanggung jawabnya. Ia
melihat Resilience Score dan badge Data Confidence yang merinci berapa persen
data di belakangnya real-time vs forecast. Pemicu: harga di atas HET pada satu
komoditas-wilayah, dikombinasikan alert cuaca BMKG (curah hujan di atas
normal terhadap baseline bulanan). Tindakan pengguna: analis membuka peta
status nasional 34 provinsi untuk melihat provinsi mana yang harga berasnya di
atas median nasional, lalu masuk Resilience Room untuk pressure breakdown
(kontribusi harga, cuaca, logistik, rupiah). Input sistem: harga harian BI
(konsumen dan produsen), forecast BMKG, fase ENSO NOAA, kurs rilis BI, produksi
BPS. Proses sistem: risk scoring cuaca (deviasi hujan, indeks banjir/kekeringan,
multiplier ENSO) menghasilkan skor risiko panen; resilience model menggabungkan
tekanan harga, cuaca, dan makro menjadi Resilience Score dan action plan
berprioritas dengan owner, timeframe, dan KPI. Output: decision brief
rekomendasi pre-positioning stok ke wilayah defisit, dapat diekspor ke PDF.
Tindakan lanjutan: analis menjalankan Simulator Shock (rupiah/logistik/panen)
untuk menguji dampak skenario terhadap skor sebelum memutuskan, lalu membuka
Logistics untuk opsi rute redistribusi.

Feature-to-pain mapping: Peta 34 provinsi + Resilience Room mengatasi
fragmentasi data lintas sumber dan lintas wilayah; Data Lineage/Source Health
mengatasi ketidakjelasan data asli vs estimasi; Weather Risk Engine mengatasi
keterlambatan deteksi risiko panen; Simulator Shock mengatasi ketidakmampuan
menguji skenario sebelum bertindak; Role switcher mengatasi brief yang tidak
relevan dengan peran; Decision Plan (owner, timeframe, KPI) mengatasi
rekomendasi yang terlalu abstrak untuk ditindaklanjuti.

### Operational Context, Solution Boundary, and Adoption (maks. 200 kata)

Kepang AI dijalankan sebagai layer analitik di atas data yang sudah ada, bukan
pengganti sistem regulator. Pihak yang terlibat: TPID/pemda/dinas pangan
sebagai pengguna pengambil keputusan; Bapanas/Bulog sebagai pemilik data stok
dan pelaksana redistribusi; BMKG/BPS/BI/NOAA sebagai sumber referensi; mitra
logistik sebagai pemilik data operasional rute.

Yang **sudah bisa** dilakukan: memantau harga real-time (termasuk per provinsi
untuk beras), memantau cuaca dan risiko panen, menghitung Resilience Score dan
skenario shock rupiah, merekomendasikan prioritas redistribusi berbasis data
tersedia, mengekspor decision brief. Yang **belum bisa**: mengetahui stok
gudang aktual, biaya logistik aktual per rute, atau kapasitas carrier — bagian
ini berlabel forecast atau unavailable secara eksplisit di UI.

Ketergantungan utama: ketersediaan endpoint/scraper BI dan BMKG; kemitraan
data dengan Bapanas/Bulog/mitra logistik untuk data operasional. Hambatan
adopsi terbesar adalah kepercayaan terhadap model dan akses data stok granular;
mitigasinya adalah data lineage eksplisit sehingga setiap rekomendasi dapat
ditelusuri dan divalidasi manual sebelum dieksekusi (human-in-the-loop).

---

## IMPLEMENTATION FEASIBILITY

### Innovation Level (maks. 50 kata)

**Level 3 - Prototype, Validasi, atau Implementasi Awal.** Bukti: functional
prototype end-to-end sudah live publik (frontend Vercel + backend Render +
Supabase), source code repository aktif, empat integrasi data eksternal
real-time terverifikasi (BI Harga Pangan, BMKG, NOAA ENSO, BPS), API dan
dashboard dapat diuji langsung dengan input-output nyata.

### Current Technical Reality, Data, and Integration (maks. 300 kata)

**Sudah berfungsi (real-time/official-release, terverifikasi live)**: BI Harga
Pangan untuk harga konsumen dan produsen (endpoint `GetGridDataDaerah`, dua
level harga, dipakai menghitung margin produsen-konsumen); lapisan harga beras
**per provinsi** untuk peta nasional 34 provinsi (deviasi terhadap median
nasional, di-refresh dari BI tanpa agregasi); BMKG Open Data untuk forecast
cuaca per wilayah (6/6 titik adm4 tervalidasi); NOAA Oceanic Nino Index untuk
fase ENSO; BPS WebAPI untuk produksi padi bulanan per provinsi (var 2506,
diagregasi ke 6 wilayah, meng-update `production_ton` berlabel
`production_source='bps'` tanpa mengubah supply/demand seed). Rilis makro
BPS/BI dipakai sebagai referensi periodik.

**Masih forecast/simulasi**: Resilience Score, pressure breakdown, dan skenario
shock adalah output model rule-based (bukan black-box), bukan data mentah.
`demand_ton` dan `stock_ton` masih seed karena data granular Bapanas/Bulog
tidak tersedia publik — portal Bapanas mensyaratkan aplikasi internal (S.A.P.A),
bukan API terbuka. Biaya/kapasitas logistik masih estimasi.

**Masih direncanakan**: data demand/stok riil via kemitraan Bapanas/Bulog;
biaya dan kapasitas logistik via mitra carrier/pelabuhan.

Komponen teknis inti: React/Vite frontend, Node.js/Express backend,
PostgreSQL (Supabase), Redis opsional. Setiap dataset disimpan dengan source
label dan timestamp sehingga status (`real-time`/`official-release`/`forecast`/
`unavailable`) dapat diaudit dari API response, bukan hanya klaim UI. Snapshot
harga per provinsi disegarkan lewat endpoint ber-token dan cron harian.
Keamanan: API key backend-only (tidak dikirim ke browser), environment variable
divalidasi saat startup, CORS dan rate limiting aktif, tidak ada data personal
yang diproses.

### MVP Execution and Deployment Plan (maks. 250 kata)

Scope MVP saat ini: peta nasional 34 provinsi, 6 wilayah agregasi untuk neraca,
8 komoditas strategis, 8 modul (Dashboard/Cockpit, Resilience Room,
Supply-Demand, Food Inflation, Smart Logistics, Weather Risk, AI Forecasting,
Market & Evidence). Fitur prioritas yang sudah selesai dan live: data lineage
eksplisit, integrasi harga (termasuk per provinsi) dan cuaca real-time, risk
scoring transparan, role switcher per instansi, simulator skenario shock, panel
Source Health, dan export decision brief ke PDF. Fitur yang belum: notifikasi
push, integrasi stok/logistik mitra, dan granularitas harga hingga
kabupaten/kota.

Milestone yang sudah selesai: registrasi BPS API key, deploy publik (Render +
Vercel) live dan terverifikasi menampilkan data real termasuk harga per
provinsi. Milestone berikutnya: (1) 0-2 minggu - validasi lapangan diawali
wawancara BI yang menangani pangan lalu 5-10 TPID/dinas pangan, PIC: Product
Lead; (2) 1-3 bulan - eksplorasi kemitraan data Bapanas/Bulog untuk stok riil,
PIC: Product Lead + Data Engineer.

Risiko utama: (1) teknis - ketergantungan pada endpoint BI/BMKG yang tidak
resmi didokumentasikan sebagai API publik, mitigasi dengan retry + fallback
berlabel forecast, bukan data palsu; (2) operasional - hosting database
(Supabase) sempat gangguan koneksi selama pengembangan, mitigasi dengan
health-check monitoring dan cron keep-alive; (3) legal/kemitraan - data stok
dan logistik institusional memerlukan perjanjian berbagi data yang belum ada,
mitigasi dengan tetap menandai data tersebut unavailable hingga kemitraan
resmi.

---

## ALGORITHM QUALITY & USER EXPERIENCE

### Algorithm or Rule Quality and Decision Transparency (maks. 300 kata)

Kepang AI memakai sistem rule-based dan scoring transparan, bukan black-box,
sehingga setiap output dapat ditelusuri ke input dan formula penyusunnya.

**Weather Risk Scoring**: input berupa deviasi curah hujan forecast terhadap
baseline bulanan historis, curah hujan maksimum harian, dan fase ENSO (NOAA).
Skor 0-100 dari bobot tetap: deviasi curah hujan 40%, indeks banjir 30%, indeks
kekeringan 20%, multiplier ENSO 10%. Level risiko mengikuti threshold skor.

**Resilience Score**: menggabungkan tekanan harga (persentase di atas HET),
tekanan cuaca (risk score wilayah tertinggi), dan tekanan makro (perubahan
USD/IDR dan volatile food yoy) menjadi satu skor keputusan, dengan decision
plan berprioritas memuat owner, timeframe, dan expected metric per tindakan.

**Peta harga per provinsi**: harga beras tiap provinsi dibandingkan median
nasional; deviasi >+4% ditandai tekanan tinggi, <-4% tekanan rendah, sisanya
seimbang — pengkodean warna yang eksplisit dan dapat diaudit.

**Route Recommendation**: algoritma greedy meranking rute berdasarkan efisiensi
biaya dan waktu; ETA/jarak real-time dari Google Routes API saat key tersedia,
biaya/kapasitas tetap berlabel forecast karena belum ada feed carrier.

Alasan memilih rule-based: pada kebijakan publik, keterlusuran lebih penting
daripada akurasi marjinal model yang sulit dijelaskan. Alternatif model ML
dipertimbangkan tetapi ditolak untuk tahap ini karena butuh data historis
kejadian gagal panen yang belum tersedia dan mengorbankan transparansi.
Keterbatasan: bobot (40/30/20/10, dst) adalah asumsi awal berbasis literatur
risiko panen, belum dikalibrasi dengan data historis aktual — kalibrasi ini
bagian roadmap.

Cara operator menelusuri/memvalidasi: API mengembalikan komponen penyusun skor
(bukan hanya angka akhir) beserta status sumber data per dataset, dan UI selalu
menampilkan badge forecast/offline saat memakai fallback, sehingga koreksi
manual dapat dilakukan sebelum rekomendasi dieksekusi.

---

## COMPLEXITY

### Problem and System Complexity (maks. 200 kata)

Kompleksitas berasal dari kebutuhan menyatukan lima sumber data dengan
karakteristik berbeda: harga (harian, per komoditas-wilayah, kini hingga level
provinsi), cuaca (forecast per titik geografis), makro (bulanan, nasional),
stok (belum tersedia publik), dan logistik (rute, biaya, kapasitas). Setiap
sumber punya format, frekuensi update, dan keandalan berbeda, sehingga sistem
harus punya lapisan normalisasi dan pelabelan status data per dataset, bukan
asumsi semua data setara kualitasnya.

Variabel saling memengaruhi: kenaikan curah hujan memengaruhi risk score panen,
yang memengaruhi proyeksi produksi, yang memengaruhi neraca supply-demand
wilayah, yang memengaruhi kebutuhan redistribusi via rute logistik — sementara
paralel pelemahan rupiah memengaruhi biaya impor dan energi yang menekan biaya
distribusi. Pendekatan manual (spreadsheet per sumber) tidak memadai karena
hubungan antar-variabel ini sulit dilihat tanpa satu model yang menghitungnya
bersamaan secara konsisten dan berulang, apalagi lintas 34 provinsi.

Pendekatan yang dipilih modular: setiap sumber data punya service terpisah,
dengan satu lapisan scoring yang mengonsumsi output ternormalisasi dari
masing-masing, bukan pipeline monolitik.

### Processing Pipeline and Engineering Depth (maks. 250 kata)

Alur: pengumpulan data (scraper BI, API BMKG, feed NOAA, WebAPI BPS, input
rilis makro) → normalisasi (parsing tanggal/harga/format wilayah ke skema
internal, pelabelan source dan timestamp) → penyimpanan (PostgreSQL dengan
kolom source per baris, plus tabel snapshot harga per provinsi terpisah agar
tidak mengganggu pipeline agregat) → scoring (risk scoring cuaca, resilience
scoring gabungan, deviasi harga per provinsi, route ranking) → validasi
(perbandingan terhadap baseline historis) → output (API JSON dengan komponen
skor dan status data) → frontend (dashboard dengan badge forecast/offline saat
data asli tidak tersedia).

Aspek rekayasa relevan: modularitas (tiap sumber data adalah service terpisah —
`biPriceService`, `biProvinceSnapshot`, `bmkgService`, `bpsProductionService`,
`googleRoutesService` — sehingga kegagalan satu sumber tidak menjatuhkan yang
lain); reliability (retry dengan exponential backoff pada endpoint BI yang tidak
terdokumentasi, fallback eksplisit berlabel forecast bukan silent failure,
validasi environment variable saat startup); refresh terjadwal (cron harian
untuk snapshot harga per provinsi, keep-alive untuk mencegah cold-start);
caching opsional (Redis); rate limiting dan CORS untuk keamanan API publik.

Keterbatasan rekayasa saat ini: belum ada scheduler monitoring terpusat untuk
status kesehatan tiap sumber, insert database sebagian masih per-baris (belum
batch), dan belum ada test suite otomatis untuk regresi logika scoring.

### User Flow, Usability Testing, and Product Iteration (maks. 250 kata)

Alur pengguna: analis membuka Cockpit dan memilih peran instansinya →
memeriksa Data Confidence untuk menilai keandalan data → melihat peta nasional
34 provinsi untuk menemukan wilayah bertekanan harga tinggi → masuk Resilience
Room untuk pressure breakdown → menjalankan Simulator Shock untuk menguji
skenario → memeriksa Weather Risk → membuka Logistics untuk opsi redistribusi →
mengekspor decision brief dengan owner dan timeframe sebagai tindak lanjut.

Iterasi produk sejak 2nd submission (didorong audit internal dan persiapan
demo institusional): menambah peta nasional 34 provinsi menggantikan enam
kotak agregasi, menambah role switcher agar brief relevan per instansi,
menambah simulator skenario dan export brief, serta merombak antarmuka ke gaya
institusional yang lebih dapat dipercaya pengambil kebijakan.

Pengujian pada tahap ini bersifat teknis internal, bukan usability testing
formal dengan pengguna eksternal: verifikasi endpoint API, verifikasi build,
dan verifikasi langsung scraper/API eksternal (BI, BMKG, NOAA, BPS) untuk
memastikan data yang ditampilkan benar-benar dapat ditarik live. Verifikasi ini
menemukan dan memperbaiki bug nyata: kode wilayah BMKG tidak valid, dan label
sumber data salah pada jalur fallback harga.

Usability testing dengan pengguna eksternal **belum dilakukan** dan diakui
terbuka sebagai keterbatasan; wawancara dengan BI yang menangani pangan sedang
dijadwalkan sebagai langkah validasi pertama. Mekanisme pencegah kesalahan yang
sudah ada: badge "Forecast/offline mode" konsisten muncul saat sistem memakai
fallback, agar pengguna tidak salah mengira forecast sebagai data real-time.

---

## BUSINESS PLAN & ROI

### Quantified Value, Business Model, and ROI (maks. 300 kata)

Model pendapatan: B2G/institutional SaaS dengan lima aliran - (1) lisensi
tahunan dashboard untuk pemda/TPID/Bapanas/Bulog/BI regional berdasarkan jumlah
wilayah, pengguna, dan modul aktif; (2) implementation fee untuk setup,
integrasi data, dan training; (3) managed analytics report bulanan; (4) API
subscription untuk risk score dan route intelligence bagi institusi, mitra
logistik, dan asuransi pertanian; (5) logistics add-on untuk optimasi rute dan
backhaul bagi carrier/warehouse partner.

Yang memperoleh manfaat: TPID/pemda (identifikasi wilayah prioritas lebih
cepat), Bapanas/Bulog (rekomendasi redistribusi berbasis data), BI regional
(evidence koordinasi inflasi pangan), mitra logistik (prioritas rute). Yang
membayar: institusi pilot melalui lisensi dan implementation fee pada tahap
awal; ekspansi ke API subscription dan logistics add-on setelah pilot
tervalidasi.

Konteks pasar: APBN 2026 mengalokasikan Rp210,4 triliun untuk ketahanan pangan,
sehingga anggaran untuk decision infrastructure tersedia. Asumsi break-even
awal (model bisnis internal, bukan hasil negosiasi klien aktual): sekitar 6
klien lisensi standar aktif dengan recurring revenue rata-rata Rp192 juta per
klien per tahun sudah menutup biaya operasional dasar (cloud, data integration,
support). Biaya utama: pengembangan produk, hosting cloud/database, biaya API
pihak ketiga, keamanan, dan customer success.

Nilai terukur yang ditargetkan: penurunan waktu identifikasi wilayah prioritas
minimal 50% dibanding proses manual lintas spreadsheet, potensi efisiensi biaya
logistik 5-10% setelah data rute mitra tervalidasi, dan penurunan simulated
supply gap minimal 30% pada skenario redistribusi. Angka-angka ini target
simulasi MVP, bukan hasil implementasi lapangan, dan akan divalidasi saat
pilot berjalan.

---

## TEAM READINESS FOR STARTUP

### Team Capability and Execution Ownership (maks. 250 kata)

Pembagian peran: Julian Raus (Product/Ketua) memimpin arah produk, validasi
masalah, dan keputusan prioritas fitur; Wiennetou Joel (Backend/Technology)
membangun API, skema database, dan seluruh integrasi data eksternal (BI Harga
Pangan, BMKG, NOAA, BPS, Google Routes); Jati Kusuma (Frontend/UX) membangun
dashboard, peta nasional, visualisasi data lineage, dan pengalaman pengguna
institusional; Jonathan Wibowo (Data/AI) membangun logika risk scoring,
resilience model, dan forecasting.

Hasil kerja nyata yang dapat diverifikasi: repository kode aktif dengan delapan
modul frontend dan beberapa service backend berjalan, empat integrasi data
eksternal real-time terverifikasi (bukan klaim — sudah diuji langsung
menghasilkan data live, termasuk harga beras per 34 provinsi), deploy publik
yang live, serta kebijakan data lineage yang konsisten diterapkan di seluruh
endpoint.

Cara tim mengambil keputusan: perubahan arah produk dan prioritas fitur
diputuskan Product Lead berdasarkan kesesuaian dengan kriteria guidebook dan
kesiapan data; keputusan teknis (arsitektur, library, strategi fallback)
diputuskan Backend/Data Engineer dengan prinsip "tidak ada data palsu diklaim
sebagai data asli". Untuk milestone berikutnya (validasi lapangan, kemitraan
data), owner adalah Product Lead untuk sisi validasi pengguna dan Backend
Engineer untuk sisi teknis.

`[CEK: sesuaikan dengan pembagian kerja aktual tim per hari ini]`

### Continuation Readiness (maks. 200 kata)

Target 6-12 bulan: (1) 0-2 bulan - menuntaskan validasi lapangan diawali
wawancara BI yang menangani pangan lalu 5-10 institusi target, dan menstabilkan
deploy publik; (2) 2-6 bulan - membangun kemitraan data awal dengan minimal
satu dinas pangan/TPID untuk pilot terbatas, mengkalibrasi bobot risk scoring
dengan data historis kejadian gagal panen; (3) 6-12 bulan - memperluas
granularitas dari 34 provinsi menuju kabupaten/kota pada komoditas yang datanya
tersedia, serta mengeksplorasi kemitraan data stok dengan Bapanas/Bulog.

Komitmen tim: seluruh anggota melanjutkan pengembangan di luar hackathon dengan
pembagian waktu paruh-waktu yang disesuaikan progres pilot. Kompetensi tambahan
yang dibutuhkan: kontak institusional untuk membuka akses data Bapanas/Bulog
(S.A.P.A) dan kemampuan business development untuk closing pilot pertama — tim
berencana mencari advisor atau mitra dari jaringan hackathon dan program
inkubasi PIDI. `[CEK: sesuaikan dengan rencana konkret tim]`

### Adoption, Growth Strategy, and Competitive Moat (maks. 250 kata)

Strategi memperoleh pengguna pertama: mendekati BI regional dan TPID/dinas
pangan di daerah dengan volatile food tinggi atau disparitas harga besar,
menawarkan demo dashboard dan evidence pack sebagai pembuka diskusi, bukan
hard-selling lisensi. Channel utama: forum TPID, jaringan Bapanas/BI regional,
dan program inkubasi PIDI.

Tahapan pengembangan: mulai dari pilot 1-3 institusi dengan data publik (harga,
cuaca) yang sudah real-time, kemudian menambah data operasional (stok,
logistik) seiring kemitraan, lalu memperdalam granularitas dari 34 provinsi ke
kabupaten/kota.

Faktor pembeda: (1) data lineage eksplisit sebagai bagian model keputusan,
bukan disclaimer — hampir tidak ada dashboard pangan publik yang membedakan
real-time, official-release, forecast, dan unavailable pada level output; (2)
peta harga per provinsi yang menyingkap disparitas nyata (mis. beras Papua/
Kalimantan 20-23% di atas median) sebagai dasar keputusan redistribusi; (3)
pendekatan scenario-based saat rupiah melemah; (4) arsitektur modular yang
membuat setiap sumber data baru dapat ditambah tanpa merombak sistem,
mempercepat replikasi ke wilayah baru.

Ini menyulitkan peniruan cepat karena kombinasi kejujuran data, model
keputusan, cakupan 34 provinsi, dan modularitas teknis butuh disiplin
implementasi berkelanjutan, bukan fitur permukaan. Bukti ketertarikan pihak
eksternal belum ada pada tahap ini dan tidak diklaim.

---

## ATTACHMENT

**VIDEO SUBMISSION** (YouTube, publik/unlisted, maks. 180 detik, 1080p, 16:9,
subtitle disarankan): `[ISI LINK YOUTUBE]`

**FILE ATTACHMENT (PDF, maks. 5MB, nama file "P0684 - <Judul Proposal>")**:
satu PDF berisi ringkasan problem-solution, screenshot Cockpit/peta 34
provinsi/Resilience Room/Logistics, diagram arsitektur, data source matrix,
dan test evidence (scraper BI, harga per provinsi 34, BMKG 6/6, NOAA ENSO
live). Lihat `docs/SUBMISSION_SUPPORTING_EVIDENCE.md`.

**LINK ATTACHMENT** (1 link, harus dapat diakses publik tanpa izin tambahan):
`https://pidi-seven.vercel.app` — deploy publik live, backend
`https://kepang-ai-api.onrender.com` terhubung Supabase dengan data real (BI
Harga Pangan termasuk per provinsi, BMKG, NOAA, BPS). Repo:
`https://github.com/julianraus/pidi`.

**CV ATTACHMENT**: `[ISI link LinkedIn/CV tiap anggota - Julian Raus, Wiennetou
Joel, Jati Kusuma, Jonathan Wibowo]`

---

## Catatan Pengisian

- Bagian `[CEK]` wajib diverifikasi tim sebelum submit — terutama Team ID, nama
  anggota, link video, dan link CV.
- Video sekarang **maks. 180 detik** (bukan 60 detik). Struktur 1-menit pitch +
  2-menit demo di `docs/VIDEO_SCRIPT_AND_APP_EXPLAINER_3RD.md` sudah sesuai.
- Nada jawaban sengaja jujur tentang keterbatasan (belum ada usability testing
  formal; wawancara pengguna baru dijadwalkan) sesuai larangan guideline atas
  klaim tanpa bukti. Ini risiko yang disadari dan diterima tim.
