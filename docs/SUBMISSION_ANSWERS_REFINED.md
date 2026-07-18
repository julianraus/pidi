# Jawaban Submission Tahap 2 - Kepang AI

Dokumen ini disusun agar jawaban form selaras dengan guidebook Submission
Tahap 2. Bagian bertanda `[ISI ...]` perlu dilengkapi oleh tim sebelum submit.

## Sumber Data Narasi

- BPS, rilis 2 Juni 2026: inflasi Mei 2026 sebesar 3,08% yoy, 0,28% mtm, dan 1,35% ytd.  
  https://www.bps.go.id/id/pressrelease/2026/06/02/2579/inflasi-year-on-year--y-on-y--pada-mei-2026-sebesar-3-08-persen-.html
- Antara mengutip BPS, 2 Juni 2026: volatile food Mei 2026 sebesar 6,24% yoy; komoditas pendorong antara lain cabai merah, minyak goreng, bawang merah, tomat, dan beras.  
  https://www.antaranews.com/berita/5590715/bps-kenaikan-bbm-nonsubsidi-dorong-inflasi-transportasi-061-persen
- Bank Indonesia, RDG 19-20 Mei 2026: BI-Rate menjadi 5,25%; USD/IDR Rp17.700 pada 19 Mei 2026, melemah 2,20% ptp dibanding akhir April 2026.  
  https://www.bi.go.id/id/publikasi/ruang-media/news-release/Pages/sp_2810726.aspx
- BMKG Open Data: prakiraan cuaca 3 hari, interval 3 jam, update 2 kali sehari, API berbasis kode wilayah adm4.  
  https://data.bmkg.go.id/prakiraan-cuaca
- Bapanas Renstra 2025-2029: produksi pangan terpusat di Jawa-Sumatera, wilayah lain dapat defisit, dan logistik kepulauan memicu disparitas harga.  
  https://peraturan.go.id/filespengundangan/peraturan-bapanas-no-9-tahun-2025.pdf

## ID Tim

[ISI ID TIM SESUAI PENDAFTARAN]

## Nama Tim

J4

## Proposal Title

Kepang AI: Decision Intelligence untuk Resiliensi Ketahanan Pangan Daerah

## Team Composition

Julian Raus sebagai Ketua Tim dan Product Lead, bertanggung jawab atas arah
produk, validasi masalah, dan strategi implementasi. Wiennetou Joel sebagai
Backend Engineer, berfokus pada API, database, dan integrasi data. Jati Kusuma
sebagai Frontend Engineer, berfokus pada dashboard, visualisasi, dan UX
institusional. Jonathan Wibowo sebagai Data/AI Engineer, berfokus pada data
processing, risk scoring, forecasting, dan logika rekomendasi. Komposisi ini
menutup kebutuhan end-to-end: produk, data, backend, frontend, dan implementasi.

## Executive Summary

Kepang AI adalah prototype decision intelligence untuk memperkuat ketahanan
pangan daerah. Masalah utama yang diselesaikan adalah policy lag: harga, stok,
cuaca, logistik, dan tekanan rupiah sering dianalisis terpisah sehingga
intervensi terlambat. Kepang AI menggabungkan data resmi BPS/BI, BI Harga
Pangan, BMKG, supply-demand, dan rute logistik menjadi Resilience Score,
scenario planning, data lineage, dan rekomendasi aksi. Urgensinya meningkat saat
rupiah melemah karena imported inflation, energi, dan biaya distribusi dapat
menekan volatile food. Dampak yang ditargetkan adalah mempercepat identifikasi
wilayah defisit, memperjelas prioritas stok, dan membuat keputusan pangan lebih
resilient sebelum tekanan harga menjadi krisis.

## Problem Statement

Bagaimana membantu pemangku kebijakan pangan daerah mengambil keputusan yang
lebih cepat, terukur, dan resilient ketika harga pangan, pasokan, cuaca,
logistik, dan tekanan rupiah berubah bersamaan?

