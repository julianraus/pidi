# SKRIP BACA CEPAT — Versi Data & Angka Kepang AI

> **Semua angka di skrip ini ditarik langsung dari API Kepang AI yang live**
> pada saat dokumen ini dibuat. Bukan dari ingatan, bukan dari draf lama.
> Sumber: `kepang-ai-api.onrender.com` — endpoint prices/provinces,
> forecast/resilience, supply/regions, weather/risk.

**Tanda baca:**
`⏸` = berhenti 1 ketukan · **HURUF BESAR** = tekankan
`[ ]` = yang Anda lakukan di layar (jangan diucapkan)

> ⚠ **CEK ULANG SEBELUM REKAM.** Angka di app bergerak mengikuti data BI/BMKG.
> Buka `pidi-seven.vercel.app` dan pastikan angka di layar masih cocok dengan
> skrip ini. Yang paling sering berubah: **skor ketahanan** dan **harga**.
> Lihat tabel "Angka yang harus dicek" di bagian akhir.

---

# ■ MENIT 1 — WAJAH SAJA
### Virtual background · tatap LENSA · duduk agak ke kiri

---

### `0:00` &nbsp;·&nbsp; MASALAH — angka pembuka

Harga beras hari ini.

Di N-T-B:
**tiga belas ribu delapan ratus**.

Di Kalimantan Tengah:
**sembilan belas ribu lima ratus**.

⏸

Komoditas sama, hari sama —
selisih **EMPAT PULUH DUA PERSEN**.

⏸

Kami tim J4, Kepang AI.

---

### `0:16` &nbsp;·&nbsp; MASALAH — kenapa tidak terlihat

Angka itu ada di Bank Indonesia.
Panennya di BPS.
Cuacanya di BMKG.

Tiga lembaga,
**TIDAK PERNAH BERTEMU**.

Saat disatukan manual,
harganya sudah naik lagi.

---

### `0:28` &nbsp;·&nbsp; SOLUSI — apa yang Kepang AI lakukan

Kepang AI menganyam
ketiganya jadi satu layar.

**TIGA PULUH EMPAT PROVINSI** —
langsung terlihat
mana yang di atas median.

---

### `0:38` &nbsp;·&nbsp; SOLUSI — bukti hasil anyaman

Contohnya hari ini:

Papua dan Maluku
**defisit enam puluh satu ribu ton**.

Dan skor risiko panennya
**TUJUH PULUH ENAM** — kritis.

⏸

Defisit **DAN** cuaca buruk sekaligus.
Itu tidak terlihat
kalau datanya dibaca terpisah.

---

### `0:53` &nbsp;·&nbsp; SOLUSI — jadi keputusan

Dari situ sistem menyusun aksi:
pre-positioning stok,
pemiliknya, targetnya.

Prototipe sudah live.
Ini demonya.

---
---

# ■ MENIT 2–3 — DEMO LAYAR
### Rekam layar · suara saja

---

### `1:00` &nbsp;·&nbsp; *[Cockpit sudah terbuka penuh]*

Ini aplikasinya.

Skor ketahanan pangan nasional
hari ini **LIMA PULUH EMPAT** —
status siaga satu.

Angka ini bukan tebakan:
dihitung dari harga, cuaca,
pasokan, dan tekanan rupiah.

---

### `1:12` &nbsp;·&nbsp; *[klik role: TPID → Bulog → TPID]*

Saya masuk sebagai analis TPID.

Begitu saya ganti peran,
briefnya ikut berubah —
Bulog melihat prioritas
yang berbeda dari TPID.

---

### `1:24` &nbsp;·&nbsp; *[tunjuk decision brief → klik 1 kartu aksi]*

Dan sistem tidak berhenti di angka.

Aksi prioritas nomor satu:
**pre-positioning stok
ke Bali dan Nusa Tenggara** —
wilayah dengan defisit
**enam puluh sembilan ribu ton**.

Saya klik: pemiliknya
Bulog, TPID, Dinas Pangan.
Waktunya **nol sampai empat belas hari**.
Targetnya, gap pasokan
turun minimal **TIGA PULUH PERSEN**.

---

### `1:45` &nbsp;·&nbsp; *[hover provinsi merah — TAHAN 2 detik di Kalimantan Tengah]*

