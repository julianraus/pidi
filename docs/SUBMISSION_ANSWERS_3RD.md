# Jawaban Submission Tahap 3 — Kepang AI

Mengikuti form 3rd Submission Proposal (PIDI–Digdaya x Hackathon 2026) dan Buku
Panduan resmi. Semua section sudah diverifikasi word counter (tabel di akhir).

**Angka dalam dokumen ini ditarik langsung dari API Kepang AI yang live**, bukan
dari draf lama. Bagian bertanda `[CEK]` wajib dikonfirmasi tim sebelum submit.

> ⚠ **Sebelum submit, cocokkan sekali lagi** angka di jawaban dengan yang tampil
> di `pidi-seven.vercel.app`. Data bergerak mengikuti BI/BMKG. Yang paling sering
> berubah: skor ketahanan (**54**), harga per provinsi, jumlah wilayah defisit
> (**3/6**). Juri sangat mungkin membuka aplikasinya sambil membaca proposal ini.

---

## TEAM IDENTITY

**TEAM ID**: P0684 `[CEK terhadap akun resmi pidi.id]`
**TEAM NAME**: J4 `[CEK — samakan dengan submission ke-2]`
**FINAL SOLUTION TITLE**: Kepang AI: Decision Intelligence untuk Resiliensi
Ketahanan Pangan Daerah
**PROBLEM STATEMENT**: Peningkatan Produktivitas, Ketahanan Pangan, dan
Penciptaan Lapangan Kerja
**SUB-PROBLEM STATEMENT**: Digitalisasi Ketahanan Pangan

---

## FINAL TEAM COMPOSITION (maks. 100 kata)

Julian Raus — Ketua Tim dan Product Lead: arah produk, validasi masalah, dan
strategi implementasi. Wiennetou Joel — Backend Engineer: API, database, dan
seluruh integrasi data eksternal (BI Harga Pangan, BMKG, BPS, NOAA). Jati
Kusuma — Frontend Engineer: cockpit keputusan, peta nasional 34 provinsi, dan
UX institusional. Jonathan Wibowo — Data/AI Engineer: risk scoring, resilience
model, dan logika rekomendasi. Tidak ada perubahan peran sejak 2nd submission.
Komposisi ini menutup kebutuhan end-to-end: produk, data, backend, frontend,
dan implementasi lapangan. `[CEK nama dan peran final]`

---

## FINAL SOLUTION SUMMARY (maks. 150 kata)

Kepang AI adalah decision intelligence platform untuk ketahanan pangan daerah.
Penggunanya TPID, Bapanas, Bulog, BI regional, dan dinas pangan. Masalah yang
diselesaikan adalah policy lag: harga, cuaca, produksi, dan tekanan rupiah
dianalisis terpisah di lembaga berbeda, sehingga intervensi datang setelah
harga naik.

Kepang AI menganyam empat sumber live — BI Harga Pangan, BMKG, BPS, NOAA —
menjadi satu cockpit: peta harga 34 provinsi, Resilience Score, simulator
skenario, dan rencana aksi berprioritas lengkap dengan pemilik, tenggat, dan
KPI. Setiap angka diberi label lineage jujur: real-time, rilis resmi, forecast,
atau belum tersedia.

Hasil nyata dari sistem hari ini: disparitas harga beras antarprovinsi mencapai
42 persen, dan Papua–Maluku tercatat defisit sekaligus berisiko panen kritis —
sinyal yang tidak terlihat bila sumber dibaca terpisah. Status: functional
prototype yang sudah live publik dan dapat diuji langsung.

---

## PROGRESS AND CHANGE LOG (maks. 150 kata)

Tiga perubahan besar sejak 2nd submission.

**Pertama, menghapus data dummy.** Scraper BI Harga Pangan diaktifkan untuk
harga konsumen dan produsen; BMKG untuk 6 wilayah (satu kode adm4 tidak valid
ditemukan dan diperbaiki); fase ENSO yang sebelumnya hardcoded diganti feed
NOAA; produksi padi ditarik dari BPS WebAPI. Bug label sumber — harga sintetis
sempat ditandai 'bps' — diperbaiki.