## Primary Sub-Problem Statement

Sub-problem utama: Digitalisasi Ketahanan Pangan.

Fokus turunannya:

- Fragmentasi data harga, stok, supply-demand, cuaca, dan logistik lintas lembaga.
- Policy lag dalam memutuskan operasi pasar, pre-positioning stok, dan redistribusi.
- Lemahnya transparansi antara data asli, rilis resmi, forecast, dan data yang belum tersedia.
- Keterbatasan scenario planning saat rupiah melemah dan biaya pangan menjadi lebih rentan.

## Problem Validation

Masalah inti yang kami selesaikan adalah keterlambatan keputusan pangan akibat
data yang tersebar dan belum diterjemahkan menjadi rekomendasi operasional.
Harga harian dapat terlihat, tetapi penyebabnya belum otomatis terhubung dengan
stok, cuaca, distribusi, kurs, dan rute logistik.

Validasinya terlihat dari data terbaru. BPS mencatat inflasi Mei 2026 sebesar
3,08% yoy dan 0,28% mtm. Antara mengutip BPS bahwa volatile food mencapai 6,24%
yoy, dengan tekanan dari cabai merah, minyak goreng, bawang merah, tomat, dan
beras. BI juga mencatat rupiah Rp17.700 per dolar AS pada 19 Mei 2026, melemah
2,20% ptp dibanding akhir April. Di sisi struktural, Renstra Bapanas 2025-2029
menjelaskan produksi pangan masih terpusat di Jawa-Sumatera, sementara wilayah
non-sentra sering menghadapi defisit dan biaya distribusi tinggi.

## Problem-Solution Mapping

| Problem | Mekanisme Solusi | Outcome |
|---|---|---|
| Data pangan terfragmentasi | Integrasi harga, supply-demand, cuaca, makro, dan logistik dalam satu cockpit | Pengambil keputusan melihat penyebab risiko, bukan hanya gejala harga |
| Policy lag | Early warning, Resilience Score, action card, dan rekomendasi redistribusi | Intervensi stok, operasi pasar, atau mitigasi panen dapat dimulai lebih cepat |
| Rupiah melemah dan imported inflation | Scenario planning kurs, eksposur komoditas impor, dan biaya logistik | Keputusan lebih resilient terhadap shock eksternal |
| Ketidakjelasan kualitas data | Data lineage: real-time, official-release, forecast, unavailable | Klaim data lebih jujur dan dapat diaudit |
| Rute logistik belum optimal | Ranking rute, estimasi volume, ETA/jarak Google bila tersedia, dan expected partner data | Distribusi dari surplus ke defisit lebih terarah |

## Ecosystem Alignment

Kepang AI memperkuat ekosistem yang sudah ada, bukan menggantikan regulator.
Pengguna utamanya adalah TPID, Bapanas, Bulog, BI regional, dinas pangan,
pemerintah daerah, BMKG, BPS, dan mitra logistik. Data resmi tetap menjadi
rujukan, sedangkan Kepang AI menjadi layer analitik dan rekomendasi. Solusi ini
selaras dengan stabilisasi pasokan dan harga pangan, Cadangan Pangan Pemerintah,
fasilitasi distribusi pangan, dan pengendalian inflasi daerah. Dari sisi
regulasi, prototype tidak memakai data personal dan membedakan data publik,
forecast, serta data operasional yang butuh perjanjian berbagi data. Setiap
insight dilengkapi sumber, timestamp, dan status data agar dapat diaudit.

## Solution Approach & Mechanism

Kepang AI bekerja dari data menuju aksi. Data masuk dari BI Harga Pangan/Bapanas
untuk harga, BMKG untuk cuaca, BPS/BI untuk rilis makro, serta database
operasional untuk supply-demand dan logistik. Backend menormalisasi data,
menyimpan sumber dan freshness, lalu menghitung neraca surplus-defisit, tren
harga, risiko cuaca, tekanan volatile food, eksposur rupiah, dan skor rute
logistik. Modul forecasting menghasilkan Resilience Score, pressure breakdown,
skenario shock, dan action plan. Frontend menampilkan cockpit keputusan:
wilayah prioritas, komoditas rentan, rute redistribusi, KPI target, dan data
lineage. Jika data asli belum tersedia, sistem menandainya sebagai forecast atau
unavailable dan menampilkan field data produksi yang diperlukan.