Di peta, **TIGA PULUH EMPAT PROVINSI** sekaligus.

Sebelas provinsi
harga berasnya di atas median nasional.

Yang tertinggi Kalimantan Tengah —
**dua puluh dua persen** di atas median.

⏸

Dan ini angka hidup,
ditarik langsung dari Bank Indonesia.

---

### `2:05` &nbsp;·&nbsp; *[scroll ke panel Source Health]*

Di baliknya empat sumber:
harga BI, cuaca BMKG,
produksi BPS, iklim NOAA.

Bobotnya tetap dan bisa ditelusuri —
hujan 40 persen, banjir 30,
kekeringan 20, iklim 10.

⏸

Dan ini yang paling kami jaga.

Harga dan cuaca: **REAL-TIME**.
Makro: rilis resmi.
Stok dan biaya logistik:
**BELUM TERSEDIA** — kami tandai apa adanya.

Data confidence: **ENAM PULUH DELAPAN PERSEN**.
Kami tidak membulatkannya jadi seratus.

---

### `2:35` &nbsp;·&nbsp; *[geser slider Simulator Shock]*

Sebelum memutuskan,
saya bisa menguji skenario.

Rupiah melemah,
biaya logistik naik,
panen gagal —
skornya bergerak langsung.

Validasi ke pengguna —
wawancara dengan BI —
sedang kami jadwalkan.

---

### `2:50` &nbsp;·&nbsp; *[buka modal Export brief → kartu penutup]*

Harga, cuaca, dan produksi:
data asli.

Stok dan logistik:
kami tandai forecast —
**BUKAN DIKARANG**.

Prototipenya live.
Terima kasih.

---
---

## ✱ ANGKA DI SKRIP INI — SEMUA DARI API KEPANG AI

| Angka | Nilai | Dari mana |
|---|---|---|
| Harga beras termurah | **Rp13.800** (NTB) | `prices/provinces` |
| Harga beras termahal | **Rp19.550** (Kalteng, +22,6%) | `prices/provinces` |
| **Selisih antar provinsi** | **42%** | dihitung dari dua angka di atas |
| Median nasional | Rp15.950 | `prices/provinces` |
| Provinsi di atas median | 11 dari 34 | `prices/provinces` |
| Skor ketahanan | **54** (siaga 1) | `forecast/resilience` |
| Defisit Bali & NT | 69 rb ton | `supply/regions` |
| Defisit Papua & Maluku | 61 rb ton | `supply/regions` |
| Risiko panen Papua & Maluku | **76** (kritis) | `weather/risk` |
| Wilayah defisit | 3 dari 6 | `supply/balance` |
| Data confidence | **68%** | dihitung dari `data_provenance` |
| Aksi #1 | Pre-positioning, 0–14 hari, KPI 30% | `forecast/resilience` |

## ✱ ANGKA YANG HARUS DICEK ULANG SEBELUM REKAM

Angka ini **bergerak** mengikuti data BI/BMKG. Buka app, cocokkan, ganti di
skrip kalau berubah:

- [ ] **Skor ketahanan** — skrip: `54`. *(Sempat 63 di draf lama — sudah berubah.)*
- [ ] **Harga termurah & termahal** — skrip: `Rp13.800` / `Rp19.550` → selisih `42%`
- [ ] **Jumlah provinsi di atas median** — skrip: `11`
- [ ] **Defisit Bali & NT** — skrip: `69 rb ton`
- [ ] **Risiko panen Papua & Maluku** — skrip: `76`
- [ ] **Data confidence** — skrip: `68%`

> Kalau salah satu berubah, **ganti angkanya — jangan hapus kalimatnya**.
> Justru bagus kalau angkanya beda dengan draf: itu bukti datanya benar-benar hidup.

## ✱ CEK 5 MENIT SEBELUM REKAM

- [ ] Buka `pidi-seven.vercel.app`, refresh 1× *(hangatkan server)*
- [ ] Badge **"Harga per provinsi (BI)"** muncul di peta
- [ ] Cocokkan 6 angka di atas dengan yang tampil di layar
- [ ] Browser F11 · zoom 100% · notifikasi mati
- [ ] Rekam 2–3 take
