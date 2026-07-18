# Kepang AI Product Audit and Improvement Notes

Dokumen ini merangkum audit prototype setelah submission PDF final. Fokus audit:
kesesuaian dengan narasi submission, kesiapan demo, UI/UX untuk calon user
institusional, dan gap menuju pilot.

## Ringkasan Temuan

Kepang AI sudah memiliki fondasi teknis yang kuat untuk hackathon: frontend
React/Vite, backend Express, database PostgreSQL/Supabase, modul harga, cuaca,
supply-demand, logistik, forecasting, dan Evidence Room.

Gap terbesar sebelum perbaikan bukan pada jumlah fitur, tetapi pada cara fitur
itu terasa saat dipakai. Submission menjual Kepang AI sebagai decision
intelligence platform, sementara beberapa layar masih terasa seperti dashboard
monitoring biasa. Karena itu, perbaikan diprioritaskan pada:

- first impression dashboard,
- kejelasan status data,
- interaktivitas evidence/business model,
- fallback yang jujur saat backend atau sumber data belum aktif,
- penyelarasan dengan narasi ketahanan pangan, rupiah melemah, dan resiliensi
  keputusan.

## Persona dan Kebutuhan UX

Target user utama bukan konsumen umum, melainkan operator dan analis
institusional:

- TPID/pemda/dinas pangan yang perlu tahu wilayah dan komoditas prioritas.
- Bapanas/Bulog yang perlu menentukan buffer stok dan redistribusi.
- BI regional yang membutuhkan evidence untuk koordinasi inflasi pangan.
- Mitra logistik/gudang/carrier yang perlu melihat rute, kapasitas, dan biaya.

Implikasi UX:

- Layar harus padat tetapi mudah dipindai.
- User perlu melihat tindakan, owner, timeframe, dan KPI, bukan hanya grafik.
- Semua data perlu diberi label sumber/status.
- Forecast harus terlihat sebagai forecast, bukan data asli.
- Saat backend offline, demo tetap boleh berjalan, tetapi harus jelas sebagai
  forecast/offline mode.

## Perbaikan yang Dilakukan

### 1. Dashboard menjadi ruang keputusan

Dashboard sekarang dibuka sebagai halaman default. Bagian atas ditambah:

- Decision brief.
- Resilience Score.
- owner/timeframe/KPI untuk action prioritas.
- Source Confidence.
- label Forecast/offline mode saat backend belum aktif.

Tujuannya agar juri atau calon user langsung melihat nilai utama Kepang AI:
mempercepat keputusan pangan yang lintas data.

### 2. Market & Evidence Room dibuat interaktif

Evidence Room diganti menjadi Market & Evidence Room dengan empat tab:

- Demand.
- Data Trust.
- Business Case.
- Pilot Roadmap.

Tab Demand memetakan bukti masalah ke fitur Kepang AI. Tab Data Trust
menunjukkan status data real-time-capable, official-release, forecast, dan
unavailable. Tab Business Case berisi calculator revenue/expense. Tab Roadmap
menjelaskan tahap pilot, scale, dan expansion.

### 3. Business model selaras dengan submission

Business calculator sekarang memuat asumsi:

- klien lisensi aktif,
- lisensi bulanan,
- klien setup baru,
- setup fee,
- managed analytics,
- API/logistics partner,
- fixed cost awal,
- direct cost.

Default break-even diselaraskan dengan submission: sekitar 6 klien standar
aktif dengan kontribusi recurring sekitar Rp192 juta per klien per tahun.

### 4. Fallback data dibuat lebih jujur

Sebelum perbaikan, jika backend tidak berjalan, dashboard terlihat kosong.
Sekarang dashboard tetap dapat dipakai untuk demo dengan fallback yang jelas
ditandai sebagai forecast/offline mode. Ini menjaga presentasi tetap utuh tanpa
mengklaim data fallback sebagai real-time.

## Gap yang Masih Perlu Dikembangkan

### Data production

Masih perlu integrasi data produksi untuk:

- stok gudang,
- produksi aktual,
- demand per wilayah,
- kapasitas carrier,
- biaya per ton aktual,
- lead time aktual,
- data pelabuhan/kepadatan,
- timestamp dan source owner per dataset.

### UX berikutnya

Prioritas UI/UX lanjutan:

- error boundary agar app tidak blank bila ada runtime error,
- lazy loading per page agar bundle lebih kecil,
- role-based view untuk TPID, Bulog, BI regional, dan mitra logistik,
- detail drill-down action card,
- saved scenario untuk simulasi rupiah/cuaca/logistik,
- export action brief ke PDF atau CSV,
- route comparison table yang dapat difilter per komoditas dan mode transport.

### Backend berikutnya

Prioritas backend:

- endpoint health yang juga mengecek status BI scraper, BMKG, Google Routes,
  dan database freshness,
- endpoint business assumptions jika calculator ingin disimpan di backend,
- audit log untuk data lineage,
- scheduler status UI,
- test API untuk forecast/logistics/data provenance.

## Rekomendasi Urutan Pengerjaan Berikutnya

1. Tambahkan error boundary frontend.
2. Tambahkan lazy route/page loading untuk menurunkan ukuran bundle.
3. Buat API `/api/system/source-health` untuk menampilkan status sumber data.
4. Hubungkan dashboard source confidence ke endpoint source-health.
5. Tambahkan saved scenario di Resilience Room.
6. Perkuat Logistics dengan filter origin, destination, commodity, dan mode.
7. Tambahkan export "Decision Brief" untuk mendukung presentasi/pilot.

## Catatan Demo

Untuk demo cepat:

1. Buka Dashboard.
2. Tunjukkan Decision brief dan Source Confidence.
3. Masuk ke Resilience Room untuk simulasi shock rupiah/logistik/panen.
4. Masuk ke Logistik Cerdas untuk route intelligence.
5. Masuk ke Market & Evidence untuk Demand, Data Trust, Business Case, dan
   Pilot Roadmap.

Alur ini paling sesuai dengan submission karena menunjukkan problem,
mekanisme solusi, data honesty, dampak, dan business viability dalam satu
pengalaman produk.
