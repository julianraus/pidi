# Panduan Demo untuk Investor — Kepang AI

Berbeda dari demo juri hackathon. Investor menilai: **apakah masalahnya besar,
apakah produknya punya keunggulan yang sulit ditiru, apakah ini nyata, dan
bagaimana uangnya masuk.** Fitur bukan tujuan — bukti dan uang yang dicari.

Durasi target: **8–10 menit** menggerakkan layar + sisanya tanya jawab.
Semua angka di bawah ditarik dari API live saat dokumen ini dibuat.

---

## ⚠ DUA HAL YANG WAJIB DIBERESKAN DULU

### 1. Ada teks "La Nina Lemah" yang bertentangan dengan data Anda sendiri

Muncul di dua tempat:
- Halaman **Penawaran & Permintaan** → *"Berdasarkan prakiraan La Nina lemah BMKG"*
- Halaman **Cuaca & Risiko Panen** → kartu *Fase ENSO: "La Nina Lemah"*

Padahal integrasi NOAA Anda menarik fase ENSO aktual, dan seluruh proposal Anda
menyebut **El Niño**. Teks di Penawaran & Permintaan bahkan mengatributkannya ke
BMKG — atribusi sumber yang tidak akurat.

**Risiko:** investor yang paham iklim, atau juri yang membaca proposal Anda,
akan menangkapnya. Untuk produk yang menjual kejujuran data, ini merusak.

> **Saya bisa perbaiki dalam beberapa menit** — bilang saja. Kalau belum sempat:
> **jangan buka halaman Cuaca & Risiko Panen**, dan saat di Penawaran &
> Permintaan **jangan menyorot grafik 3 Skenario**.

### 2. Halaman Penawaran & Permintaan tidak menampilkan label sumber data

Halaman itu menampilkan tonase pasokan/permintaan yang presisi dan rencana
redistribusi senilai **Rp86,2 miliar** — tanpa satu pun badge status data,
padahal `data_provenance` Anda sendiri menandai supply-demand sebagai
**`unavailable`** (masih seed, bukan data Bapanas/Bulog).

**Ini halaman paling memukau untuk investor — sekaligus paling berbahaya.**
Kalau Anda menyebutnya "data real", lalu investor melakukan due diligence dan
menemukan itu seed, kepercayaan hilang seluruhnya.

> **Aturan mati saat demo:** setiap kali membuka halaman ini, ucapkan kalimat
> pembatas di Langkah 3 — kata demi kata. Kejujuran ini justru **menaikkan**
> nilai Anda di mata investor serius.

---

## PERSIAPAN (10 menit sebelum)

- [ ] Buka `pidi-seven.vercel.app`, refresh 1× — bangunkan server Render
- [ ] Pastikan badge **"Harga per provinsi (BI)"** muncul di peta Dashboard
- [ ] Cocokkan 3 angka kunci dengan layar: skor **54**, defisit NT **69K ton**,
      risiko Papua & Maluku **76**
- [ ] Zoom browser 110% — investor sering menonton lewat share screen
- [ ] Tutup tab lain, matikan notifikasi
- [ ] Siapkan `docs/INVESTOR_PITCH.md` di tab terpisah untuk rujukan angka pasar

---

# ALUR DEMO — 6 LANGKAH

Benang merah: **satu masalah, ditelusuri sampai jadi keputusan bernilai rupiah.**
Jangan tur fitur. Satu cerita saja.

---

## LANGKAH 0 · Bingkai pembuka (30 detik, sebelum berbagi layar)

> *"Sebelum saya buka layarnya — satu angka. Hari ini, harga beras di NTB
> tiga belas ribu delapan ratus. Di Kalimantan Tengah sembilan belas ribu lima
> ratus. Komoditas yang sama, hari yang sama, selisih empat puluh dua persen.*
>
> *Yang mengambil keputusan pangan hari ini tidak melihat angka itu dalam satu
> tempat. Itu yang kami perbaiki. Saya tunjukkan."*

**Kenapa begini:** investor memutuskan dalam 60 detik pertama apakah akan
menyimak. Angka yang tajam mengalahkan penjelasan panjang tentang visi.

---

## LANGKAH 1 · Halaman **Dashboard (Cockpit)** — sekitar 90 detik

**Yang dibuka:** halaman utama, langsung terlihat saat membuka situs.

**Yang ditunjukkan, berurutan:**

**(a) Skor di kanan atas**
> *"Ini skor ketahanan pangan nasional hari ini: lima puluh empat, status siaga
> satu. Satu angka, dihitung dari harga, cuaca, pasokan, dan tekanan rupiah
> sekaligus."*

**(b) Peta 34 provinsi** — *hover 2 provinsi merah, tahan 2 detik tiap provinsi*
> *"Ini yang tadi saya sebut. Tiga puluh empat provinsi, harga beras hidup dari
> Bank Indonesia. Merah artinya di atas median nasional — sebelas provinsi.
> Yang tertinggi Kalimantan Tengah, dua puluh dua persen di atas."*