**Kedua, memperluas granularitas.** Dari 6 wilayah agregasi menjadi peta
nasional 34 provinsi dengan lapisan harga beras per provinsi live dari BI.
Perluasan ini langsung menghasilkan temuan yang sebelumnya tidak terlihat:
disparitas 42 persen antara NTB dan Kalimantan Tengah.

**Ketiga, mengubah dashboard menjadi alat keputusan.** Ditambahkan role switcher
per instansi, simulator skenario shock, panel Source Health, dan export decision
brief. Audit terakhir juga memperbaiki dua ketidakkonsistenan yang kini sudah
live: label fase ENSO yang sempat hardcoded dan bertentangan dengan data NOAA
sistem sendiri, serta satu halaman yang menampilkan tonase tanpa label sumber.

---

## USE CASE CLARITY & ALIGNMENT WITH USER PROBLEM

### Validated User Problem and Evidence (maks. 250 kata)

**Pengguna utama:** analis dan operator kebijakan pangan daerah — TPID, dinas
pangan, Bapanas, Bulog, BI regional. **Kapan masalah terjadi:** saat harga,
pasokan, cuaca, dan kurs bergerak bersamaan dan keputusan intervensi harus
diambil dalam hitungan hari.

**Penyebab utama:** fragmentasi data lintas lembaga, ditambah tidak adanya
pembeda antara data asli, rilis resmi, dan estimasi. **Dampaknya:** intervensi
bersifat reaktif — operasi pasar dan pre-positioning stok dimulai setelah
tekanan harga membesar.

**Bukti terbaru — dari sistem kami sendiri.** Menarik harga beras 34 provinsi
langsung dari BI, Kepang AI menemukan disparitas **42 persen** dalam satu hari
yang sama: NTB Rp13.800, Kalimantan Tengah Rp19.550, dengan 11 provinsi di atas
median nasional Rp15.950. Sistem juga menandai Papua–Maluku mengalami defisit
61 ribu ton **sekaligus** risiko panen kritis 76 — kombinasi yang tidak terlihat
bila data BPS dan BMKG dibaca terpisah. Ini bukan kutipan; ini keluaran produk
yang dapat diverifikasi langsung di aplikasi live.

**Bukti sekunder resmi** memperkuat konteks: BPS mencatat inflasi Juni 2026
3,34 persen yoy dengan volatile food 5,58 persen; BI menaikkan BI-Rate tiga kali
berturut menjadi 5,75 persen; kurs JISDOR Rp17.944.

**Penajaman sejak 2nd submission:** fokus bergeser dari "data tersebar" menjadi
"disparitas antarwilayah tidak terukur" — pergeseran yang muncul justru setelah
granularitas dinaikkan ke level provinsi. Validasi langsung ke pengguna sedang
dijadwalkan, belum diklaim selesai.

### End-to-End Use Case and Feature-to-Pain Mapping (maks. 300 kata)

**Use case:** analis TPID menentukan wilayah prioritas saat harga beras naik.

**Kondisi awal:** analis membuka Cockpit dan memilih perannya; decision brief
menyesuaikan mandat instansinya. Terlihat Resilience Score 54 (siaga 1) dan
badge data confidence 68 persen.

**Pemicu:** harga komoditas melewati HET di satu wilayah, bersamaan dengan alert
cuaca BMKG.

**Tindakan pengguna:** membuka peta nasional 34 provinsi untuk melihat provinsi
mana yang harganya di atas median.

**Input sistem:** harga harian BI (konsumen dan produsen), prakiraan BMKG, fase
ENSO NOAA, produksi padi BPS, kurs dan inflasi dari rilis resmi.

**Proses sistem:** risk scoring cuaca menghitung skor risiko panen per wilayah
dari deviasi curah hujan, indeks banjir, indeks kekeringan, dan multiplier ENSO;
resilience model menggabungkan tekanan harga, cuaca, dan makro menjadi satu skor
serta rencana aksi berprioritas.

**Output:** decision brief — aksi prioritas "pre-positioning stok ke Bali & Nusa
Tenggara" (defisit 69 ribu ton), pemilik Bulog/TPID/Dinas Pangan, tenggat 0–14
hari, KPI gap pasokan turun minimal 30 persen.