## Impact Scale & Targets

Dampak utama adalah memperkuat ketahanan pangan melalui keputusan yang lebih
cepat dan tahan shock. MVP memantau 6 wilayah agregasi dan 8 komoditas
strategis. Target pilot adalah membantu 1-3 institusi/daerah mengidentifikasi
wilayah defisit, risiko harga, dan opsi redistribusi dalam satu workflow.
Target kuantitatif awal: waktu identifikasi wilayah prioritas turun minimal 50%,
top intervention dapat ditemukan di bawah 3 menit, rekomendasi redistribusi
menurunkan gap pasokan wilayah prioritas minimal 30% dalam simulasi, dan rute
logistik memberi potensi efisiensi biaya 5-10% setelah data mitra divalidasi.
Skala lanjutan adalah 38 provinsi, 514 kabupaten/kota, dan integrasi gudang
serta rute aktual.

## Impact Measurement

Keberhasilan diukur melalui KPI kuantitatif:

- Jumlah wilayah, komoditas, dan sumber data yang aktif.
- Time-to-insight: durasi pengguna menemukan wilayah prioritas dan penyebab risiko.
- Intervention lead time: jarak waktu dari alert ke keputusan aksi.
- Akurasi forecast harga atau risk score, misalnya MAPE dan precision alert.
- Penurunan simulated supply gap pada wilayah defisit.
- Estimasi penurunan biaya logistik per ton setelah optimasi.
- Persentase insight yang memiliki data lineage lengkap.
- Jumlah rekomendasi yang divalidasi oleh stakeholder.
- Jumlah pengguna aktif dan rapat koordinasi yang memakai output Kepang AI.

## System & Public Value Proposition

Kepang AI memberikan nilai publik karena mengurangi policy lag pada sistem
pangan. Dalam kondisi normal, platform membantu monitoring harga, pasokan,
cuaca, dan distribusi. Dalam kondisi shock seperti rupiah melemah, cuaca
ekstrem, atau biaya energi naik, platform membantu menentukan komoditas yang
paling rentan, wilayah yang perlu buffer stok, dan rute yang paling realistis.
Nilainya bukan hanya untuk satu pengguna, tetapi untuk koordinasi sistem:
keputusan lebih cepat, transparansi sumber data meningkat, operasi pasar lebih
tepat sasaran, dan keterjangkauan pangan masyarakat lebih terlindungi.

## Solution Originality

Kebaruan Kepang AI adalah mengubah dashboard pangan menjadi decision cockpit.
Banyak platform berhenti pada pemantauan harga atau publikasi data historis.
Kepang AI menghubungkan harga, supply-demand, cuaca, logistik, dan tekanan
makro menjadi rekomendasi: wilayah mana diprioritaskan, stok dari mana
dipindahkan, rute mana dipilih, dan KPI apa yang harus dicapai. Pembedanya juga
ada pada scenario-based decision saat rupiah melemah. Sistem tidak hanya
menyatakan harga naik, tetapi membantu memahami risiko imported inflation,
komoditas yang rentan, dan tindakan mitigasi untuk menjaga resiliensi pangan.

## Technological / Method Innovation

Pendekatan teknis Kepang AI menggabungkan source-aware data pipeline,
forecasting, anomaly detection, risk scoring, scenario simulation, dan route
recommendation. Inovasi metodologinya adalah data lineage sebagai bagian dari
model keputusan: setiap output diberi status real-time, official-release,
forecast, atau unavailable. Modul BI/BMKG scraper/API dipakai ketika endpoint
tersedia; jika tidak, sistem tidak membuat data palsu. Modul logistik dapat
memakai Google Routes API untuk ETA/jarak rute jalan, tetapi tetap menandai
biaya, kapasitas, dan rute laut sebagai kebutuhan data mitra. Dengan demikian,
prototype menyeimbangkan kecerdasan model dan kejujuran data.