**(c) Decision brief** — *tunjuk, lalu klik satu kartu aksi*
> *"Dan ini pembedanya. Sistem tidak berhenti di angka — ia menyusun aksi:
> pre-positioning stok ke Bali dan Nusa Tenggara. Saya klik, muncul pemiliknya,
> tenggat empat belas hari, dan targetnya gap turun tiga puluh persen."*

**Pesan yang harus mendarat:** *dashboard lain berhenti di angka; kami sampai
ke keputusan.*

---

## LANGKAH 2 · Masih di Dashboard — **Simulator Shock** — 45 detik

**Yang dilakukan:** geser slider "Rupiah melemah" dan "Kehilangan panen".

> *"Sebelum memutuskan, mereka bisa menguji skenario. Rupiah melemah lima
> persen, panen turun — skornya bergerak langsung. Ini yang tidak bisa
> dilakukan spreadsheet: menguji keputusan sebelum uangnya keluar."*

**Kenapa penting untuk investor:** memperlihatkan produk dipakai **berulang**
dalam siklus kerja, bukan dilihat sekali lalu ditinggalkan. Itu retensi.

---

## LANGKAH 3 · Halaman **Penawaran & Permintaan** — 2 menit ⚠ *halaman paling kuat*

**Yang dibuka:** menu kiri → *Penawaran & Permintaan*.

**(a) Alert BMKG di bagian atas** — *tunjuk tanggal dan jamnya*
> *"Perhatikan ini: peringatan cuaca BMKG dengan tanggal dan jam hari ini.
> Sistemnya benar-benar berjalan, bukan tangkapan layar."*

Ini bukti "produk hidup" paling murah dan paling meyakinkan yang Anda punya.

**(b) Peta neraca antarwilayah**
> *"Neraca nasional minus empat puluh sembilan ribu ton. Jawa surplus seratus
> dua ribu, tapi Papua-Maluku minus enam puluh satu ribu — dan risiko panennya
> tujuh puluh enam persen, kritis. Defisit dan cuaca buruk sekaligus."*

**(c) Rencana Redistribusi Optimal** — *scroll ke tabel paling bawah* — **momen puncak**

> **UCAPKAN PERSIS INI — jangan diringkas:**
>
> *"Dan ini muaranya. Sistem menyusun rencana redistribusi: seratus empat puluh
> tiga ribu ton, senilai delapan puluh enam koma dua miliar rupiah, dalam dua
> belas minggu — lengkap dengan asal, tujuan, moda, dan durasi.*
>
> *Saya perlu jujur soal satu hal. Angka harga dan cuaca di sini real-time.
> Tapi tonase pasokan dan biaya logistik ini masih keluaran model di atas data
> awal — kami belum punya akses data stok Bapanas dan Bulog. Begitu kemitraan
> data itu terbuka, angka ini menjadi rencana operasional sungguhan. Itu
> justru salah satu hal yang kami cari dari investor: akses."*

**Kenapa kalimat jujur itu wajib:** investor serius akan menemukannya sendiri
saat due diligence. Menyebut duluan mengubah kelemahan menjadi **kebutuhan yang
jelas** — dan sekaligus menjelaskan untuk apa uang mereka dipakai.

---

## LANGKAH 4 · Halaman **Resilience Room** — 90 detik · *ini moat Anda*

**Yang dibuka:** menu kiri → *Resilience Room*. Scroll ke panel **Data Lineage**.

> *"Ini bagian yang paling saya ingin Anda lihat. Setiap dataset diberi label:
> harga dan cuaca real-time, makro rilis resmi, stok dan logistik belum
> tersedia. Data confidence kami enam puluh delapan persen — dan kami tidak
> membulatkannya jadi seratus.*
>
> *Di pasar pemerintah, ini bukan sekadar fitur. Tidak ada pejabat yang mau
> tanda tangan di atas angka yang tidak bisa ditelusuri asalnya. Kompetitor
> bisa meniru tampilan kami dalam sebulan; membangun disiplin data seperti ini
> butuh waktu jauh lebih lama."*

Lalu tunjuk **Eksposur Imported Inflation**:
> *"Dan ini menghubungkan pangan ke kurs — rupiah di tujuh belas ribu sembilan
> ratus empat puluh empat menekan komoditas impor tertentu. Itu bahasa yang
> dimengerti Bank Indonesia."*

**Pesan yang harus mendarat:** *keunggulan kami bukan UI, tapi kepercayaan yang
bisa diaudit.*

---

## LANGKAH 5 · Halaman **Market & Evidence** — 60 detik

**Yang dibuka:** menu kiri → *Market & Evidence*.

> *"Bukti permintaannya tidak kami karang sendiri — halaman ini merangkum
> sumber resminya. Volatile food lima koma lima delapan persen, hampir dua kali
> inflasi umum. BI-Rate naik tiga kali beruntun.*
>
> *Dan pasarnya punya anggaran: APBN 2026 mengalokasikan dua ratus sepuluh
> koma empat triliun untuk ketahanan pangan. Model kami langganan tahunan per
> instansi — tiga puluh delapan provinsi, lima ratus empat belas kabupaten
> kota, masing-masing punya TPID yang wajib rapat rutin."*