**Tindakan lanjutan:** analis menjalankan Simulator Shock untuk menguji dampak
pelemahan rupiah atau gagal panen terhadap skor sebelum memutuskan, lalu
mengekspor brief tersebut sebagai bahan rapat.

**Hasil:** identifikasi wilayah prioritas yang sebelumnya menuntut penggabungan
manual lintas sumber kini selesai dalam satu sesi kerja.

**Feature-to-pain mapping:** peta 34 provinsi mengatasi disparitas antarwilayah
yang tak terukur; Resilience Score mengatasi fragmentasi lintas sumber; Source
Health mengatasi ketidakjelasan data asli versus estimasi; risk engine mengatasi
keterlambatan deteksi risiko panen; role switcher mengatasi rekomendasi yang
tidak relevan dengan mandat instansi; Simulator Shock mengatasi
ketidakmampuan menguji skenario sebelum anggaran keluar; decision brief dengan
pemilik dan KPI mengatasi rekomendasi yang terlalu abstrak untuk dieksekusi.

### Operational Context, Solution Boundary, and Adoption (maks. 200 kata)

Kepang AI berjalan sebagai lapisan analitik di atas data yang sudah ada, bukan
pengganti sistem regulator. Pihak terlibat: TPID, pemda, dan dinas pangan sebagai
pengambil keputusan; Bapanas dan Bulog sebagai pemilik data stok dan pelaksana
redistribusi; BI, BPS, BMKG, dan NOAA sebagai sumber referensi; mitra logistik
sebagai pemilik data rute.

**Sudah bisa dilakukan:** memantau harga 34 provinsi dan cuaca secara real-time,
menghitung Resilience Score dan skenario shock, menyusun rekomendasi prioritas
dengan pemilik dan KPI, serta mengekspor decision brief.

**Belum bisa:** mengetahui stok gudang aktual, permintaan granular, biaya
logistik dan kapasitas carrier riil. Bagian ini ditandai `forecast` atau
`unavailable` secara eksplisit di antarmuka, bukan disembunyikan.

**Ketergantungan:** ketersediaan endpoint BI dan BMKG, serta kemitraan data
dengan Bapanas, Bulog, dan operator logistik.

**Hambatan adopsi terbesar:** kepercayaan terhadap model dan akses data stok
granular. Mitigasinya adalah data lineage eksplisit — setiap rekomendasi dapat
ditelusuri ke komponen penyusunnya dan divalidasi manual sebelum dieksekusi.
Manusia tetap pengambil keputusan akhir.

---

## IMPLEMENTATION FEASIBILITY

### Innovation Level (maks. 50 kata)

**Level 3 — Prototype, Validasi, atau Implementasi Awal.** Bukti: functional
prototype live publik (Vercel + Render + Supabase), repository aktif, empat
integrasi data eksternal real-time terverifikasi, API dan dashboard dapat diuji
langsung dengan input-output nyata. Validasi pengguna eksternal formal belum
dilakukan dan tidak diklaim.

### Current Technical Reality, Data, and Integration (maks. 300 kata)

**Sudah berfungsi (terverifikasi live).** Harga pangan dari BI Harga Pangan,
level konsumen dan produsen, dipakai menghitung margin distribusi. Lapisan harga
beras per provinsi untuk peta 34 provinsi, ditarik tanpa agregasi dan disegarkan
cron harian — 34 dari 34 nama provinsi terverifikasi cocok dengan GeoJSON. Cuaca
BMKG untuk seluruh wilayah pilot. Fase ENSO dari NOAA. Produksi padi bulanan per
provinsi dari BPS WebAPI, mengisi `production_ton` dengan label
`production_source='bps'`.

**Masih forecast atau simulasi.** Resilience Score, skor risiko panen, dan
skenario shock adalah keluaran model rule-based, bukan data mentah. Tonase
`demand_ton` dan `stock_ton` masih seed karena data granular Bapanas tidak
tersedia publik — portal Bapanas mensyaratkan akses aplikasi internal S.A.P.A,
bukan API terbuka. Rencana redistribusi dan biayanya adalah keluaran model di
atas data tersebut, bukan rencana operasional.

