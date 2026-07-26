# Panduan Perekaman Video — Kepang AI

Panduan **produksi**, bukan naskah. Naskahnya ada di:
- `VIDEO_SCRIPT_DATA_KEPANG.md` — teleprompter (yang dibaca saat rekam)
- `VIDEO_SCRIPT_FINAL_3MENIT.md` — versi lengkap dengan penjelasan tiap segmen

**Total waktu realistis: 3–4 jam** dari nol sampai video terunggah, kalau
dikerjakan berurutan tanpa mengulang dari awal.

---

## ALUR PRODUKSI

| Tahap | Kegiatan | Perkiraan |
|---|---|---|
| 1 | Persiapan aplikasi & verifikasi angka | 20 menit |
| 2 | **Rekam demo layar** (menit 2–3) | 60 menit |
| 3 | **Rekam talking head** (menit 1) | 45 menit |
| 4 | Bersihkan audio | 15 menit |
| 5 | Gabung & potong | 45 menit |
| 6 | Subtitle | 30 menit |
| 7 | Ekspor & unggah | 20 menit |

> **Rekam demo layar DULU, bukan talking head.** Demo lebih sulit, butuh aplikasi
> dalam kondisi hangat, dan butuh Anda masih segar. Talking head bisa diulang
> kapan saja tanpa bergantung kondisi server.

---

# TAHAP 1 · Persiapan Aplikasi (20 menit)

### 1.1 Bangunkan server

Buka `pidi-seven.vercel.app`, tunggu termuat penuh, **refresh sekali**. Backend
di Render tidur saat menganggur; kalau tidak dibangunkan, take pertama Anda akan
menampilkan mode offline.

Biarkan tab tetap terbuka sepanjang sesi rekaman.

### 1.2 Verifikasi angka — WAJIB

Angka di aplikasi **bergerak** mengikuti data BI dan BMKG. Cocokkan dengan naskah,
dan **ganti angka di naskah kalau berbeda** — jangan hapus kalimatnya.

| Yang dicek | Naskah menyebut | Cocok? |
|---|---|---|
| Skor ketahanan | 53 | ☐ |
| Harga termurah (NTB) | Rp13.800 | ☐ |
| Harga termahal (Kalteng) | Rp19.550 | ☐ |
| Provinsi di atas median | 11 | ☐ |
| Defisit Bali & Nusa Tenggara | 69 rb ton | ☐ |
| Defisit Papua & Maluku | 61 rb ton | ☐ |
| **Skor risiko Papua & Maluku** | 76 | ☐ |
| Data confidence | 68% | ☐ |

> ⚠ **Perhatikan yang ini.** Saat panduan ini ditulis, wilayah dengan risiko
> panen tertinggi berubah menjadi **Sulawesi (76)**, sementara Papua & Maluku
> sedikit di bawahnya. Kalau saat Anda rekam kondisinya masih begitu, ubah
> kalimat di segmen `0:38` menjadi angka Papua & Maluku yang sebenarnya — atau
> sebut Sulawesi. Jangan ucapkan angka yang tidak tampil di layar.

### 1.3 Siapkan tampilan

- [ ] Browser **layar penuh** (F11) — sembunyikan bookmark bar dan tab lain
- [ ] Zoom browser **110–125%** — ini yang membuat tooltip harga provinsi terbaca
- [ ] Windows: matikan notifikasi → **Win + N** → aktifkan *Focus assist / Jangan ganggu*
- [ ] Tutup aplikasi chat, email, dan apa pun yang bisa memunculkan pop-up
- [ ] Kalau layar Anda mendukung, atur resolusi ke **2560×1440** dan rekam di situ,
      lalu ekspor 1080p — hasil zoom akan tetap tajam

### 1.4 Latih jalur klik 2×

Dengan stopwatch, tanpa merekam:

```
Cockpit → role switcher (TPID→Bulog→TPID) → decision brief + klik 1 kartu aksi
→ hover 2–3 provinsi merah → scroll Source Health → geser slider Simulator
→ buka modal Export brief
```

Target: **120 detik**. Kalau lebih, potong bagian role switcher.

---

# TAHAP 2 · Rekam Demo Layar (60 menit)

### 2.1 Pengaturan OBS

| Pengaturan | Nilai |
|---|---|
| Base & Output Resolution | 1920×1080 (atau 2560×1440 bila layar mendukung) |
| FPS | 60 — gerakan kursor jauh lebih halus |
| Recording Format | mp4 |
| Encoder | NVENC/AMD bila ada GPU, kalau tidak x264 |
| Rate Control | CQP 18–20 (atau CRF 18) |
| Audio Sample Rate | 48 kHz |
| Audio Track | Mikrofon di track terpisah dari audio desktop |

