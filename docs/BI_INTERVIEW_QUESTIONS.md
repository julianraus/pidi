# Panduan Wawancara Validasi — Kepang AI

**Target responden:** Pegawai Bank Indonesia (kantor pusat atau KPw regional)
yang menangani pengendalian inflasi pangan / koordinasi TPID / asesmen harga
pangan. Idealnya juga: anggota sekretariat TPID, Bapanas, Bulog, atau dinas
pangan sebagai pembanding.

**Tujuan wawancara (petakan ke kebutuhan submission):**
1. Membuktikan masalah *policy lag* dan *fragmentasi data* itu nyata →
   mengisi **"Validated User Problem and Evidence"**.
2. Memahami workflow & tools yang dipakai hari ini → mengisi **"End-to-End
   Use Case"** dan **"User Flow"**.
3. Menguji apakah fitur Kepang AI menjawab pain yang benar → validasi
   **feature-to-pain mapping**.
4. Menggali kesediaan mengadopsi & membayar → mengisi **"Business Model & ROI"**
   dan **"Adoption & Moat"**.

**Aturan main (penting):**
- Ini wawancara *problem discovery*, bukan jualan. Target 70% waktu responden
  bicara. Jangan pimpin jawaban ("Setuju kan kalau...?").
- Tanyakan *kejadian nyata terakhir*, bukan opini umum. "Ceritakan terakhir
  kali..." lebih kuat daripada "Apakah biasanya...".
- Rekam (dengan izin) atau catat kutipan verbatim — kutipan langsung adalah
  bukti terkuat untuk proposal & video.
- Minta angka bila muncul: berapa jam, berapa orang, berapa sering, berapa
  rupiah.
- Durasi target 30–45 menit. Kalau waktu sempit, prioritaskan Bagian B dan C.

---

## Pembuka (2–3 menit)

> "Terima kasih waktunya. Kami tim mahasiswa/pengembang yang sedang membangun
> alat bantu keputusan ketahanan pangan daerah untuk hackathon PIDI–Bank
> Indonesia. Kami belum menjual apa pun — kami ingin memahami bagaimana
> Bapak/Ibu sebenarnya bekerja dengan data pangan, apa yang menyulitkan, dan
> apakah arah yang kami bangun masuk akal. Boleh saya rekam untuk catatan
> internal? Tidak akan dipublikasikan tanpa izin."

Pertanyaan pemanas:
1. Boleh diceritakan peran Bapak/Ibu dan tim dalam pemantauan/pengendalian
   inflasi pangan?
2. Dalam sebulan terakhir, komoditas apa yang paling menyita perhatian, dan
   kenapa?

---

## Bagian A — Konteks & Peran (5 menit)

3. Keputusan atau output apa yang tim Bapak/Ibu hasilkan terkait harga/pasokan
   pangan? (mis. rekomendasi rapat TPID, laporan asesmen, usulan operasi pasar)
4. Seberapa sering siklusnya — harian, mingguan, menjelang rapat tertentu?
5. Siapa saja pihak yang duduk bersama saat keputusan diambil (TPID, Bapanas,
   Bulog, dinas)? Siapa yang biasanya jadi penentu?

## Bagian B — Masalah & Bukti Nyata (10–12 menit) — PRIORITAS

*Ini inti untuk membuktikan "problem is real".*

6. **Ceritakan kejadian terakhir** saat harga satu komoditas naik cepat dan tim
   harus merespons. Apa langkah pertama yang Bapak/Ibu lakukan?
7. Dari mana saja datanya diambil saat itu? (PIHPS/BI, Panel Harga Bapanas,
   BPS, BMKG, laporan lapangan?) Berapa sumber/aplikasi berbeda yang dibuka?
8. Berapa lama dari "sadar ada masalah" sampai "punya rekomendasi yang bisa
   dibawa ke rapat"? Apa bagian yang paling memakan waktu?
9. Apakah pernah data dari beberapa sumber itu digabung manual (mis. ke Excel)?
   Siapa yang mengerjakan, berapa lama, seberapa sering error/harus diulang?
10. Pernahkah intervensi terasa **terlambat** karena sinyalnya baru terlihat
    setelah harga sudah tinggi? Boleh ceritakan satu contoh?
11. Seberapa sulit menghubungkan sinyal cuaca/panen (BMKG) atau tekanan kurs
    dengan keputusan harga pangan? Apakah itu biasanya dilihat bersama atau
    terpisah?