**Masih direncanakan.** Data stok dan permintaan riil via kemitraan
Bapanas/Bulog; biaya dan kapasitas logistik via mitra carrier; perluasan harga
per provinsi ke komoditas selain beras.

**Komponen teknis.** React/Vite, Node.js/Express, PostgreSQL (Supabase), Redis
opsional. Peta choropleth dirender sebagai SVG inline tanpa library peta
eksternal. Setiap dataset disimpan dengan label sumber dan timestamp sehingga
status data dapat diaudit dari respons API, bukan sekadar klaim di antarmuka —
data confidence saat ini 68 persen, dihitung dari komposisi lineage, dan sengaja
tidak dibulatkan. Nilai turunan seperti fase ENSO tidak ditulis tetap di
antarmuka melainkan dibaca dari baris data yang benar-benar dipakai model,
sehingga tampilan tidak dapat melenceng dari data ketika kondisi berubah.

**Keamanan.** API key hanya di backend dan tidak dikirim ke browser; environment
variable divalidasi saat startup; CORS dan rate limiting aktif; endpoint penulis
data dilindungi token; tidak ada data pribadi yang diproses.

### MVP Execution and Deployment Plan (maks. 250 kata)

**Scope saat ini:** peta nasional 34 provinsi, 6 wilayah agregasi untuk neraca,
8 komoditas, 8 modul. Sudah selesai dan live: data lineage eksplisit, harga dan
cuaca real-time, risk scoring transparan, role switcher, simulator skenario,
panel Source Health, dan export decision brief. Belum masuk: notifikasi push,
integrasi stok dan logistik mitra, serta granularitas kabupaten/kota.

**Milestone selesai:** registrasi BPS API key, integrasi empat sumber data,
deploy publik terverifikasi menampilkan data real termasuk harga per provinsi.

**Milestone berikutnya:** (1) 0–2 minggu — validasi lapangan, diawali wawancara
terstruktur dengan BI yang menangani pangan, dilanjutkan 5–10 TPID dan dinas
pangan; instrumen kuesioner sudah disiapkan; PIC Product Lead. (2) 1–3 bulan —
menjajaki kemitraan data Bapanas/Bulog untuk stok riil; PIC Product Lead dan
Data Engineer. (3) 3–6 bulan — pilot terbatas di satu daerah dan kalibrasi bobot
risk scoring dengan data historis gagal panen.

**Risiko dan mitigasi.** Teknis: endpoint BI dan BMKG tidak terdokumentasi
sebagai API publik resmi — dimitigasi retry dengan exponential backoff, isolasi
kegagalan per provinsi, dan fallback berlabel forecast, bukan data palsu.
Operasional: hosting gratis berisiko cold start — dimitigasi cron keep-alive
tiap 10 menit. Kemitraan: data stok dan logistik memerlukan perjanjian berbagi
data yang belum ada — dimitigasi dengan tetap menandai dataset tersebut
`unavailable` hingga kemitraan resmi terbentuk.

---

## COMPLEXITY

### Problem and System Complexity (maks. 200 kata)

Kompleksitas berasal dari menyatukan lima jenis data dengan karakter berbeda:
harga (harian, per komoditas dan kini per provinsi), cuaca (prakiraan per titik
geografis), produksi (bulanan, per provinsi), makro (bulanan, nasional), dan
logistik (rute, biaya, kapasitas). Format, frekuensi pembaruan, dan keandalannya
berbeda-beda, sehingga sistem memerlukan lapisan normalisasi dan pelabelan status
per dataset — bukan asumsi bahwa semua data setara kualitasnya.

Variabelnya saling memengaruhi. Curah hujan memengaruhi skor risiko panen, yang
memengaruhi proyeksi produksi, yang memengaruhi neraca wilayah, yang menentukan
kebutuhan redistribusi dan rute logistik. Secara paralel, pelemahan rupiah
menekan biaya impor dan energi yang menaikkan biaya distribusi.

