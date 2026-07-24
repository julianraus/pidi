# Kuesioner Validasi Pengguna — Kepang AI

Versi **isi-mandiri** (self-administered) untuk dibagikan ke responden —
berbeda dari `BI_INTERVIEW_QUESTIONS.md` yang dipakai untuk wawancara
berpemandu. Dokumen ini adalah sumber teks; versi siap-cetak ada di
`submission_attachments/Kuisioner Validasi Pengguna - Kepang AI.docx`
(dibuat oleh `tools/build_user_questionnaire.py`).

**Estimasi waktu isi: 10–15 menit.** 22 pertanyaan, campuran skala/pilihan
(cepat dijawab) dan isian singkat (untuk kutipan/bukti).

**Cara pakai:**
- Kirim langsung file .docx, atau salin isi di bawah ke Google Form
  (setiap `[Skala 1-5]` → jadi Linear Scale, `[Pilih satu]`/`[Pilih beberapa]`
  → jadi Multiple Choice/Checkboxes, sisanya → Short/Long Answer).
- Cantumkan tautan demo (`https://pidi-seven.vercel.app`) atau lampirkan
  screenshot, karena Bagian C butuh responden melihat produk dulu.
- Kalau memungkinkan, tetap tindak lanjuti dengan panggilan singkat untuk
  1-2 responden paling relevan — jawaban tertulis bagus untuk pola umum,
  tapi kutipan lisan lebih kuat untuk narasi proposal/video.

---

## Kata pengantar (tampilkan di atas form)

> Terima kasih sudah meluangkan waktu. Kami tim J4, sedang mengembangkan
> **Kepang AI** — alat bantu keputusan ketahanan pangan daerah untuk PIDI–Digdaya
> x Hackathon 2026 bersama Bank Indonesia. Kuesioner ini untuk memahami
> bagaimana Bapak/Ibu bekerja dengan data pangan saat ini, dan mendapat
> masukan jujur atas prototipe kami. Kami belum menjual apa pun. Jawaban
> akan digunakan untuk laporan internal/submission hackathon; identitas
> dapat dianonimkan atas permintaan. Waktu pengisian sekitar 10–15 menit.

---

## Identitas Responden (opsional, boleh dikosongkan)

1. Nama
2. Instansi / unit kerja
3. Jabatan / peran
4. Lama bekerja di bidang terkait pangan/ekonomi daerah `[Pilih satu: <1 tahun / 1-3 tahun / 3-5 tahun / >5 tahun]`

---

## Bagian A — Konteks Kerja Saat Ini

5. Apa output atau keputusan utama yang Anda hasilkan terkait harga/pasokan
   pangan? *(isian singkat, mis. "rekomendasi rapat TPID", "laporan asesmen")*
6. Seberapa sering Anda perlu memantau/menganalisis data harga pangan?
   `[Pilih satu: Harian / Mingguan / Bulanan / Hanya menjelang rapat tertentu / Lainnya]`
7. Sumber data apa saja yang biasa Anda gunakan?
   `[Pilih beberapa: PIHPS/Bank Indonesia / Panel Harga Bapanas / BPS / BMKG / Laporan lapangan internal / Lainnya: ___]`
8. Berapa banyak sumber atau aplikasi berbeda yang biasanya Anda buka untuk
   satu kali analisis harga pangan?
   `[Pilih satu: 1-2 / 3-4 / 5 atau lebih]`

## Bagian B — Masalah yang Dialami

9. Seberapa sering data yang Anda butuhkan tersebar di banyak sistem/lembaga
   berbeda? `[Skala 1-5: 1=Tidak pernah, 5=Selalu]`
10. Seberapa sering Anda menggabungkan data dari berbagai sumber secara
    manual (mis. ke Excel)? `[Skala 1-5: 1=Tidak pernah, 5=Selalu]`
