# Kepang AI — Skrip Video Pitching + Demo (Submission Tahap 3)

Video **maks. 180 detik**, struktur yang direkomendasikan guideline:
**1-Menit Pitch + 2-Menit Demo** (total pas 3 menit). Skrip di bawah dipecah
per detik **persis mengikuti jendela waktu yang diminta guideline** (halaman 8
dan 12) — ini yang dinilai panelis. Narasi boleh Anda sesuaikan gaya bicara;
yang penting urutan pesan dan timing-nya dijaga.

Demo direkam langsung dari aplikasi **live**: `https://pidi-seven.vercel.app`
(bukan localhost — supaya panelis tahu ini benar ter-deploy).

---

## RINGKASAN CEPAT (hafal sebelum syuting)

**Satu kalimat:** Kepang AI menganyam data harga, cuaca, produksi, dan tekanan
rupiah yang tersebar di banyak lembaga menjadi **satu keputusan** untuk
pengambil kebijakan pangan daerah — dari monitoring jadi aksi dalam hitungan
menit.

**Pengguna:** TPID, Bapanas, Bulog, BI regional, dinas pangan.
**Masalah:** *policy lag* — sinyal krisis tersebar di 4 institusi (BPS, BI,
BMKG, NOAA), intervensi telat.

**Bukti nyata yang boleh diklaim dengan percaya diri:**
- Volatile food **5,58% yoy** — hampir 2x inflasi umum 3,34% (BPS Juni 2026).
- Rupiah **Rp17.944** (JISDOR 17 Jul 2026); **BI-Rate 5,75%** setelah naik
  3 kali berturut sejak Mei 2026.
- **El Niño** aktif (NOAA) → menaikkan skor risiko panen.
- **Peta harga beras 34 provinsi live dari BI**: Papua & Kalimantan **20–23%
  di atas median nasional**, lumbung padi (NTB, DIY, Sulsel) di bawah median —
  disparitas nyata, bukan estimasi.
- **APBN 2026: Rp210,4 triliun** untuk ketahanan pangan (konteks pasar).

**Yang jujur belum ada (tunjukkan, jangan sembunyikan):** stok gudang, demand
granular, biaya logistik aktual → berlabel `forecast`/`unavailable` di UI.
Validasi pengguna baru **dijadwalkan** (wawancara BI).

---

## SKRIP — 1-MENIT PITCH (0:00 – 1:00)

| Waktu | Narasi (ucapkan) | Yang tampil di layar |
|---|---|---|
| **0:00–0:05** | "Kami tim J4. Ini **Kepang AI** — decision intelligence untuk ketahanan pangan daerah." | Kartu judul: logo + "Kepang AI: Decision Intelligence untuk Resiliensi Ketahanan Pangan Daerah" |
| **0:05–0:15** | "Inflasi pangan 5,58 persen — hampir dua kali inflasi umum. Rupiah dan suku bunga menekan. Tapi sinyalnya tersebar di empat lembaga, dan TPID telat bertindak." | Cockpit live — sorot metrik: Volatile Food 5,58%, USD/IDR Rp17.944, Resilience Score |
| **0:15–0:35** | "Kepang AI menganyam keempatnya jadi satu. Ini peta harga beras 34 provinsi, live dari Bank Indonesia. Papua dan Kalimantan dua puluh persen di atas median nasional — sementara lumbung padi di bawah. Dari sini sistem langsung menyusun prioritas: wilayah mana yang perlu ditindak duluan." | Screen record: hover peta 34 provinsi (provinsi merah → tooltip harga), lalu decision brief di hero |
| **0:35–0:45** | "Skornya bukan black-box. Dihitung dari formula yang bisa ditelusuri — cuaca BMKG, harga BI, produksi BPS, indeks iklim NOAA — semuanya live, dan tiap angka diberi label sumbernya." | Sorot panel Source Health / badge data lineage |
| **0:45–0:55** | "Hasilnya: identifikasi wilayah prioritas dari berjam-jam jadi di bawah tiga menit. Pasarnya nyata — APBN pangan 210 triliun. Model SaaS ke pemda dan BI regional." | Kartu angka: "210,4 T APBN" + "< 3 menit vs berjam-jam" |
| **0:55–1:00** | "Prototype sudah live dengan data real. Kami buka pilot dengan BI dan TPID." | Closing card: URL live + "J4 · siap pilot" |

---

## SKRIP — 2-MENIT DEMO (1:00 – 3:00)

Rekam sebagai **satu screen recording mulus** dari aplikasi live. Latih dulu
2× supaya lancar. Hangatkan backend 5–10 menit sebelum rekam (buka situs,
refresh) agar tidak ada mode offline.