## Creativity in Implementation

Kreativitas implementasi ada pada Resilience Room: satu ruang kerja yang
memadukan score, skenario rupiah, eksposur imported inflation, prioritas
tindakan, dan data lineage. Distribusi produk dirancang melalui pilot
institusional, bukan aplikasi konsumen massal, karena user sebenarnya adalah
analis dan operator kebijakan. Monetisasi juga kreatif: Kepang AI tidak menjual
data publik mentah, tetapi menjual intelligence layer, integrasi workflow,
managed analytics, API risk score, dan modul logistik/backhaul. Engagement
pengguna dibangun lewat action cards yang memiliki owner, timeframe, dan KPI.

## System Architecture

Arsitektur Kepang AI terdiri dari React/Vite frontend, Node.js/Express backend,
PostgreSQL/Supabase sebagai database, Redis opsional untuk cache, serta service
modular untuk harga pangan, cuaca BMKG, logistik, supply-demand, dan AI
forecasting. Data eksternal masuk melalui API/scraper, dinormalisasi, lalu
disimpan dengan source label dan timestamp. Backend menyediakan endpoint untuk
Dashboard, Resilience Room, Supply-Demand, Food Inflation, Logistics, Weather,
dan AI Forecast. Frontend menyajikan cockpit analitik dan tabel data lineage.
Pada production, arsitektur dapat ditambah scheduler, role-based access,
monitoring, backup, dan data-sharing connector untuk Bulog/Bapanas/mitra
logistik.

## Data & Feasibility

Data yang sudah feasible: BPS/BI official release untuk makro dan inflasi,
BMKG Open Data untuk prakiraan cuaca, serta BI Harga Pangan scraper/API melalui
endpoint grid yang sudah diuji di prototype. Data yang masih membutuhkan
kemitraan: stok gudang, supply-demand granular, kapasitas carrier, biaya per
ton aktual, congestion pelabuhan, dan shipment history. Prototype memakai seed
database hanya untuk demo struktur data dan tidak mengklaimnya sebagai data
asli. Jika data belum tersedia, halaman Resilience Room menampilkan status
forecast atau unavailable serta expected production fields. Feasibility tinggi
karena MVP bisa berjalan dengan data publik, lalu ditingkatkan melalui pilot
institusional.

## Security & Compliance

Kepang AI menerapkan prinsip minimal data access. Kunci API dan database
disimpan sebagai environment variable, bukan di frontend. Backend memakai CORS,
Helmet, rate limiting, validasi input, dan rencana role-based access. Prototype
tidak memproses data personal; fokusnya data publik dan data operasional
agregat. Untuk produksi, data stok atau logistik non-publik harus memakai
perjanjian berbagi data, audit log, backup, enkripsi koneksi, pembatasan akses
berbasis peran, dan review kepatuhan. Setiap rekomendasi harus dapat ditelusuri
ke sumber data, metode, timestamp, dan status kualitas data.

## Implementation Readiness (MVP)

Status MVP saat ini adalah prototype web end-to-end. Modul yang sudah ada:
Resilience Room, Dashboard, Supply-Demand Matching, Food Inflation Monitor,
Smart Food Logistics, Weather Risk, AI Forecasting, backend API, schema
PostgreSQL, seed data, BI scraper service, BMKG service, data lineage, dan
rekomendasi logistik dengan Google Maps optional. Scope MVP berikutnya adalah
validasi lapangan, peningkatan data riil harga/cuaca, integrasi stok/logistik
mitra, user roles, serta deployment production setelah hosting diselesaikan.

## Value Proposition