Contoh konkret mengapa pendekatan sederhana tidak memadai: Papua–Maluku saat ini
tercatat defisit 61 ribu ton **dan** berisiko panen kritis 76 secara bersamaan.
Membaca laporan BPS saja atau BMKG saja tidak memunculkan kombinasi itu —
padahal justru kombinasi tersebut yang menentukan urgensi intervensi. Menyusunnya
manual di spreadsheet untuk 34 provinsi, setiap minggu, secara konsisten, tidak
realistis.

Pendekatan yang dipilih modular: tiap sumber data adalah service terpisah, dengan
satu lapisan scoring yang mengonsumsi keluaran ternormalisasi masing-masing.

### Processing Pipeline and Engineering Depth (maks. 250 kata)

**Alur:** pengumpulan (scraper BI, API BMKG, feed NOAA, WebAPI BPS, rilis makro)
→ normalisasi (parsing tanggal, harga, dan pemetaan wilayah ke skema internal;
pelabelan sumber dan timestamp) → penyimpanan (PostgreSQL dengan kolom sumber
per baris, plus tabel snapshot harga per provinsi terpisah agar tidak mengganggu
pipeline agregat) → scoring (risiko cuaca, resilience gabungan, deviasi harga
provinsi terhadap median, ranking rute) → validasi (pembandingan terhadap
baseline historis) → output (API JSON berisi komponen skor dan status data) →
antarmuka (cockpit dengan badge forecast saat fallback dipakai).

**Aspek rekayasa.** Modularitas: tiap sumber adalah service terpisah —
`biPriceService`, `biProvinceSnapshot`, `bmkgService`, `bpsProductionService`,
`googleRoutesService` — sehingga kegagalan satu sumber tidak menjatuhkan yang
lain. Reliability: retry dengan exponential backoff pada endpoint BI yang tidak
terdokumentasi, isolasi kegagalan per provinsi sehingga satu provinsi gagal tidak
membatalkan 33 lainnya, fallback eksplisit berlabel forecast alih-alih gagal
diam-diam, dan validasi environment variable saat startup. Penyegaran terjadwal:
cron harian untuk snapshot harga provinsi, keep-alive untuk mencegah cold start.
Caching opsional via Redis; rate limiting dan CORS untuk keamanan API publik.

**Keterbatasan yang diakui.** Belum ada monitoring terpusat untuk status
kesehatan tiap sumber data; sebagian penulisan database masih per baris dan belum
batch; belum ada test suite otomatis untuk regresi logika scoring. Ketiganya
masuk backlog teknis dan bukan penghalang untuk pilot terbatas.

---

## ALGORITHM QUALITY & USER EXPERIENCE

### Algorithm or Rule Quality and Decision Transparency (maks. 300 kata)

Kepang AI memakai scoring rule-based yang transparan, bukan model black-box,
sehingga setiap keluaran dapat ditelusuri ke input dan formulanya.

**Weather Risk Scoring.** Input: deviasi curah hujan prakiraan terhadap baseline
bulanan historis, curah hujan maksimum harian, dan fase ENSO dari NOAA. Skor
0–100 dari bobot tetap — deviasi hujan 40 persen, indeks banjir 30, indeks
kekeringan 20, multiplier ENSO 10. Level risiko mengikuti ambang skor.

**Resilience Score.** Menggabungkan tekanan harga (persentase di atas HET),
tekanan cuaca (skor risiko wilayah tertinggi), dan tekanan makro (perubahan
USD/IDR dan volatile food yoy) menjadi satu skor keputusan — saat ini 54, level
siaga 1 — beserta rencana aksi berprioritas.

**Deviasi harga provinsi.** Harga tiap provinsi dibandingkan median nasional;
deviasi di atas +4 persen ditandai tekanan tinggi, di bawah −4 persen tekanan
rendah. Pengkodean sederhana dan dapat diaudit.

**Kondisi pengecualian.** Bila sumber gagal setelah retry, sistem memakai
fallback berlabel forecast dan antarmuka menampilkan badge; provinsi yang datanya
kosong tidak diwarnai, bukan ditebak.

