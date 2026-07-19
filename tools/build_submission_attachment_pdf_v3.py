"""Builds the 3rd Submission Proposal attachment PDF for Kepang AI.

Reuses styling/table helpers and the architecture diagram from
build_submission_attachment_pdf.py (2nd submission), but with content
refreshed for 3rd submission: progress log, verified real-data integration
evidence, and updated open gaps.
"""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import (
    Image,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)

from build_submission_attachment import create_architecture_image
from build_submission_attachment_pdf import (
    S,
    p,
    h1,
    h2,
    table,
    callout,
    bullets,
    LIGHT_AMBER,
    LIGHT_GREEN,
    MUTED,
)

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "submission_attachments"
ASSET_DIR = OUT_DIR / "assets"
PDF_PATH = OUT_DIR / "P0684 - Kepang AI Lampiran Submission Tahap 3.pdf"


def page_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(0.55 * inch, 0.36 * inch, "Kepang AI - Lampiran Submission Tahap 3")
    canvas.drawRightString(7.95 * inch, 0.36 * inch, f"Halaman {doc.page}")
    canvas.restoreState()


def build_pdf():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    arch_path = ASSET_DIR / "system_architecture.png"
    create_architecture_image(arch_path)

    doc = SimpleDocTemplate(
        str(PDF_PATH),
        pagesize=letter,
        rightMargin=0.55 * inch,
        leftMargin=0.55 * inch,
        topMargin=0.58 * inch,
        bottomMargin=0.55 * inch,
        title="Kepang AI Lampiran Submission Tahap 3",
        author="Kepang AI",
    )

    story = []
    story.append(Spacer(1, 0.35 * inch))
    story.append(Paragraph("Kepang AI", S["TitleMain"]))
    story.append(Paragraph("Decision Intelligence untuk Resiliensi Ketahanan Pangan Daerah", S["Subtitle"]))
    story.append(Paragraph("Lampiran Submission Tahap 3", S["Meta"]))
    story.append(Spacer(1, 0.12 * inch))
    story.append(callout(
        "Tujuan",
        "PDF ini merangkum bahan pendukung untuk penilaian tahap 3: progress sejak submission ke-2, bukti integrasi data real-time yang terverifikasi langsung, arsitektur sistem, kebijakan data, KPI dampak, business model, dan gap yang masih terbuka secara jujur.",
    ))
    story.append(Spacer(1, 0.16 * inch))
    story.append(table(
        ["Keterangan", "Isi"],
        [
            ["ID Tim", "P0684"],
            ["Nama Tim", "J4"],
            ["Judul Proposal", "Kepang AI: Decision Intelligence untuk Resiliensi Ketahanan Pangan Daerah"],
            ["Status Prototype", "Live deployment end-to-end: backend API (Render), frontend (Vercel), database Supabase, empat integrasi data eksternal real-time terverifikasi (BI Harga Pangan konsumen+produsen, BMKG, NOAA ENSO, BPS produksi padi), forecasting, dan rekomendasi logistik."],
            ["Link Demo Live", "Frontend: https://pidi-seven.vercel.app  |  Backend: https://kepang-ai-api.onrender.com/api/health"],
            ["Nama File", "P0684 - Kepang AI Lampiran Submission Tahap 3.pdf"],
        ],
        [1.35 * inch, 5.3 * inch],
    ))
    story.append(PageBreak())

    story.append(h1("1. Progress Sejak Submission Tahap 2"))
    story.append(p(
        "Fokus utama pengembangan sejak submission ke-2 adalah menghilangkan ketergantungan pada data dummy/mock yang sebelumnya dipakai untuk demo, dan memverifikasi langsung bahwa setiap sumber data eksternal benar-benar dapat ditarik secara live, bukan hanya diasumsikan berfungsi."
    ))
    story.append(table(
        ["Perubahan", "Bukti / Verifikasi", "Dampak"],
        [
            ["Aktivasi BI Harga Pangan scraper real-time", "Diuji langsung: 180 record harga aktual berhasil ditarik untuk 6 komoditas x 6 wilayah", "Harga komoditas di dashboard berasal dari data live, bukan seed"],
            ["Aktivasi BMKG Open Data untuk seluruh wilayah pilot", "6/6 kode wilayah adm4 diverifikasi hidup; 1 kode wilayah (NT) ditemukan tidak valid (404) dan diperbaiki", "Forecast cuaca dan risk score panen berbasis data live untuk semua wilayah"],
            ["Penggantian asumsi fase ENSO", "Sebelumnya hardcoded 'weak La Nina'; kini fetch live dari NOAA Oceanic Nino Index setiap siklus polling", "Mengoreksi bias model risiko - kondisi aktual ternyata El Nino, bukan La Nina"],
            ["Perbaikan bug data-provenance", "Harga sintetis sempat tersimpan dengan label sumber resmi 'bps'; diperbaiki agar label mengikuti sumber sebenarnya", "Menjaga kepatuhan terhadap kebijakan data lineage milik Kepang AI sendiri"],
            ["Perbaikan konsistensi fallback frontend", "Badge 'Forecast/offline mode' sebelumnya bisa tidak muncul walau sebagian data memakai fallback; kini konsisten di semua field", "Pengguna tidak salah mengira data forecast sebagai data real-time"],
            ["Validasi environment variable saat startup", "Backend kini gagal jelas saat boot bila konfigurasi database tidak valid, alih-alih gagal diam-diam", "Masalah konfigurasi (mis. Supabase project ter-pause) terdeteksi lebih awal"],
            ["Integrasi harga produsen BI (price_type_id 4)", "Diuji langsung: harga produsen live berdampingan dengan harga konsumen yang sudah ada", "Margin distribusi produsen-konsumen per wilayah-komoditas jadi sinyal baru (cth. Bawang Merah Kalimantan: margin 52,7%)"],
            ["Integrasi produksi padi BPS (var 2506)", "Diuji langsung: 36 baris supply_demand di-update dengan produksi riil per wilayah, ditandai production_source='bps'", "production_ton tidak lagi 100% seed untuk komoditas beras"],
            ["Deploy publik end-to-end + QA live", "Backend (Render) dan frontend (Vercel) live; ditemukan dan diperbaiki 1 bug lagi saat QA: teks AI Forecasting offline masih menyebut 'La Nina', bertentangan dengan data ENSO live", "Prototype dapat diakses publik; badge 'Template offline' ditambahkan agar respons AI kalengan tidak terlihat seperti analisis live"],
        ],
        [1.85 * inch, 2.55 * inch, 2.25 * inch],
    ))
    story.append(Spacer(1, 0.08 * inch))
    story.append(callout(
        "Kenapa ini penting",
        "Guideline submission tahap 3 secara eksplisit melarang mengklaim status atau data yang tidak dapat diverifikasi. Perubahan di atas bukan penambahan fitur, melainkan audit internal untuk memastikan setiap klaim data lineage Kepang AI benar-benar akurat di level kode, bukan hanya di level dokumentasi.",
        fill=LIGHT_AMBER,
    ))
    story.append(PageBreak())

    story.append(h1("2. Problem-Solution Mapping"))
    story.append(table(
        ["Masalah", "Mekanisme Solusi", "Hasil"],
        [
            ["Data pangan tersebar", "Harga, supply-demand, cuaca, makro, dan logistik disatukan dalam satu ruang keputusan", "Pengambil keputusan melihat penyebab risiko, bukan hanya gejala kenaikan harga"],
            ["Policy lag", "Early warning, Resilience Score, action card, dan rekomendasi redistribusi", "Intervensi stok, operasi pasar, dan mitigasi panen dapat dimulai lebih cepat"],
            ["Rupiah melemah dan imported inflation", "Scenario planning kurs, eksposur komoditas impor, dan simulasi biaya logistik", "Keputusan pangan lebih siap menghadapi shock eksternal"],
            ["Kualitas data belum jelas", "Data lineage membedakan real-time, official-release, forecast, dan unavailable - diverifikasi hidup di kode, bukan hanya diklaim", "Rekomendasi lebih transparan dan dapat diaudit langsung dari API response"],
            ["Rute logistik belum optimal", "Ranking rute, estimasi volume, ETA/jarak Google bila tersedia, dan kebutuhan data mitra", "Redistribusi dari wilayah surplus ke defisit menjadi lebih terarah"],
        ],
        [1.75 * inch, 2.45 * inch, 2.45 * inch],
    ))
    story.append(Spacer(1, 0.08 * inch))
    story.append(h1("3. System Architecture"))
    story.append(p(
        "Arsitektur Kepang AI dibuat modular agar mudah dikembangkan dari prototype menuju pilot. Setiap sumber data eksternal adalah service terpisah sehingga kegagalan satu sumber tidak menjatuhkan yang lain, dan setiap output tetap membawa status data (real-time/official-release/forecast/unavailable) yang dapat ditelusuri."
    ))
    story.append(Image(str(arch_path), width=6.65 * inch, height=4.35 * inch))
    story.append(PageBreak())

    story.append(h1("4. Data Source and Feasibility Matrix (Diperbarui)"))
    story.append(table(
        ["Dataset", "Status Saat Ini", "Sumber / Metode", "Kebutuhan untuk Produksi"],
        [
            ["Harga pangan", "real-time (terverifikasi live)", "BI Harga Pangan scraper - endpoint GetGridDataDaerah, 180 record teruji", "Monitoring stabilitas endpoint jangka panjang"],
            ["Prakiraan cuaca", "real-time (terverifikasi live)", "BMKG Open Data, 6/6 titik adm4 wilayah pilot", "Perluasan titik adm4 saat cakupan wilayah bertambah"],
            ["Fase ENSO (input risk model)", "real-time (terverifikasi live)", "NOAA Oceanic Nino Index, feed publik tanpa API key", "Tidak ada - sumber sudah stabil dan gratis"],
            ["Inflasi dan makro", "official-release", "Rilis BPS dan BI", "Pipeline pembaruan berkala dari rilis resmi"],
            ["Supply-demand dan stok", "forecast / seed MVP - dicek, tidak ada API publik", "Seed prototype; data granular Bapanas terkunci di sistem internal S.A.P.A", "Kemitraan resmi dengan Bapanas/Bulog/Dinas Pangan"],
            ["Produksi pangan (padi/jagung)", "belum diintegrasikan - jalur teridentifikasi", "BPS WebAPI mendukung, perlu registrasi API key gratis", "Registrasi BPS_API_KEY dan pemetaan var id produksi"],
            ["ETA/jarak logistik", "real-time jika API key tersedia", "Google Routes API untuk rute jalan yang sesuai", "API key Google dan koordinat titik asal-tujuan"],
            ["Biaya/kapasitas logistik", "forecast / belum tersedia", "Tabel rute prototype", "carrier, capacity_ton, cost_per_ton, lead_time_days"],
        ],
        [1.45 * inch, 1.55 * inch, 2.15 * inch, 1.5 * inch],
    ))
    story.append(Spacer(1, 0.08 * inch))
    story.append(callout(
        "Prinsip data",
        "Kepang AI tidak mengklaim seed, proxy, atau output model sebagai data real-time. Setiap dataset diberi label yang jelas dan sudah diverifikasi langsung di level kode: real-time, official-release, forecast, atau unavailable.",
        fill=LIGHT_AMBER,
    ))
    story.append(h1("5. Impact Measurement"))
    story.append(table(
        ["Indikator", "Target MVP", "Cara Mengukur"],
        [
            ["Waktu menemukan wilayah prioritas", "Di bawah 3 menit", "Uji tugas dengan persona TPID/dinas pangan"],
            ["Penurunan waktu analisis", "50% dibanding baseline manual", "Bandingkan workflow dashboard dengan spreadsheet/manual"],
            ["Penurunan gap pasokan simulatif", "Minimal 30%", "Skenario sebelum dan sesudah redistribusi"],
            ["Potensi efisiensi biaya logistik", "5-10%", "Perbandingan biaya per ton sebelum dan sesudah optimasi rute"],
            ["Kelengkapan data lineage", "100%", "Audit tampilan UI dan respons API - sudah diverifikasi konsisten"],
            ["Validasi rekomendasi", "5-10 interview", "Interview terstruktur dengan calon pengguna - belum dilakukan, lihat bagian 8"],
        ],
        [2.0 * inch, 1.45 * inch, 3.2 * inch],
    ))
    story.append(PageBreak())

    story.append(h1("6. Business Model"))
    story.append(p(
        "Business model tidak berubah sejak submission ke-2: melewati fase pilot terlebih dahulu, lalu berkembang menjadi B2G/B2B SaaS berulang. Data publik tidak dijual sebagai produk utama; yang dimonetisasi adalah integrasi, pemodelan risiko, rekomendasi aksi, audit data, onboarding, dan workflow keputusan lintas pemangku kepentingan."
    ))
    story.append(table(
        ["Sumber Pendapatan", "Pembeli", "Nilai yang Dijual"],
        [
            ["Lisensi institusional tahunan", "Pemda, TPID, Bapanas, Bulog, BI regional", "Akses dashboard, modul, pengguna, dan cakupan wilayah"],
            ["Biaya implementasi", "Institusi pilot", "Setup, integrasi data, pelatihan, dan penyesuaian workflow"],
            ["Managed analytics", "Pemerintah atau mitra enterprise", "Laporan risiko bulanan dan briefing skenario"],
            ["Langganan API", "Institusi, logistik, pembiayaan, asuransi", "Risk score, sinyal anomali, dan route intelligence"],
            ["Logistics add-on", "Carrier, gudang, agregator komoditas", "Optimasi rute, backhaul, dan matching kapasitas"],
            ["Grant / pendanaan inovasi", "Program publik, CSR, donor", "Pendanaan pilot, validasi, dan deployment berdampak sosial"],
        ],
        [1.8 * inch, 2.2 * inch, 2.65 * inch],
    ))
    story.append(h2("Logika Break-even"))
    story.append(callout(
        "Formula utama",
        "Kontribusi recurring per klien standar sekitar Rp192 juta/tahun (lisensi Rp240 juta/tahun dikurangi direct cost sekitar Rp48 juta/tahun). Fixed cost awal sekitar Rp1,09 miliar/tahun, sehingga break-even operasional dicapai pada sekitar 6 klien standar aktif penuh setahun.",
        fill=LIGHT_GREEN,
    ))
    story.append(PageBreak())

    story.append(h1("7. Guidebook Alignment (Tahap 3)"))
    story.append(table(
        ["Kriteria Guidebook", "Bukti di Kepang AI", "Status"],
        [
            ["Use Case Clarity & Alignment", "Use case end-to-end analis TPID -> Resilience Room -> action plan; problem tervalidasi via data sekunder resmi", "Siap - evidence primer (interview) masih gap"],
            ["Algorithm Quality & UX", "Risk scoring dan resilience scoring rule-based, transparan, dapat ditelusuri ke komponen penyusun via API", "Siap"],
            ["Implementation Feasibility", "Innovation Level 3 - functional prototype, 3 integrasi data live terverifikasi, MVP plan dengan milestone dan PIC", "Siap"],
            ["Complexity", "5 sumber data heterogen disatukan dengan arsitektur modular per service, bukan pipeline monolitik", "Siap"],
            ["Business Plan & ROI", "B2G SaaS, break-even ~6 klien, asumsi transparan dan dapat dijelaskan", "Siap"],
            ["Team Readiness for Startup", "4 peran jelas (product, backend, frontend, data/AI), roadmap 6-12 bulan konkret", "Siap"],
        ],
        [1.9 * inch, 3.75 * inch, 1.0 * inch],
    ))
    story.append(PageBreak())

    story.append(h1("8. Test Evidence (Diverifikasi Ulang untuk Tahap 3)"))
    story.append(table(
        ["Pemeriksaan", "Hasil", "Observasi"],
        [
            ["BI Harga Pangan scraper - live fetch", "Lolos", "180 record harga real ditarik untuk 6 komoditas x 6 wilayah, 7 hari terakhir"],
            ["BMKG forecast API - live fetch 6 wilayah", "Lolos", "6/6 kode adm4 valid setelah perbaikan 1 kode wilayah NT yang sebelumnya 404"],
            ["NOAA ONI feed - live fetch", "Lolos", "Fase ENSO aktual berhasil ditarik dan diklasifikasi (El Nino), menggantikan hardcoded value"],
            ["Backend syntax check (env.js, priceService.js, bmkgService.js, index.js)", "Lolos", "Seluruh file yang diubah tervalidasi tanpa error"],
            ["Backend startup dengan validasi env", "Lolos", "Server boot bersih, warning konfigurasi tampil jelas untuk key yang belum diisi"],
            ["Frontend production build", "Lolos", "Vite build selesai setelah pembersihan dead code, tanpa broken import"],
            ["Koneksi database Supabase", "Sempat gagal - project ter-pause, kini di-restore", "Insiden operasional, bukan bug kode; tercatat sebagai risiko pada bagian 9"],
            ["Deploy publik (Render + Vercel) - health check", "Lolos", "Backend live di kepang-ai-api.onrender.com, frontend live di pidi-seven.vercel.app, database ok"],
            ["QA manual di seluruh 8 halaman + 4 sub-tab aplikasi live", "Lolos setelah 1 perbaikan", "Ditemukan teks AI Forecasting offline yang bertentangan dengan data ENSO live ('La Nina' vs 'El Nino' aktual) - diperbaiki dan diverifikasi ulang live"],
            ["Integrasi produksi BPS (var 2506) - live fetch", "Lolos", "36 baris supply_demand ter-update dengan data produksi padi riil per wilayah"],
        ],
        [2.35 * inch, 1.35 * inch, 2.95 * inch],
    ))
    story.append(h1("9. Open Gaps and Next Validation (Dinyatakan Jujur)"))
    story.append(bullets([
        "Evidence of demand masih berbasis data sekunder resmi (BPS/BI/Bapanas); 5-10 wawancara terstruktur dengan TPID/dinas pangan/Bulog belum sempat dilakukan pada submission ini dan menjadi prioritas validasi berikutnya.",
        "Usability testing dengan pengguna eksternal belum formal; pengujian pada tahap ini bersifat verifikasi teknis dan QA manual internal (API, build, integrasi data live, seluruh halaman aplikasi live).",
        "Supply-demand, stok, biaya, dan kapasitas logistik tetap berlabel forecast/unavailable karena data granular Bapanas/Bulog/mitra logistik belum tersedia secara publik - sudah dicek langsung, portal Bapanas memerlukan akses aplikasi internal (S.A.P.A), bukan API terbuka.",
        "Produksi jagung (BPS var 2507) sudah terhubung di kode tapi belum ada baris supply_demand yang cocok untuk di-update, karena tabel itu hanya di-seed untuk beras.",
        "AI Forecasting masih memakai template offline berlabel jelas ('Template offline') karena ANTHROPIC_API_KEY belum diisi; bukan output model live.",
        "Hosting backend gratis (Render free tier) berisiko idle/cold-start; dimitigasi dengan cron job keep-alive yang melakukan health check setiap 10 menit pada akun Render yang sama.",
    ]))

    doc.build(story, onFirstPage=page_footer, onLaterPages=page_footer)
    print(PDF_PATH)


if __name__ == "__main__":
    build_pdf()