Sumber: **Display Capture** (bukan Window Capture — modal Export brief bisa
terpotong kalau memakai Window Capture).

### 2.2 Aturan menggerakkan kursor

Ini yang paling menentukan kualitas demo:

- **Gerakkan kursor pelan.** Gerakan cepat terlihat gugup dan sulit diikuti.
- **Berhenti 2 detik penuh** di setiap provinsi yang di-hover. Tooltip yang
  berkelebat tidak terbaca, dan bukti terkuat Anda hilang.
- **Jangan menggerakkan kursor saat sedang bicara** tanpa tujuan. Kursor diam
  saat narasi berjalan terlihat jauh lebih tenang.
- Setelah klik, **tunggu 1 detik** sebelum bicara lagi — beri waktu UI merespons.

### 2.3 Cara merekam

Rekam **satu take utuh** dari `1:00` sampai `3:00`, jangan potong-potong. Kalau
salah di tengah:

- **Kesalahan kecil** (salah sebut angka) → berhenti, diam 2 detik, ulangi
  kalimat itu saja. Nanti dipotong saat edit.
- **Kesalahan besar** (klik salah halaman) → berhenti total, mulai take baru.

Rekam **3 take**. Take pertama hampir selalu paling kaku dan hampir tidak pernah
terpakai — anggap itu pemanasan.

### 2.4 Kalau muncul mode offline saat rekam

Jangan panik dan jangan pura-pura tidak terlihat. Dua pilihan:

1. Hentikan rekaman, refresh, tunggu 30 detik, rekam ulang.
2. Kalau tetap muncul, **sebutkan apa adanya**: *"bagian ini sedang memakai
   data cadangan, dan sistem menandainya sendiri"* — ini konsisten dengan seluruh
   posisi kejujuran data Anda, dan panelis menghargainya.

---

# TAHAP 3 · Rekam Talking Head (45 menit)

### 3.1 Virtual background

Pakai `brand_assets/virtual_backgrounds/kepang-vbg-dark-map.png`. Kalau baju Anda
gelap, pakai versi `light-map`.

- [ ] Uji dulu 10 detik: perhatikan **tepi rambut dan bahu** — kalau bergetar,
      perbaiki pencahayaan sebelum lanjut
- [ ] Duduk **sedikit ke kiri frame** supaya peta Indonesia di kanan terlihat

### 3.2 Framing & pencahayaan

- Kamera **setinggi mata** — tumpuk buku di bawah laptop bila perlu
- Jarak ±70 cm, bahu masuk frame, jangan terlalu dekat
- **Cahaya dari depan** (jendela atau lampu menghadap Anda), bukan dari belakang
- Latar asli yang **polos** membuat deteksi tepi jauh lebih rapi — hindari duduk
  di depan rak buku atau tirai bermotif

### 3.3 Audio

- Mikrofon **headset lebih baik** daripada mikrofon laptop
- Rekam di ruangan berkarpet atau bertirai kalau ada
- **Volume mikrofon harus sama** dengan saat merekam demo layar — ini paling
  sering terlewat karena direkam terpisah, dan lompatan volume di detik 60 sangat
  terasa

### 3.4 Cara membaca naskah

- **Hafalkan hook** (2 baris pertama). Kalau hook dibaca, penonton langsung
  merasakannya — dan itu 5 detik paling menentukan.
- Sisanya boleh dibaca, tapi taruh naskah **tepat di bawah atau di samping lensa**
  — bukan di layar laptop yang Anda hadapi. Arah pandangan yang meleset terlihat jelas.
- **Tatap lensa, bukan wajah Anda sendiri** di layar preview.

Rekam **3–4 take**. Pilih yang paling luwes, bukan yang paling sempurna.

---

# TAHAP 4 · Bersihkan Audio (15 menit)

Ekstrak audio dari kedua rekaman, lalu proses lewat **Adobe Podcast Enhance**
(gratis, di browser). Noise AC dan kipas hilang, suara terdengar seperti direkam
di studio.

> **Kerjakan ini SEBELUM membuat subtitle.** Akurasi transkrip otomatis naik
> 10–20 poin setelah audio dibersihkan. Banyak orang melakukannya terbalik lalu
> menghabiskan satu jam membetulkan subtitle manual.

Setelah bersih, **samakan level** kedua bagian sebelum digabung.

---

# TAHAP 5 · Gabung & Potong (45 menit)

Di CapCut (atau editor pilihan Anda):