**Mengapa rule-based.** Pada kebijakan publik, keterlusuran lebih bernilai
daripada akurasi marjinal. Model machine learning dipertimbangkan tetapi ditolak
untuk tahap ini karena memerlukan data historis kejadian gagal panen yang belum
kami miliki, dan akan mengorbankan kemampuan menjelaskan hasil kepada pengambil
kebijakan.

**Keterbatasan.** Bobot 40/30/20/10 adalah asumsi awal berbasis literatur risiko
panen, belum dikalibrasi terhadap data historis aktual. Kalibrasi ini adalah
bagian eksplisit dari roadmap.

**Cara menelusuri dan mengoreksi.** API mengembalikan komponen penyusun skor,
bukan hanya angka akhir, beserta status sumber tiap dataset. Panel Source Health
menampilkan komposisi itu di antarmuka. Operator dapat memvalidasi manual dan
menolak rekomendasi sebelum dieksekusi.

### User Flow, Usability Testing, and Product Iteration (maks. 250 kata)

**Alur pengguna:** analis membuka Cockpit dan memilih peran instansinya →
memeriksa data confidence untuk menilai keandalan → membaca peta 34 provinsi
untuk menemukan wilayah bertekanan harga → membuka Resilience Room untuk
pressure breakdown → menjalankan Simulator Shock untuk menguji skenario →
memeriksa risiko panen → membuka Logistik untuk opsi redistribusi → mengekspor
decision brief berisi aksi, pemilik, tenggat, dan KPI.

**Iterasi produk sejak 2nd submission**, didorong audit internal dan persiapan
demo institusional: peta 6 kotak agregasi diganti peta choropleth 34 provinsi;
ditambahkan role switcher agar brief relevan dengan mandat tiap instansi;
ditambahkan simulator skenario dan export brief; antarmuka dirombak ke gaya
institusional yang lebih layak dipercaya pengambil kebijakan.

**Pengujian yang sudah dilakukan** bersifat teknis internal: verifikasi endpoint
API, verifikasi build produksi, dan pengujian langsung terhadap scraper dan API
eksternal untuk memastikan data benar-benar dapat ditarik live. Pengujian ini
menemukan dan memperbaiki lima bug nyata: kode wilayah BMKG tidak valid; label
sumber keliru pada jalur fallback harga; kode wilayah tidak cocok sehingga peta
tak terwarnai saat offline; label fase ENSO hardcoded yang bertentangan dengan
data NOAA sistem sendiri; dan satu halaman yang menampilkan tonase presisi tanpa
label sumber. Dua temuan terakhir muncul saat menyiapkan demo — bukti audit
internal masih berjalan.

**Usability testing dengan pengguna eksternal belum dilakukan.** Ini keterbatasan
yang kami nyatakan terbuka, bukan kami tutupi. Instrumen kuesioner terstruktur
sudah disiapkan dan wawancara dengan BI sedang dijadwalkan. Mekanisme pencegah
kesalahan yang sudah berjalan: badge forecast konsisten muncul setiap sistem
memakai fallback, sehingga pengguna tidak keliru menganggapnya data real-time.

---

## BUSINESS PLAN & ROI

### Quantified Value, Business Model, and ROI (maks. 300 kata)

**Siapa memakai dan menerima manfaat.** TPID dan pemda memperoleh identifikasi
wilayah prioritas yang lebih cepat; Bapanas dan Bulog memperoleh dasar
redistribusi berbasis data; BI regional memperoleh evidence koordinasi inflasi
pangan; mitra logistik memperoleh prioritas rute.

**Siapa membayar.** Institusi pilot melalui lisensi tahunan dan biaya
implementasi pada tahap awal; menyusul langganan API dan add-on logistik setelah
pilot tervalidasi.

**Model pendapatan.** Lima aliran: lisensi institusional tahunan berdasarkan
cakupan wilayah, pengguna, dan modul; biaya implementasi untuk setup, integrasi,
dan pelatihan; managed analytics berupa laporan risiko berkala; langganan API
untuk risk score dan route intelligence bagi institusi, asuransi pertanian, dan
pembiayaan agri; add-on optimasi rute bagi carrier dan gudang.

**Biaya utama.** Pengembangan produk, hosting cloud dan database, biaya API pihak
ketiga, keamanan, serta customer success.