12. Untuk wilayah di luar Jawa (disparitas harga antar-provinsi), seberapa
    terlihat perbedaannya di tools yang ada sekarang?

*Untuk setiap poin di atas, gali angka: "berapa jam?", "berapa orang?",
"berapa sering?".*

## Bagian C — Reaksi terhadap Konsep (8–10 menit)

*Tunjukkan demo Kepang AI live (https://pidi-seven.vercel.app) — biarkan
responden bereaksi, jangan buru-buru menjelaskan tiap fitur.*

13. (Sambil menunjukkan Cockpit + peta 34 provinsi) Apa hal pertama yang menarik
    perhatian Bapak/Ibu? Apa yang membingungkan?
14. Konsep **data lineage** (label real-time / rilis resmi / forecast / belum
    tersedia per angka) — apakah ini penting untuk pekerjaan Bapak/Ibu? Kenapa?
15. Peta harga beras **per provinsi terhadap median nasional** — apakah ini
    memberi informasi yang tidak Bapak/Ibu dapatkan sekarang?
16. **Simulator skenario** (rupiah melemah / biaya logistik naik / gagal panen)
    — apakah "what-if" seperti ini pernah dibutuhkan sebelum rapat?
17. **Decision brief** dengan owner + timeframe + KPI — apakah formatnya cocok
    dengan cara tim menuangkan rekomendasi?
18. Kalau alat ini ada 6 bulan lalu, adakah keputusan yang mungkin berbeda?
19. Apa **satu fitur** yang, kalau tidak ada, membuat alat ini tidak berguna
    bagi Bapak/Ibu? (menemukan fitur wajib vs. sekunder)
20. Apa yang membuat Bapak/Ibu **tidak** mempercayai / tidak memakai alat
    seperti ini? (hambatan adopsi jujur)

## Bagian D — Adopsi, Data, & Kelayakan (5–7 menit)

21. Data apa yang tim Bapak/Ibu miliki tetapi **tidak** ada di sumber publik
    (mis. stok, realisasi operasi pasar, biaya distribusi)? Apakah mungkin
    dibagikan untuk pilot, dan lewat mekanisme apa?
22. Kalau ada alat seperti ini, siapa yang biasanya memutuskan pengadaannya —
    unit mana, level apa? Bagaimana proses/anggarannya?
23. Apakah TPID/instansi pernah membeli atau berlangganan tools analitik
    sejenis? Kalau ya, kisaran nilainya dan apa yang membuatnya layak?
24. Menurut Bapak/Ibu, siapa yang paling merasakan manfaat alat ini — BI
    regional, TPID, Bapanas, atau dinas pangan? Siapa yang paling mungkin jadi
    pemakai pertama?
25. Apakah ada regulasi/tata kelola data yang harus kami perhatikan agar alat
    ini boleh dipakai di lingkungan institusi?

## Penutup (2 menit)

26. Adakah orang lain yang sebaiknya kami ajak bicara soal ini?
27. Bolehkah kami menghubungi kembali untuk menunjukkan versi yang sudah
    diperbaiki berdasarkan masukan hari ini?
28. Dari semua yang kita bahas, apa **satu hal** yang menurut Bapak/Ibu paling
    penting kami benahi?

---

## Setelah wawancara (wajib, selagi ingatan segar)

- Tulis ulang **3–5 kutipan verbatim** paling kuat (ini masuk proposal & video).
- Catat **angka** yang muncul (jam manual/minggu, jumlah sumber data, frekuensi
  rapat) → dipakai di "Validated User Problem" dan "ROI".
- Tandai **fitur wajib vs. sekunder** dari jawaban #19 → memandu prioritas MVP.
- Catat **hambatan adopsi** dari #20 & #25 → masuk "Operational Context &
  Boundary".
- Kirim ucapan terima kasih + ringkasan 3 poin dalam 24 jam (jaga relasi untuk
  pilot).

## Cara memakai hasilnya di submission (jujur, tanpa overclaim)

- Bila wawancara **sudah dilakukan sebelum submit**: ubah "wawancara sedang
  dijadwalkan" di jawaban menjadi ringkasan temuan + kutipan, dan turunkan
  keterbatasan "belum ada validasi pengguna". Sertakan catatan wawancara
  (anonim bila diminta) di lampiran PDF.
- Bila **belum sempat**: tetap sebut sebagai "dijadwalkan/berlangsung", jangan
  klaim hasil yang belum ada — sesuai larangan guideline atas klaim tanpa bukti.