1. Susun: talking head (`0:00–1:00`) → demo layar (`1:00–3:00`)
2. Potong jeda canggung, salah ucap, dan napas panjang
3. Titik potong ke demo harus **tepat setelah kata "Ini demonya"** — jangan ada
   jeda kosong di antaranya
4. Tambahkan teks overlay di menit 1 (opsional tapi sangat membantu):

| Detik | Teks |
|---|---|
| 0:04 | `Rp13.800 → Rp19.550` |
| 0:12 | `BI · BPS · BMKG · NOAA` |
| 0:40 | `defisit + risiko panen kritis` |
| 0:50 | `APBN 2026: Rp210,4 T` |
| 0:57 | `pidi-seven.vercel.app` |

Letakkan di **sepertiga bawah** — jangan menutupi wajah atau peta di background.

5. **Cek durasi total: maksimal 180 detik**, termasuk bumper dan credit.

---

# TAHAP 6 · Subtitle (30 menit)

1. CapCut → **Text → Auto Captions** → pilih bahasa **Indonesia** → Generate
2. **Koreksi manual** istilah yang hampir selalu salah ditranskrip:

`Kepang AI` · `Resilience Score` · `data lineage` · `BMKG` · `BPS` · `NOAA` ·
`TPID` · `Bulog` · `Bapanas` · `pre-positioning` · `El Nino`

3. Pastikan teks **tidak terlalu panjang dalam satu frame** — pecah jadi dua baris
4. Posisikan agar tidak bertabrakan dengan teks overlay dari Tahap 5

---

# TAHAP 7 · Ekspor & Unggah (20 menit)

**Pengaturan ekspor:**

| Parameter | Nilai |
|---|---|
| Resolusi | 1920×1080 (Full HD) |
| Rasio | 16:9 horizontal |
| FPS | 30 atau 60 |
| Format | MP4 (H.264) |
| Bitrate | 12–20 Mbps |

**Unggah ke YouTube:**

- [ ] Visibilitas: **Unlisted**
- [ ] Judul: `Kepang AI — Decision Intelligence untuk Resiliensi Ketahanan Pangan Daerah (Tim J4)`
- [ ] **Buka tautannya di mode incognito** untuk memastikan bisa diakses tanpa login
- [ ] Tunggu proses HD selesai sebelum menyalin tautan — kalau buru-buru, penonton
      pertama akan melihat versi 360p

---

# QC AKHIR — sebelum menempel tautan di formulir

- [ ] Durasi **≤ 180 detik**
- [ ] Resolusi 1080p, rasio 16:9
- [ ] Audio jelas, **volume menit 1 dan menit 2–3 sama**
- [ ] Subtitle sesuai narasi, tidak ada salah ketik istilah
- [ ] Tidak ada notifikasi, tab pribadi, atau nama file yang terlihat di rekaman
- [ ] Angka yang diucapkan **cocok dengan yang tampil di layar**
- [ ] Tautan YouTube terbuka di incognito
- [ ] Tonton sekali penuh dari awal sampai akhir sebelum submit

---

# KALAU ADA MASALAH

| Masalah | Solusi |
|---|---|
| Badge "Forecast/offline mode" muncul | Refresh, tunggu 30 detik. Kalau tetap, sebutkan apa adanya saat narasi. |
| Tooltip provinsi tidak terbaca | Naikkan zoom browser ke 125%, atau rekam di 1440p lalu ekspor 1080p |
| Tepi virtual background bergetar | Tambah cahaya dari depan; duduk lebih jauh dari dinding di belakang |
| Video lewat 180 detik | Potong bagian role switcher di `1:12` — itu yang paling bisa dikorbankan |
| Suara bergema | Rekam di ruangan berkarpet, atau gantung selimut di belakang kamera |
| Koneksi lambat saat rekam | Pakai rekaman cadangan; rekam demo cadangan sehari sebelumnya |
| Salah ucap di tengah take | Jangan ulang dari awal — diam 2 detik, ulangi kalimat itu, potong saat edit |

---

## Rekomendasi terakhir

Kalau punya waktu lebih dan mau demo terlihat jauh lebih profesional, pertimbangkan
perekam layar **auto-zoom** (Rapidemo, Pane Studio, atau FocuSee — sekitar $79
sekali bayar). Alat ini otomatis memperbesar ke titik yang Anda klik dan
menghaluskan gerakan kursor. Untuk demo yang bergantung pada tooltip kecil seperti
milik Anda, ini upgrade visual terbesar per rupiah yang dikeluarkan.

Tapi **jangan belajar alat baru di hari perekaman.** Kalau deadline sudah dekat,
OBS + CapCut sudah lebih dari cukup.