**Konteks pasar.** APBN 2026 mengalokasikan Rp210,4 triliun untuk ketahanan
pangan, sehingga anggaran di sisi pembeli tersedia. Struktur pasarnya jelas: 38
provinsi dan 514 kabupaten/kota, masing-masing memiliki TPID dengan kewajiban
rapat dan pelaporan rutin.

**Asumsi dan break-even.** Berdasarkan model internal, bukan hasil negosiasi
klien: kontribusi recurring per klien standar sekitar Rp192 juta per tahun
(lisensi Rp240 juta dikurangi direct cost Rp48 juta). Dengan fixed cost awal
sekitar Rp1,09 miliar per tahun, break-even operasional tercapai pada sekitar 6
klien aktif setahun penuh.

**Nilai terukur yang ditargetkan.** Waktu identifikasi wilayah prioritas turun
minimal 50 persen dibanding proses manual lintas spreadsheet; potensi efisiensi
biaya logistik 5–10 persen setelah data rute mitra tervalidasi; penurunan
simulated supply gap minimal 30 persen pada skenario redistribusi. Semua angka
ini target simulasi MVP, bukan hasil implementasi lapangan.

---

## TEAM READINESS FOR STARTUP

### Team Capability and Execution Ownership (maks. 250 kata)

**Pembagian peran.** Julian Raus (Product, Ketua) memimpin arah produk, validasi
masalah, dan prioritas fitur. Wiennetou Joel (Backend) membangun API, skema
database, dan seluruh integrasi eksternal. Jati Kusuma (Frontend/UX) membangun
cockpit keputusan, peta nasional, dan visualisasi data lineage. Jonathan Wibowo
(Data/AI) membangun risk scoring, resilience model, dan logika rekomendasi.

**Hasil kerja yang dapat diverifikasi**, bukan klaim: repository aktif dengan 8
modul frontend dan beberapa service backend; empat integrasi data eksternal
real-time yang sudah diuji langsung menghasilkan data live, termasuk harga beras
34 provinsi; deploy publik yang dapat diakses dan diuji siapa pun; serta
kebijakan data lineage yang kini diterapkan konsisten di seluruh endpoint dan
seluruh halaman yang menampilkan angka — konsistensi itu ditegakkan lewat audit
internal, termasuk memperbaiki halaman yang sempat luput. Tim juga
menembus hambatan integrasi nyata — WAF milik BPS WebAPI dan endpoint BI yang
tidak berdokumentasi — yang menunjukkan kemampuan eksekusi teknis di domain sulit.

**Cara mengambil keputusan.** Arah produk dan prioritas fitur diputuskan Product
Lead berdasarkan kesesuaian dengan kriteria penilaian dan kesiapan data.
Keputusan teknis — arsitektur, pilihan library, strategi fallback — diputuskan
Backend dan Data Engineer dengan satu prinsip yang tidak dinegosiasikan: tidak
ada data palsu yang diklaim sebagai data asli.

**Owner milestone berikutnya.** Validasi pengguna dan kemitraan institusional:
Product Lead. Integrasi data baru dan stabilitas deployment: Backend Engineer.
Kalibrasi bobot scoring: Data/AI Engineer. `[CEK — sesuaikan dengan pembagian
kerja aktual tim]`

### Continuation Readiness (maks. 200 kata)

**Target 6–12 bulan.** (1) 0–2 bulan: menuntaskan validasi lapangan yang diawali
wawancara dengan BI, lalu 5–10 institusi target; menstabilkan deployment publik.
(2) 2–6 bulan: membangun kemitraan data awal dengan minimal satu dinas pangan
atau TPID untuk pilot terbatas; mengkalibrasi bobot risk scoring dengan data
historis kejadian gagal panen. (3) 6–12 bulan: memperdalam granularitas dari 34
provinsi menuju kabupaten/kota pada komoditas yang datanya tersedia, dan
menjajaki kemitraan data stok dengan Bapanas atau Bulog.

**Komitmen tim.** Seluruh anggota melanjutkan pengembangan setelah hackathon
dengan alokasi waktu paruh-waktu yang menyesuaikan progres pilot.