Nilai utama bagi pengguna adalah keputusan pangan yang lebih cepat, presisi,
dan resilient. TPID/pemda dapat melihat wilayah defisit, penyebab tekanan
harga, dan prioritas intervensi tanpa menggabungkan spreadsheet manual. Bapanas
dan Bulog dapat melihat rekomendasi stok dan redistribusi. BI regional mendapat
evidence untuk koordinasi inflasi pangan. Mitra logistik dapat melihat rute
prioritas dan kebutuhan kapasitas. Bagi masyarakat, nilai tidak langsungnya
adalah harga pangan yang lebih stabil, distribusi yang lebih merata, dan respons
kebijakan yang lebih dini saat rupiah, cuaca, atau logistik memberi tekanan.

## Model Revenue / Funding

Model pendapatan utama adalah B2G/institutional SaaS. Paket dasar berupa lisensi
tahunan dashboard berdasarkan jumlah wilayah, pengguna, komoditas, dan modul.
Pendapatan kedua berasal dari implementation fee untuk setup, integrasi data,
training, dan custom workflow. Pendapatan lanjutan berasal dari managed
analytics report bulanan, API subscription untuk risk score/anomaly signal, dan
logistics add-on untuk optimasi rute, backhaul, serta matching kapasitas. Pada
tahap awal, pendanaan dapat berasal dari grant, pilot project, CSR inovasi, atau
kerja sama institusional. Profitabilitas datang dari recurring revenue dan
replikasi modul inti ke banyak wilayah tanpa membangun ulang dari nol.

## Cost Structure & Sustainability

Biaya utama mencakup pengembangan produk, cloud/server, database, API/scraper,
data cleaning, model AI, keamanan, monitoring, dokumentasi, support, training,
dan business development. Pada MVP, biaya ditekan dengan data publik, arsitektur
modular, dan pilot terbatas. Pada produksi, biaya naik untuk SLA, akses kontrol,
audit, integrasi data mitra, dan customer success. Keberlanjutan finansial
ditopang lisensi tahunan, implementation fee, managed analytics, dan API add-on.
Karena software dapat direplikasi, margin membaik saat jumlah wilayah dan modul
bertambah.

## Scalability

Skalabilitas dilakukan bertahap. Dari MVP 6 wilayah agregasi, sistem dapat
ditingkatkan ke 34 provinsi dan 514 kabupaten/kota dengan memperluas master
data wilayah, pipeline harga/cuaca, dan konektor stok/logistik. Arsitektur
backend modular membuat setiap sumber data dapat ditambah tanpa mengubah
seluruh aplikasi. Secara teknis, platform dapat memakai scheduler, cache,
queue, data warehouse, monitoring, dan role-based access. Secara institusional,
pilot daerah dapat menjadi dashboard koordinasi nasional, lalu diperluas ke
komoditas baru, gudang, notifikasi, API, dan modul logistik mitra.

## Partnership & Distribution

Distribusi awal dilakukan melalui pilot dengan TPID, pemda, Bapanas, Bulog,
atau BI regional. BMKG, BPS, BI, dan Bapanas menjadi sumber data referensi.
Bulog, dinas pangan, operator pelabuhan, carrier, dan warehouse partner
dibutuhkan untuk validasi stok serta logistik aktual. Pendekatan masuk pasar
adalah demo dashboard, evidence pack, use case wilayah defisit, dan laporan
risiko bulanan. Setelah pilot, distribusi diperluas melalui jejaring
pengendalian inflasi daerah, asosiasi logistik, koperasi/aggregator pangan, dan
program digitalisasi pangan.

## Problem-Market Fit

Masalah ini penting karena target pengguna menghadapi konsekuensi langsung:
inflasi naik, daya beli turun, biaya intervensi membesar, dan kepercayaan
publik melemah. Kebutuhan mereka bukan dashboard cantik, tetapi alat kerja yang
mengubah data menjadi keputusan: apa masalahnya, wilayah mana prioritas, siapa
owner-nya, dan KPI apa yang harus dikejar. Saat rupiah melemah, kebutuhan ini
makin kuat karena biaya impor, energi, dan logistik dapat menekan pangan lebih
cepat.

