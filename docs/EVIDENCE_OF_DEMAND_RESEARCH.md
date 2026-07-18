# Evidence of Demand Research

Tanggal riset: 4 Juni 2026. Dokumen ini merangkum bukti kebutuhan nyata
Kepang AI berdasarkan problem publik, kebutuhan institusional, dan kecocokan
solusi dengan workflow calon pengguna.

## Thesis

Demand untuk Kepang AI muncul karena masalah ketahanan pangan Indonesia bukan
hanya "kurang dashboard", tetapi keterlambatan keputusan saat data harga,
cuaca, stok, logistik, dan tekanan makro tidak terbaca sebagai satu sistem.
Dalam kondisi rupiah melemah dan volatile food meningkat, stakeholder pangan
membutuhkan decision-support tool yang bisa mengubah sinyal data menjadi
prioritas aksi.

## Real Problem Evidence

| Evidence | Source | Why It Shows Demand |
|---|---|---|
| Inflasi Mei 2026 mencapai 3,08% yoy dan 0,28% mtm | BPS, 2 Juni 2026 | Stabilitas harga masih menjadi isu aktual, bukan problem hipotetis |
| Kelompok makanan, minuman, dan tembakau menjadi pendorong inflasi bulanan; volatile food mencapai 6,24% yoy | Antara mengutip BPS, 2 Juni 2026 | Komoditas pangan strategis masih memberi tekanan nyata ke inflasi |
| Rupiah Rp17.700 per dolar AS pada 19 Mei 2026, melemah 2,20% ptp; BI menaikkan BI-Rate ke 5,25% untuk stabilisasi nilai tukar dan inflasi | Bank Indonesia, RDG 19-20 Mei 2026 | Shock kurs meningkatkan kebutuhan scenario planning dan mitigasi imported inflation |
| Impor Januari-Februari 2026 mencapai US$42,09 miliar, naik 14,44% yoy | BPS, 1 April 2026 | Pelemahan rupiah dapat memperbesar biaya impor, energi, input produksi, dan logistik |
| Harga beras premium dan medium di penggilingan naik pada Mei 2026 | BPS NTP, 2 Juni 2026 | Tekanan harga menyentuh komoditas pangan utama, bukan hanya komoditas pinggiran |
| Bapanas menargetkan penguatan ketersediaan, cadangan, logistik, distribusi, stabilisasi pasokan dan harga, serta penanganan daerah rentan rawan pangan | Renstra Bapanas 2025-2029 | Problem yang diselesaikan Kepang AI selaras dengan mandat institusional |
| Bencana, banjir, kekeringan, dan perubahan iklim berdampak pada ketersediaan serta akses pangan; banjir Jan-Apr 2023 berdampak pada 113.792,8 ha dan 48.701,13 ha puso | Renstra Bapanas 2025-2029 | Cuaca dan risiko produksi perlu masuk ke sistem keputusan pangan |
| BMKG menyediakan prakiraan cuaca kelurahan/desa 3 hari, interval 3 jam, update 2 kali sehari | BMKG Open Data | Ada data publik yang bisa dihubungkan ke early warning pangan |
| Kelembagaan pangan daerah tersebar di 38 provinsi dan 514 kabupaten/kota dengan nomenklatur beragam | Renstra Bapanas 2025-2029 | Fragmentasi institusional memperkuat kebutuhan cockpit bersama dan standar data |

## Interpretation

Evidence di atas menunjukkan tiga demand driver:

1. **Demand makroekonomi**: volatile food dan rupiah melemah menciptakan
   kebutuhan untuk keputusan yang lebih resilient, bukan reaktif.
2. **Demand operasional**: surplus-defisit wilayah, stok, cuaca, dan rute
   distribusi harus dibaca bersama agar intervensi tidak terlambat.
3. **Demand institusional**: banyak aktor menangani pangan, sehingga mereka
   butuh satu language of decision: sumber data, status risiko, rekomendasi,
   owner, timeframe, dan KPI.

## Why Existing Process Is Painful

Calon pengguna seperti TPID, dinas pangan, Bulog, Bapanas, dan BI regional
umumnya tidak kekurangan data publik. Pain utamanya adalah:

- Data harga, cuaca, stok, dan logistik berada di kanal berbeda.
- Rilis resmi BPS/BI memberi konteks makro, tetapi tidak langsung memberi
  rekomendasi operasional per wilayah.
- Data BMKG tersedia granular, tetapi perlu diterjemahkan menjadi risiko panen
  atau risiko pasokan.
- Data stok gudang, kapasitas carrier, dan biaya logistik aktual biasanya bukan
  open data, sehingga perlu integrasi mitra.
- Pengambil keputusan butuh jawaban cepat: wilayah mana prioritas, komoditas
  mana rentan, stok dari mana dialihkan, dan KPI apa yang membuktikan sukses.

## How Kepang AI Solves The Demand