| Waktu | Fokus (sesuai guideline) | Narasi + aksi di layar |
|---|---|---|
| **1:00–1:10** | Pengantar deep-dive | "Ini alur kerja seorang analis TPID saat harga beras naik cepat. Saya mulai dari Cockpit." **Aksi:** buka `pidi-seven.vercel.app`, tampil Cockpit. |
| **1:10–2:00** | Bukti utama inovasi (walkthrough) | "Pertama saya pilih peran — TPID — dan brief-nya menyesuaikan tanggung jawab saya." **Aksi:** klik role switcher (TPID→Bulog sekilas→kembali TPID). "Resilience Score 63, dan sistem sudah menaruh aksi prioritas: pre-positioning stok ke wilayah defisit, lengkap dengan owner, timeframe, dan KPI." **Aksi:** tunjuk decision brief + kartu aksi drill-down (klik satu aksi → owner/KPI muncul). "Di peta nasional, saya lihat langsung provinsi mana yang harga berasnya di atas median." **Aksi:** hover 2–3 provinsi merah di peta 34 provinsi. |
| **2:00–2:30** | Cara kerja & kedalaman | "Di baliknya: input harga harian BI, forecast BMKG, fase ENSO NOAA, produksi BPS. Diproses jadi skor risiko dengan bobot tetap — deviasi hujan 40%, banjir 30%, kekeringan 20%, ENSO 10% — lalu digabung jadi Resilience Score. Setiap dataset diberi label real-time, rilis resmi, forecast, atau belum tersedia — bisa diaudit dari API, bukan cuma diklaim di layar." **Aksi:** scroll ke panel Source Health, tunjuk label tiap dataset + persen confidence. |
| **2:30–2:50** | Bukti validasi / hasil awal | "Datanya benar-benar hidup — harga per provinsi ini ditarik langsung dari BI, bukan angka contoh. Setiap integrasi kami verifikasi; prosesnya menemukan dan memperbaiki bug nyata, termasuk kode wilayah cuaca yang salah dan label sumber yang keliru. Validasi ke pengguna langsung — wawancara dengan BI yang menangani pangan — sedang kami jadwalkan." **Aksi:** jalankan Simulator Shock (geser slider rupiah/panen) → skor berubah real-time. |
| **2:50–3:00** | Status jujur & batas | "Harga, cuaca, dan produksi sudah real. Stok dan biaya logistik kami tandai forecast sampai ada kemitraan Bapanas dan Bulog — bukan dikarang. Prototype live. Terima kasih." **Aksi:** buka modal Export decision brief (tunjukkan bisa dicetak/PDF) → closing card. |

---

## SHOT LIST / CHECKLIST SYUTING

**Sebelum rekam:**
- [ ] Buka `https://pidi-seven.vercel.app` 5–10 menit lebih dulu, refresh 1×
      (hangatkan backend Render agar tidak muncul badge "Forecast/offline mode").
- [ ] Pastikan peta menampilkan badge **"Harga per provinsi (BI)"** (mode data
      per-provinsi aktif). Kalau belum, tunggu/refresh.
- [ ] Browser full-screen (F11), zoom 100–110%, tutup tab lain & notifikasi.
- [ ] Latih klik-path demo 2× dengan timer. Peran yang diklik, provinsi yang
      di-hover, slider yang digeser — tentukan di depan, jangan improvisasi.
- [ ] Siapkan rekaman cadangan: rekam full demo sehari sebelumnya kalau wifi
      venue/koneksi bermasalah saat hari-H.

**Urutan klik demo (hafalkan):**
1. Cockpit tampil → 2. Role switcher (TPID→Bulog→TPID) → 3. Decision brief +
klik 1 kartu aksi (drill-down) → 4. Hover 2–3 provinsi merah di peta →
5. Scroll ke Source Health → 6. Simulator Shock (geser 1–2 slider) →
7. Export decision brief (buka modal) → closing.

**Kalau ada elemen fallback muncul:** sebut jujur ("bagian ini kami tandai
forecast") — konsisten dengan pesan kejujuran data. Jangan panik, itu justru
poin plus di mata panelis.

---

## SYARAT TEKNIS (dari guideline, wajib)

- Durasi **maks. 180 detik** — termasuk logo/bumper/credit. Jangan lewat.
- Resolusi **min. 1920×1080 (Full HD)**, rasio **16:9 horizontal** (jangan
  vertikal/persegi).
- Upload **YouTube** — form minta format **unlisted** dan **bisa diakses
  publik tanpa login**. Cek sekali lagi tautannya bisa dibuka di mode incognito.
- **Subtitle sangat direkomendasikan** (buat yang sesuai narasi).
- Audio narasi jelas; musik latar tidak menutupi suara; volume antarbagian
  konsisten; hindari noise.
- Narasi boleh Bahasa Indonesia atau Inggris (skrip ini Indonesia).

## DO / DON'T (yang paling relevan)

**DO:**
- Tunjukkan **data real** bergerak (harga per provinsi, angka BPS/BI) — ini
  "bukti yang dapat dipertanggungjawabkan" yang diminta guideline.
- Pakai **screen recording aplikasi live**, bukan slide statis.
- Jelaskan fungsi teknologi secara sederhana (bobot skor, data lineage), bukan
  sekadar menyebut "AI".
- Tunjukkan badge **forecast/unavailable** — guideline menghargai kejujuran.

**DON'T:**
- Jangan slideshow tanpa narasi/konteks.
- Jangan klaim tanpa bukti (mis. "sudah dipakai TPID" — belum, jangan diucapkan).
- Jangan sebut "AI" sebagai jargon tanpa menjelaskan fungsinya.
- Jangan tampilkan karya/aset pihak lain.

---

## CHECKLIST SUBMIT (setelah video jadi)

- [ ] Konfirmasi **Team ID** final di pidi.id (draft: P0684).
- [ ] Upload video ke YouTube (unlisted, cek bisa dibuka tanpa login).
- [x] Deploy publik live — `https://pidi-seven.vercel.app` +
      `https://kepang-ai-api.onrender.com` (terverifikasi data real, termasuk
      harga per 34 provinsi).
- [ ] Kumpulkan link LinkedIn/CV 4 anggota.
- [ ] Copy jawaban dari `docs/SUBMISSION_ANSWERS_3RD.md` ke form (isi `[CEK]`).
- [ ] Upload lampiran PDF (nama file: `P0684 - <Judul Proposal>`, maks 5MB).
- [ ] Kalau wawancara BI selesai sebelum submit → perbarui bagian validasi di
      jawaban & video dengan kutipan nyata.
- [ ] Submit sebelum deadline.