---

## LANGKAH 6 · Penutup & permintaan — 60 detik *(tutup layar, kembali tatap muka)*

> *"Jadi ringkasnya: harga, cuaca, dan produksi sudah data asli dan berjalan
> otomatis. Stok dan logistik masih kami tandai belum tersedia — jujur, bukan
> dikarang.*
>
> *Yang kami cari bukan hanya dana. Kami butuh dua hal: akses ke satu pemda
> atau BI regional untuk pilot berbayar pertama, dan jalan masuk ke data stok
> Bapanas atau Bulog. Dengan dua itu, angka delapan puluh enam miliar tadi
> berubah dari model menjadi keputusan nyata.*
>
> *Boleh saya kirimkan tautannya supaya Anda coba sendiri? Aplikasinya publik."*

**Selalu tutup dengan menyerahkan akses.** Investor yang mencoba produk sendiri
jauh lebih mungkin melanjutkan ke pertemuan kedua.

---

# JIKA HANYA PUNYA 3 MENIT

Investor sering memotong. Rute darurat:

1. **Bingkai pembuka** (angka 42%) — 20 detik
2. **Dashboard**: peta + decision brief — 60 detik
3. **Penawaran & Permintaan**: langsung scroll ke Rencana Redistribusi
   (Rp86,2 M) + kalimat jujur — 60 detik
4. **Penutup + permintaan** — 40 detik

Lewati Simulator, Resilience Room, dan Market & Evidence.

---

# HALAMAN YANG SEBAIKNYA TIDAK DIBUKA

| Halaman | Alasan |
|---|---|
| **Cuaca & Risiko Panen** | Memuat kartu "Fase ENSO: La Nina Lemah" yang bertentangan dengan data NOAA Anda. Jangan dibuka sampai diperbaiki. |
| **AI Forecasting** | Masih memakai template offline (ANTHROPIC_API_KEY belum diisi). Kalau investor bertanya soal AI, jawab dari sisi rule-based yang transparan — itu lebih kuat, bukan lebih lemah. |
| **Inflasi Pangan** | Isinya bagus tapi tumpang tindih dengan yang sudah Anda tunjukkan. Simpan sebagai cadangan kalau ditanya soal tren harga. |
| **Logistik Cerdas** | Biaya dan kapasitas masih estimasi. Buka hanya kalau investor bertanya spesifik soal logistik, dan sebut statusnya. |

---

# PERTANYAAN INVESTOR YANG HAMPIR PASTI MUNCUL

**"Datanya kan publik semua. Apa yang tidak bisa ditiru?"**
> *"Datanya memang publik. Yang tidak gampang ditiru itu tiga hal: pipeline yang
> menyatukan empat sumber dengan format dan frekuensi berbeda dan tetap jalan
> tiap hari; disiplin pelabelan sumber yang membuat instansi berani memakainya;
> dan begitu masuk rutinitas rapat TPID, biaya pindah ke produk lain jadi
> mahal. Bloomberg juga 'hanya' mengemas data publik."*

**"Pemerintah kan bisa bangun sendiri?"**
> *"Bisa. Tapi rekam jejak e-government menunjukkan mereka lebih cepat membeli
> daripada membangun, apalagi untuk sesuatu yang harus diperbarui tiap hari.
> Kami juga terbuka untuk skema whitelabel."*

**"Berapa lama siklus penjualan ke pemerintah?"**
> *"Panjang — enam sampai delapan belas bulan, kami tidak menutupinya.
> Mitigasinya: masuk lewat APBD perubahan yang lebih lincah, jalur BUMN seperti
> Bulog, dan paralel menjual API risk score ke asuransi pertanian dan bank yang
> siklusnya jauh lebih pendek."*

**"Sudah ada pengguna?"**
> *"Belum ada pengguna berbayar. Yang sudah ada: produk live, empat integrasi
> data pemerintah yang berjalan, dan wawancara validasi dengan Bank Indonesia
> yang sedang kami jadwalkan. Saya tidak akan mengklaim traksi yang belum ada."*

**"Kenapa tim ini?"**
> *"Kami membangun ini sampai live dalam hitungan minggu, termasuk menembus
> integrasi yang terkenal rewel — WAF milik BPS dan endpoint BI yang tidak
> berdokumentasi. Itu bukti kami bisa mengeksekusi di domain yang sulit."*

---

# TIGA KESALAHAN YANG PALING SERING MERUSAK DEMO

1. **Menunjukkan terlalu banyak halaman.** Delapan modul terasa mengesankan
   bagi Anda, membingungkan bagi investor. Lima langkah sudah cukup.
2. **Mengklaim semua data real.** Satu pertanyaan lanjutan dan kredibilitas
   Anda habis. Sebut batasnya lebih dulu — selalu.
3. **Berhenti tanpa meminta.** Akhiri dengan permintaan yang spesifik: satu
   pilot, satu akses data. Bukan "bagaimana menurut Anda?"