11. Rata-rata, berapa lama waktu dari menyadari ada masalah harga sampai
    punya rekomendasi yang siap dibawa ke rapat?
    `[Pilih satu: <1 jam / 1-4 jam / 1 hari / lebih dari 1 hari]`
12. Pernahkah Anda merasa intervensi terlambat karena sinyal masalah baru
    terlihat setelah harga sudah naik? `[Pilih satu: Ya, sering / Kadang / Jarang / Tidak pernah]`
    Kalau **ya/kadang**, boleh ceritakan singkat contohnya? *(isian singkat)*
13. Seberapa sulit menghubungkan sinyal cuaca/risiko panen dengan keputusan
    harga pangan saat ini? `[Skala 1-5: 1=Sangat mudah, 5=Sangat sulit]`
14. Seberapa terlihat disparitas harga antarprovinsi/wilayah di tools yang
    Anda pakai sekarang? `[Skala 1-5: 1=Sangat terlihat, 5=Tidak terlihat sama sekali]`

## Bagian C — Reaksi terhadap Kepang AI

*Sebelum menjawab bagian ini, silakan buka demo produk kami di
https://pidi-seven.vercel.app (atau lihat lampiran screenshot yang kami
sertakan).*

15. Apa kesan pertama Anda terhadap tampilan Cockpit ini? *(isian singkat,
    boleh termasuk hal yang membingungkan)*
16. Seberapa penting label sumber data (real-time / rilis resmi / forecast /
    belum tersedia) pada setiap angka bagi pekerjaan Anda?
    `[Skala 1-5: 1=Tidak penting, 5=Sangat penting]`
17. Seberapa berguna peta harga beras per-provinsi (dibanding cara Anda
    melihat data harga sekarang)? `[Skala 1-5: 1=Tidak berguna, 5=Sangat berguna]`
18. Seberapa dibutuhkan fitur simulasi skenario (rupiah melemah / biaya
    logistik naik / gagal panen) sebelum rapat pengambilan keputusan?
    `[Skala 1-5: 1=Tidak dibutuhkan, 5=Sangat dibutuhkan]`
19. Fitur mana yang **paling** penting bagi Anda? `[Pilih beberapa, maks. 2:
    Peta harga 34 provinsi / Resilience Score / Simulator skenario /
    Label sumber data (data lineage) / Decision brief (owner+KPI) / Lainnya: ___]`
20. Apa yang membuat Anda ragu atau enggan memakai alat seperti ini?
    *(isian singkat — jawaban jujur sangat membantu kami)*

## Bagian D — Kelayakan Adopsi

21. Siapa yang biasanya memutuskan pengadaan alat/tools analitik seperti ini
    di institusi Anda? *(isian singkat, mis. nama unit/level jabatan)*
22. Menurut Anda, siapa yang paling diuntungkan dari alat ini?
    `[Pilih beberapa: BI regional / TPID / Bapanas / Bulog / Dinas Pangan daerah / Lainnya: ___]`

## Penutup

23. Satu hal yang paling penting untuk kami perbaiki? *(isian singkat)*
24. Boleh kami hubungi kembali untuk validasi lanjutan?
    `[Pilih satu: Ya / Tidak]` — Kontak (opsional): _____________

> Terima kasih atas waktu dan masukannya.

---

## Cara memakai hasilnya di submission (jujur, tanpa overclaim)

- Kumpulkan minimal 5 responden sebelum menyimpulkan pola apa pun.
- Ringkas jawaban skala (rata-rata + sebaran) dan kutip 3-5 jawaban isian
  terbuka yang paling tajam untuk `Validated User Problem and Evidence`.
- Kalau ada jawaban Bagian D yang menyebut nilai kontrak/anggaran, itu bukti
  kuat untuk `Business Model and ROI` — kutip dengan izin.
- Tetap sebut hasilnya sebagai "kuesioner terbatas ke N responden", jangan
  digeneralisasi jadi "tervalidasi oleh BI" tanpa jumlah dan cakupan yang jelas.