**Kompetensi yang masih dibutuhkan.** Akses institusional untuk membuka data
Bapanas/Bulog (sistem S.A.P.A), serta kemampuan business development untuk
menutup pilot berbayar pertama. Tim berencana mencari advisor atau mitra dari
jaringan program inkubasi PIDI untuk menutup celah ini — dan menyatakannya
terbuka sebagai kebutuhan, bukan menganggapnya sudah teratasi. `[CEK — sesuaikan
dengan rencana konkret tim]`

### Adoption, Growth Strategy, and Competitive Moat (maks. 250 kata)

**Memperoleh pengguna pertama.** Mendekati BI regional dan TPID di daerah dengan
volatile food tinggi atau disparitas harga besar — dan kami kini dapat
menunjukkan daerah mana persisnya, karena sistem mengukurnya. Pembuka diskusi
berupa demo dan evidence pack, bukan penawaran lisensi. Channel: forum TPID,
jaringan Bapanas dan BI regional, serta program inkubasi PIDI.

**Tahapan pengembangan.** Mulai dari pilot 1–3 institusi memakai data publik yang
sudah real-time; menambah data operasional stok dan logistik seiring kemitraan
terbentuk; memperdalam granularitas dari provinsi ke kabupaten/kota.

**Faktor pembeda.** Pertama, data lineage eksplisit sebagai bagian model
keputusan — bukan disclaimer. Hampir tidak ada dashboard pangan publik yang
membedakan real-time, rilis resmi, forecast, dan belum tersedia pada level
output, lengkap dengan skor confidence yang tidak dibulatkan. Kedua, granularitas
34 provinsi yang menyingkap disparitas riil 42 persen — informasi yang tidak
tersedia di panel harga mana pun saat ini. Ketiga, keluaran berupa aksi dengan
pemilik, tenggat, dan KPI, bukan sekadar grafik. Keempat, arsitektur modular yang
memungkinkan sumber data baru ditambahkan tanpa merombak sistem.

**Mengapa sulit ditiru cepat.** Tampilan dapat disalin dalam hitungan minggu;
yang sulit adalah disiplin pelabelan sumber yang membuat institusi berani
memakainya, pipeline yang tetap berjalan setiap hari melintasi empat sumber
berbeda, dan akumulasi data historis lintas sumber. Bukti ketertarikan pihak
eksternal belum ada dan tidak kami klaim.

---

## ATTACHMENT

**VIDEO SUBMISSION** (YouTube, maks. 180 detik, 1080p, 16:9, subtitle
disarankan): `[ISI LINK YOUTUBE]`

**FILE ATTACHMENT (PDF, maks. 5MB, nama file "P0684 - <Judul Proposal>")**:
`submission_attachments/P0684 - Kepang AI Lampiran Submission Tahap 3.pdf` —
berisi progress log, bukti integrasi terverifikasi, arsitektur sistem, data
source matrix, screenshot produk, dan gap yang dinyatakan terbuka.

**LINK ATTACHMENT** (satu link, dapat diakses publik tanpa izin tambahan):
`https://pidi-seven.vercel.app` — deploy publik live. Backend:
`https://kepang-ai-api.onrender.com`. Repo: `https://github.com/julianraus/pidi`.

**CV ATTACHMENT**: `[ISI link LinkedIn/CV tiap anggota]`

---

## Catatan Pengisian

- Isi seluruh bagian `[CEK]` sebelum submit — Team ID, nama anggota, link video,
  link CV.
- **Cocokkan angka dengan aplikasi live sesaat sebelum submit.** Skor 54, defisit
  3/6, median Rp15.950, disparitas 42 persen, confidence 68 persen.
- Nada jawaban sengaja jujur tentang keterbatasan karena guideline melarang klaim
  tanpa bukti. Kekuatan submission ini bukan mengklaim sudah tervalidasi, tapi
  menunjukkan **temuan orisinal dari sistem sendiri** yang dapat diverifikasi
  juri langsung di aplikasi.
- Bila wawancara BI selesai sebelum deadline, perbarui bagian *Validated User
  Problem* dan *User Flow* dengan temuan dan kutipan nyata, lalu turunkan
  pernyataan keterbatasannya.
