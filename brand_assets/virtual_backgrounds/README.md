# Virtual Background — Kepang AI

Empat varian, semuanya **1920×1080 (16:9)**, siap dipakai di Zoom, Google Meet,
Microsoft Teams, atau sebagai latar rekaman video pitch.

Dibuat oleh `tools/build_virtual_backgrounds.py`. Seni petanya bukan gambar
stok — dirender langsung dari **GeoJSON 34 provinsi yang dipakai aplikasi live**,
dan bingkai sudutnya mengikuti motif *blueprint* di design system aplikasi.

## Pilih yang mana?

| File | Kapan dipakai |
|---|---|
| `kepang-vbg-dark-map.png` | **Default.** Paling berkarakter — peta Indonesia terlihat, identitas lengkap. Cocok untuk pitch, wawancara BI/TPID, demo. |
| `kepang-vbg-light-map.png` | Kalau ruangan Anda terang atau baju Anda gelap. Kontras lebih lembut, terasa formal. |
| `kepang-vbg-dark-plain.png` | Tanpa peta — kalau Anda banyak *screen sharing* dan tidak mau latar ikut ramai. |
| `kepang-vbg-minimal.png` | Paling senyap: logo kecil di bawah, tanpa tagline. Untuk rapat panjang atau saat wajah harus jadi fokus penuh. |

## Cara pasang

**Zoom** — Settings → Background & Effects → `+` → Add Image → pilih file.
**Google Meet** — ikon efek (kanan bawah preview) → Backgrounds → `+` → unggah file.
**Teams** — sebelum join: Background filters → Add new → unggah file.
**OBS / rekaman layar** — pakai sebagai Image Source di layer paling bawah.

## Catatan pemakaian

- **Area tengah sengaja dikosongkan** — di situlah Anda duduk. Semua branding
  ditaruh di pojok supaya tidak tertutup badan.
- **Tulisan tidak akan terbalik bagi lawan bicara.** Zoom/Meet menampilkan
  *self-view* Anda secara cermin, tapi yang dilihat peserta lain sudah benar.
  Kalau terganggu saat melihat diri sendiri, matikan opsi "Mirror my video".
- Duduklah agak ke **kiri atau tengah frame** supaya peta di kanan tetap terlihat.
- Pencahayaan dari depan + latar belakang asli yang polos akan membuat deteksi
  tepi (tanpa green screen) jauh lebih rapi.

## Regenerate

```bash
python tools/build_virtual_backgrounds.py
```

Untuk mengubah warna, teks, atau provinsi yang di-highlight, sunting konstanta di
bagian atas skrip (`HIGHLIGHT` memakai provinsi yang saat ini ditandai
bertekanan harga tinggi oleh aplikasi, supaya artnya tetap jujur pada produk).
