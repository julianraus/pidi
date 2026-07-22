# Kepang AI — Demo Flow (4–5 menit, klik-demi-klik)

Cerita demo: **"Dari 4 sumber data terpisah menjadi 1 keputusan dalam 60 detik."**
Satu skenario dipegang dari awal sampai akhir: *wilayah defisit (mis. Bali & Nusa Tenggara) butuh intervensi — bagaimana Kepang AI menemukannya, menjelaskan penyebabnya, dan merekomendasikan aksinya.*

URL: **https://pidi-seven.vercel.app**

---

## Persiapan (10 menit sebelum demo — wajib)

1. **Buka situs 5–10 menit sebelumnya** dan refresh sekali. Backend Render free tier dijaga cron ping tiap 10 menit, tapi warm-up manual = jaminan ganda.
2. **Cek badge di hero Dashboard:** pastikan TIDAK ada badge "Forecast/offline mode". Kalau muncul, tunggu 30 detik lalu refresh — artinya backend baru bangun.
3. Cek "Data confidence" di hero — sebutkan angkanya apa adanya saat demo (kejujuran adalah fitur).
4. Tutup tab lain, zoom browser 100–110%, mode layar penuh (F11).
5. Siapkan fallback: jika internet venue mati, rekam screen-recording demo ini sehari sebelumnya sebagai cadangan.

---

## Menit 0:00–0:45 — Dashboard (hero cockpit)

**Klik:** tidak ada — halaman pembuka.

**Tunjukkan:** titik hijau berdenyut "live", judul cockpit, lalu **Decision Brief** di panel gelap, dan **Resilience Score ring** yang beranimasi naik.

**Katakan:**
> "Ini bukan dashboard monitoring. Perhatikan kotak ini — sistem langsung membuka dengan *keputusan*: apa aksinya, siapa owner-nya, berapa hari deadline-nya, apa KPI-nya. Skor ketahanan di kanan dihitung dari harga, cuaca, pasokan, kurs, dan logistik — dianyam, seperti arti kata *kepang*."

**Beat penting:** arahkan kursor ke chip Owner / Timeframe / KPI satu per satu.

## Menit 0:45–1:30 — Source Confidence (fitur kejujuran)

**Klik:** scroll ke kartu "Source Confidence".

**Katakan:**
> "Ini fitur yang paling kami banggakan: setiap dataset diberi label jujur — *real-time*, *rilis resmi*, *forecast*, atau *belum tersedia*. Kalau data belum ada, kami tampilkan 'unavailable', bukan angka karangan. Di pasar pemerintah, kepercayaan adalah segalanya — dan kepercayaan dimulai dari mengakui apa yang belum kita ketahui."

**Beat:** sebutkan angka confidence apa adanya. Kalau juri/investor menguji ("kok tidak 100%?") — itu justru pembuka: *"karena kami menolak mengarang data — yang 100% justru patut dicurigai."*

## Menit 1:30–2:15 — Peta Nasional + skenario defisit

**Klik:** scroll ke "Peta Status Nasional", tunjuk wilayah merah (defisit).

**Katakan:**
> "Enam wilayah agregasi. Merah = defisit — di sinilah skenario kita: pasokan lebih kecil dari permintaan. Angka produksi berasnya bukan estimasi kami — ini data produksi bulanan resmi BPS, ditarik otomatis lewat WebAPI, dipetakan dari 38 provinsi ke 6 wilayah."

**Klik:** scroll cepat ke tabel "Neraca Pasokan" untuk menunjukkan angkanya.

## Menit 2:15–3:00 — Cuaca & Risiko Panen (sinyal iklim)

**Klik:** sidebar → **Cuaca & Risiko Panen**.

**Katakan:**
> "Kenapa defisit bisa memburuk? Iklim. Kami menarik prakiraan BMKG dari 12 titik terverifikasi — dua per wilayah — dan fase ENSO dari NOAA. Saat ini NOAA mengonfirmasi **El Niño** — dan itu otomatis menaikkan skor risiko panen wilayah sensitif. Ini sinyal 3–6 bulan ke depan, bukan cuma besok hujan atau tidak."

## Menit 3:00–3:45 — Inflasi Pangan + margin produsen

**Klik:** sidebar → **Inflasi Pangan** (atau Penawaran & Permintaan, pilih yang datanya paling hidup saat gladi).

**Katakan:**
> "Sisi harga: data harga harian Bank Indonesia, 38 provinsi, konsumen DAN produsen. Selisihnya penting — kalau harga konsumen naik tapi harga produsen tidak, yang menikmati kenaikan bukan petani, tapi rantai tengah. Itu jenis insight yang mengubah desain intervensi: subsidi angkut, bukan operasi pasar."

## Menit 3:45–4:30 — AI Forecasting + penutup di Evidence

**Klik:** sidebar → **AI Forecasting**. Ajukan 1 pertanyaan yang SUDAH diuji saat gladi (mis. "Wilayah mana yang paling berisiko 3 bulan ke depan dan apa intervensinya?").

**Katakan:**
> "Semua sinyal tadi bisa diajak bicara. Analis TPID bertanya dalam bahasa Indonesia, sistem menjawab dengan konteks data yang sedang tampil."

*(Jika muncul badge "Template offline": katakan jujur — "mode template offline, versi produksi memakai Claude API — perilaku sistem tetap sama, dan sekali lagi: kami memberi label jujur bahkan untuk fitur kami sendiri." Badge itu justru konsisten dengan cerita kejujuran.)*

**Klik:** sidebar → **Market & Evidence** untuk penutup.

**Katakan (closing):**
> "Semua klaim di pitch kami ada di halaman ini dengan sumbernya: inflasi volatile food 5,58%, rupiah Rp17.944, BI-Rate 5,75% — dan APBN 2026 mengalokasikan Rp210 triliun untuk ketahanan pangan. Kepang AI adalah lapisan keputusan untuk anggaran itu. Data sudah mengalir, produk sudah live, yang kami butuhkan adalah mitra untuk membawanya ke ruang rapat TPID pertama."

---

## Aturan main saat demo

- **Satu skenario, satu benang merah** (wilayah defisit) — jangan tur fitur.
- **Jangan pernah menjanjikan data yang tidak tampil.** Kalau ada yang fallback/forecast, sebut apa adanya — konsisten dengan positioning kejujuran.
- Setiap halaman maksimal 45 detik. Lebih baik ditanya "boleh lihat lagi?" daripada juri bosan.
- Gladi minimal 2× dengan timer, termasuk 1× dengan koneksi hotspot HP (simulasi wifi venue buruk).

## Jika ditanya "boleh saya coba sendiri?"

Ya — serahkan mouse. Aplikasinya publik dan semua halaman aman diklik. Ini momen kepercayaan terbaik; jangan halangi.