## Evidence of Demand

Evidence of demand berasal dari kombinasi data publik dan kebutuhan
institusional. BPS mencatat inflasi Mei 2026 sebesar 3,08% yoy dan 0,28% mtm;
kelompok makanan, minuman, dan tembakau menjadi pendorong inflasi bulanan, dan
volatile food mencapai 6,24% yoy. BI mencatat rupiah Rp17.700 per dolar AS pada
19 Mei 2026 dan menaikkan BI-Rate menjadi 5,25% untuk memperkuat stabilisasi
nilai tukar dan inflasi. Bapanas dalam Renstra 2025-2029 menempatkan penguatan
cadangan, logistik, distribusi, stabilisasi pasokan-harga, dan daerah rentan
rawan pangan sebagai misi utama. BMKG juga sudah menyediakan prakiraan cuaca
granular yang dapat diolah menjadi early warning. Ini membuktikan bahwa
stakeholder pangan membutuhkan sistem yang tidak hanya memonitor data, tetapi
menghubungkan harga, cuaca, stok, logistik, dan rupiah menjadi rekomendasi aksi
yang cepat dan auditable.

## Target Market

Target market utama adalah institusi yang bertanggung jawab pada pangan dan
inflasi: TPID, pemerintah daerah, dinas pangan, Bapanas, Bulog, dan BI regional.
Target sekunder adalah operator logistik pangan, agregator komoditas, koperasi,
pelabuhan, bank pembiayaan sektor pangan, dan asuransi pertanian. Segmen awal
paling realistis adalah daerah dengan volatile food tinggi, ketergantungan
pasokan antarwilayah, atau disparitas harga besar. Mereka memiliki pain yang
jelas dan dapat menguji manfaat early warning serta rekomendasi redistribusi.

## Adoption Readiness

Adopsi relatif mudah karena Kepang AI berupa web dashboard dan decision-support
tool, bukan sistem pengganti total. Pengguna dapat mulai dari data publik dan
pilot 6 wilayah, lalu menambah data operasional saat kerja sama tersedia.
Hambatan adopsi adalah akses stok granular, validasi rekomendasi lapangan, dan
kepercayaan terhadap model. Karena itu, prototype menampilkan data lineage,
expected data fields, owner tindakan, timeframe, dan KPI agar rekomendasi dapat
dievaluasi, bukan diterima buta.

## Progress Since the 1st Submission

Sejak submission pertama, Kepang AI berkembang dari konsep menjadi prototype
web end-to-end. Tim membangun frontend dashboard, backend API, database schema,
seed data, modul supply-demand, pemantauan inflasi, weather risk, optimasi
logistik, AI forecasting, BI price scraper, BMKG service, dan data lineage.
Arah solusi juga dipertajam: dari monitoring pangan menjadi decision
intelligence untuk resiliensi pangan, dengan skenario rupiah melemah,
prioritas tindakan, rekomendasi redistribusi, dan business model B2G SaaS.

## Current Status

Prototype web. Core modules sudah berjalan lokal dengan backend, database,
dashboard, forecasting, data lineage, dan rekomendasi logistik. Hosting produksi
ditunda untuk fokus pengembangan dan validasi.

## Attachment

Lampiran yang disarankan:

- Screenshot Resilience Room, Logistics Recommendation, dan Evidence Room.
- Diagram arsitektur sistem.
- Data source and forecasting policy.
- Test report MVP.
- Pitch deck/demo link/repository.
- Ringkasan interview plan dan market validation.

Nama file PDF: `[ID Tim] - Kepang AI Decision Intelligence untuk Resiliensi Ketahanan Pangan Daerah.pdf`

## Link Attachment

[ISI LINK DEMO, VIDEO WALKTHROUGH, REPOSITORY, ATAU FOLDER LAMPIRAN YANG DAPAT DIAKSES PANITIA]