| Demand / Pain | Kepang AI Mechanism | Outcome |
|---|---|---|
| Harga pangan bergerak dan volatile food tinggi | Food Inflation Monitor + anomaly signal + commodity risk | Pengguna tahu komoditas mana yang harus diprioritaskan |
| Rupiah melemah dan imported inflation naik | Scenario shock rupiah + import exposure | Keputusan stok dan intervensi mempertimbangkan shock kurs |
| Stok/pasokan tidak terbaca lintas wilayah | Supply-Demand Matching + deficit/surplus map | Redistribusi bisa diprioritaskan dari wilayah surplus ke defisit |
| Cuaca ekstrem mengganggu produksi | BMKG-based Weather Risk Engine | Early warning panen masuk ke rencana stok/logistik |
| Logistik kepulauan mahal dan kompleks | Route recommendation + Google ETA/jarak optional + expected partner data | Rute dan volume distribusi lebih terarah, dengan klaim data yang jujur |
| Data source tidak seragam | Data lineage: real-time, official-release, forecast, unavailable | Trust meningkat karena setiap insight bisa diaudit |
| Rapat koordinasi butuh keputusan cepat | Action cards: owner, timeframe, KPI | Insight berubah menjadi keputusan operasional |

## Evidence of Demand - Ready-to-Paste Answer

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

## Stronger Argument For Submission

Kepang AI dibutuhkan karena problem publiknya sudah nyata dan berulang:
volatile food menekan inflasi, kurs rupiah memengaruhi biaya impor/energi,
cuaca mengganggu produksi, dan distribusi antarwilayah tidak selalu seimbang.
Tanpa sistem terintegrasi, respons kebijakan cenderung tertinggal karena
stakeholder harus membaca banyak sumber data secara manual. Kepang AI menjawab
gap tersebut melalui decision cockpit yang mengubah sinyal menjadi keputusan:
Resilience Score, peta surplus-defisit, scenario planning rupiah, weather risk,
route recommendation, action card, dan data lineage. Dengan begitu, aplikasi
ini tidak menggantikan lembaga yang ada, tetapi mempercepat koordinasi TPID,
Bapanas, Bulog, BI regional, dinas pangan, dan mitra logistik.

## Validation Plan To Strengthen Demand

Riset desk research sudah cukup untuk menunjukkan urgensi masalah. Namun agar
Evidence of Demand lebih kuat, lakukan validasi lapangan ringan:

- Target 5-10 interview.
- Responden: TPID/pemda, dinas pangan, Bulog/logistik, BI regional, pedagang
  komoditas, operator gudang/carrier.
- Bukti yang dicari: proses kerja manual, waktu analisis, sumber data yang
  dipakai, bottleneck keputusan, willingness to pilot, dan KPI adopsi.

## Interview Questions

1. Data apa yang Anda cek sebelum memutuskan intervensi pangan?
2. Bagian mana dari proses hari ini yang paling lambat?
3. Apakah data harga, cuaca, stok, dan logistik sudah terbaca dalam satu workflow?
4. Saat rupiah melemah, komoditas apa yang paling Anda khawatirkan?
5. Bagaimana Anda menentukan wilayah prioritas untuk operasi pasar atau stok?
6. Data apa yang paling sulit didapat: stok gudang, permintaan, rute, kapasitas, atau biaya?
7. Apakah action card dengan owner, timeframe, dan KPI akan membantu rapat koordinasi?
8. Apa syarat agar rekomendasi AI dipercaya?
9. KPI apa yang membuat solusi ini layak dipakai: waktu analisis, biaya logistik, akurasi alert, atau stabilisasi harga?
10. Apakah instansi/organisasi Anda bersedia mengikuti pilot terbatas?

## Source Links

- BPS Inflasi Mei 2026: https://www.bps.go.id/id/pressrelease/2026/06/02/2579/inflasi-year-on-year--y-on-y--pada-mei-2026-sebesar-3-08-persen-.html
- Antara/BPS volatile food Mei 2026: https://www.antaranews.com/berita/5590715/bps-kenaikan-bbm-nonsubsidi-dorong-inflasi-transportasi-061-persen
- BI RDG Mei 2026: https://www.bi.go.id/id/publikasi/ruang-media/news-release/Pages/sp_2810726.aspx
- BPS Ekspor-Impor Februari 2026: https://www.bps.go.id/assets/pressrelease/2026/04/01/2557/ekspor-dan-impor-indonesia-februari-2026-masing-masing-tercatat-usd-22-17-miliar-dan-usd-20-89-miliar-.html
- BPS NTP Mei 2026: https://www.bps.go.id/id/pressrelease/2026/06/02/2580/nilai-tukar-petani--ntp--mei-2026-sebesar-127-73-atau-naik-1-99-persen.html
- BMKG Open Data: https://data.bmkg.go.id/prakiraan-cuaca
- Bapanas Renstra 2025-2029: https://peraturan.go.id/filespengundangan/peraturan-bapanas-no-9-tahun-2025.pdf
