"""Builds the 3rd Submission Proposal attachment PDF for Kepang AI (v4).

Refreshes v3 content to the current live app: 34-province choropleth map,
per-province BI rice price layer, and the Industry design-system Cockpit
(role switcher, scenario simulator, source health panel, export brief).

Screenshot policy (important): this script never fabricates a screenshot.
For each screenshot slot it looks for a real PNG/JPG the user has placed in
submission_attachments/assets/screenshots/<slot>.(png|jpg). If found, it is
resized/compressed and embedded. If not found, an explicit text placeholder
("SCREENSHOT BELUM DITEMPEL") with capture instructions is rendered instead
- never an image that could be mistaken for a real screenshot.
"""

from pathlib import Path

from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import (
    Image as RLImage,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
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
    LIGHT_GRAY,
    MUTED,
    BORDER,
)

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "submission_attachments"
ASSET_DIR = OUT_DIR / "assets"
SHOT_DIR = ASSET_DIR / "screenshots"
SHOT_PROCESSED_DIR = ASSET_DIR / "screenshots_processed"
PDF_PATH = OUT_DIR / "P0684 - Kepang AI Lampiran Submission Tahap 3.pdf"

MAX_SHOT_WIDTH_PX = 1400
CONTENT_WIDTH = 6.65 * inch

SCREENSHOT_SLOTS = [
    {
        "id": "cockpit_hero",
        "title": "1. Cockpit - Decision Brief & Resilience Score",
        "instructions": (
            "Buka https://pidi-seven.vercel.app, biarkan peran default 'TPID'. "
            "Screenshot dari bagian atas (judul Cockpit) sampai baris 4 kartu "
            "metrik (Resilience Score / USD-IDR / Volatile Food / Wilayah "
            "Defisit)."
        ),
    },
    {
        "id": "province_map",
        "title": "2. Peta Status Nasional - 34 Provinsi",
        "instructions": (
            "Scroll ke kartu 'Peta Status Nasional - 34 Provinsi'. Arahkan "
            "kursor ke satu provinsi berwarna merah (mis. Papua atau "
            "Kalimantan) sampai tooltip harga muncul, lalu screenshot."
        ),
    },
    {
        "id": "simulator_source_health",
        "title": "3. Simulator Shock & Source Health",
        "instructions": (
            "Scroll ke panel 'Simulator Shock' (kanan) dan 'Source Health & "
            "Data Lineage' (bawah). Geser salah satu slider (mis. 'Rupiah "
            "melemah') dulu supaya skor skenario terlihat berubah, baru "
            "screenshot."
        ),
    },
    {
        "id": "export_brief",
        "title": "4. Export Decision Brief",
        "instructions": (
            "Klik tombol 'Export decision brief' di kanan atas Cockpit "
            "sampai modal terbuka, lalu screenshot modal tersebut."
        ),
    },
]


def process_screenshot(slot_id):
    """Return a reportlab Image() for a real screenshot if present, else None."""
    SHOT_PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    for ext in (".png", ".jpg", ".jpeg"):
        raw = SHOT_DIR / f"{slot_id}{ext}"
        if raw.exists():
            img = PILImage.open(raw).convert("RGB")
            if img.width > MAX_SHOT_WIDTH_PX:
                ratio = MAX_SHOT_WIDTH_PX / img.width
                img = img.resize((MAX_SHOT_WIDTH_PX, int(img.height * ratio)))
            out_path = SHOT_PROCESSED_DIR / f"{slot_id}.jpg"
            img.save(out_path, "JPEG", quality=82, optimize=True)
            display_h = CONTENT_WIDTH * (img.height / img.width)
            return RLImage(str(out_path), width=CONTENT_WIDTH, height=display_h)
    return None


def screenshot_block(slot):
    story = [h2(slot["title"])]
    img = process_screenshot(slot["id"])
    if img is not None:
        story.append(img)
    else:
        placeholder = Table(
            [[Paragraph(
                f"<b>SCREENSHOT BELUM DITEMPEL</b><br/>"
                f"Simpan file di: submission_attachments/assets/screenshots/{slot['id']}.png"
                f"<br/><br/><i>{slot['instructions']}</i>",
                S["BodyCustom"],
            )]],
            colWidths=[CONTENT_WIDTH],
        )
        placeholder.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GRAY),
            ("BOX", (0, 0), (-1, -1), 1.1, colors.HexColor("#9CA3AF")),
            ("LEFTPADDING", (0, 0), (-1, -1), 14),
            ("RIGHTPADDING", (0, 0), (-1, -1), 14),
            ("TOPPADDING", (0, 0), (-1, -1), 22),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 22),
        ]))
        story.append(placeholder)
    story.append(Spacer(1, 0.14 * inch))
    return story


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
    SHOT_DIR.mkdir(parents=True, exist_ok=True)
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
        "PDF ini merangkum bahan pendukung untuk penilaian tahap 3: progress sejak submission ke-2, bukti integrasi data real-time yang terverifikasi langsung (termasuk harga per 34 provinsi), tangkapan layar produk live, arsitektur sistem, kebijakan data, KPI dampak, business model, dan gap yang masih terbuka secara jujur.",
    ))
    story.append(Spacer(1, 0.16 * inch))
    story.append(table(
        ["Keterangan", "Isi"],
        [
            ["ID Tim", "P0684"],
            ["Nama Tim", "J4"],
            ["Judul Proposal", "Kepang AI: Decision Intelligence untuk Resiliensi Ketahanan Pangan Daerah"],
            ["Status Prototype", "Live deployment end-to-end: backend API (Render), frontend (Vercel), database Supabase, empat integrasi data eksternal real-time terverifikasi (BI Harga Pangan konsumen+produsen+per-34-provinsi, BMKG, NOAA ENSO, BPS produksi padi), peta nasional 34 provinsi, Cockpit dengan role switcher dan scenario simulator, forecasting, dan rekomendasi logistik."],
            ["Link Demo Live", "Frontend: https://pidi-seven.vercel.app  |  Backend: https://kepang-ai-api.onrender.com/api/health"],
            ["Nama File", "P0684 - Kepang AI Lampiran Submission Tahap 3.pdf"],
        ],
        [1.35 * inch, 5.3 * inch],
    ))
    story.append(PageBreak())

    story.append(h1("1. Progress Sejak Submission Tahap 2"))
    story.append(p(
        "Sejak submission ke-2, pengembangan berjalan dalam tiga gelombang: (a) menghilangkan ketergantungan pada data dummy dan memverifikasi setiap sumber data eksternal benar-benar hidup, (b) memperluas cakupan peta dari 6 wilayah agregasi menjadi 34 provinsi dengan lapisan harga per-provinsi live, dan (c) merombak antarmuka menjadi Cockpit institusional dengan fitur pengambilan keputusan baru."
    ))
    story.append(table(
        ["Perubahan", "Bukti / Verifikasi", "Dampak"],
        [
            ["Aktivasi BI Harga Pangan scraper real-time (konsumen + produsen)", "Diuji langsung: ratusan record harga aktual ditarik untuk 6+ komoditas x 6 wilayah, dua level harga sekaligus", "Harga komoditas dan margin distribusi produsen-konsumen berasal dari data live"],
            ["Aktivasi BMKG Open Data untuk seluruh wilayah pilot", "6/6 kode wilayah adm4 diverifikasi hidup; 1 kode wilayah (NT) ditemukan tidak valid (404) dan diperbaiki", "Forecast cuaca dan risk score panen berbasis data live untuk semua wilayah"],
            ["Penggantian asumsi fase ENSO", "Fetch live dari NOAA Oceanic Nino Index setiap siklus polling", "Mengoreksi bias model risiko sesuai kondisi aktual (El Nino)"],
            ["Integrasi produksi padi BPS (var 2506)", "Diuji langsung: baris supply_demand di-update dengan produksi riil per wilayah, ditandai production_source='bps'", "production_ton tidak lagi 100% seed untuk komoditas beras"],
            ["Peta nasional 34 provinsi (choropleth)", "GeoJSON batas provinsi disederhanakan dan diverifikasi 34/34 nama cocok dengan data BI; dirender inline SVG tanpa library peta eksternal", "Granularitas naik dari 6 wilayah agregasi menjadi peta provinsi yang bisa diklik/di-hover"],
            ["Lapisan harga beras per provinsi (live, BI)", "Diuji langsung pada data BI asli: 34/34 provinsi terisi, median nasional Rp15.900, deviasi terverifikasi (Papua/Kalimantan +20-23%, NTB/DIY/Sulsel di bawah median)", "Peta menampilkan disparitas harga riil antarprovinsi, bukan estimasi"],
            ["Redesain Cockpit (sistem desain Industry)", "Role switcher (TPID/Bulog/BI Regional/Logistik), scenario simulator interaktif, panel Source Health, export decision brief - seluruhnya diverifikasi berfungsi di build produksi", "Decision brief kini menyesuaikan peran pengguna; skenario shock bisa diuji sebelum keputusan diambil"],
            ["Deploy publik end-to-end + QA berulang", "Backend (Render) dan frontend (Vercel) live; setiap fitur baru diverifikasi live setelah deploy, bukan hanya di lokal", "Prototype dapat diakses publik dan konsisten dengan kode yang di-commit"],
        ],
        [1.95 * inch, 2.55 * inch, 2.15 * inch],
    ))
    story.append(Spacer(1, 0.08 * inch))
    story.append(callout(
        "Kenapa ini penting",
        "Guideline submission tahap 3 secara eksplisit melarang mengklaim status atau data yang tidak dapat diverifikasi. Perubahan di atas diverifikasi langsung terhadap data live (bukan hanya diasumsikan berfungsi), termasuk pengecekan 34/34 nama provinsi cocok dan distribusi harga yang masuk akal secara geografis.",
        fill=LIGHT_AMBER,
    ))
    story.append(PageBreak())

    story.append(h1("2. Problem-Solution Mapping"))
    story.append(table(
        ["Masalah", "Mekanisme Solusi", "Hasil"],
        [
            ["Data pangan tersebar", "Harga, supply-demand, cuaca, makro, dan logistik disatukan dalam satu Cockpit", "Pengambil keputusan melihat penyebab risiko, bukan hanya gejala kenaikan harga"],
            ["Policy lag", "Resilience Score, decision brief berprioritas (owner/timeframe/KPI), dan rekomendasi redistribusi", "Intervensi stok, operasi pasar, dan mitigasi panen dapat dimulai lebih cepat"],
            ["Disparitas harga antarwilayah tidak terlihat", "Peta choropleth 34 provinsi dengan harga beras live per provinsi vs median nasional", "Wilayah bertekanan harga tinggi (mis. Papua, Kalimantan) langsung terlihat, bukan tersembunyi dalam rata-rata nasional"],
            ["Rekomendasi tidak relevan per instansi", "Role switcher (TPID/Bulog/BI Regional/Logistik) menyesuaikan brief dan aksi prioritas", "Setiap instansi melihat rekomendasi yang sesuai mandatnya"],
            ["Sulit menguji skenario sebelum bertindak", "Scenario simulator (rupiah/logistik/panen) dengan skor real-time", "Keputusan pangan lebih siap menghadapi shock eksternal sebelum terjadi"],
            ["Kualitas data belum jelas", "Data lineage (real-time/official-release/forecast/unavailable) + panel Source Health dengan skor confidence", "Rekomendasi transparan dan dapat diaudit langsung dari API response"],
        ],
        [1.85 * inch, 2.5 * inch, 2.3 * inch],
    ))
    story.append(Spacer(1, 0.08 * inch))
    story.append(h1("3. System Architecture"))
    story.append(p(
        "Arsitektur Kepang AI modular: setiap sumber data eksternal adalah service terpisah sehingga kegagalan satu sumber tidak menjatuhkan yang lain. Lapisan harga per-provinsi disimpan di tabel snapshot terpisah agar tidak mengganggu pipeline agregat 6-wilayah yang sudah stabil. Setiap output tetap membawa status data yang dapat ditelusuri."
    ))
    story.append(RLImage(str(arch_path), width=6.65 * inch, height=4.35 * inch))
    story.append(PageBreak())

    story.append(h1("4. Tangkapan Layar Produk Live"))
    story.append(p(
        "Empat momen kunci dari aplikasi live (https://pidi-seven.vercel.app), sesuai urutan alur demo. Bila slot menampilkan instruksi bertulis 'SCREENSHOT BELUM DITEMPEL', berarti file belum tersedia saat PDF ini dibuat - lihat instruksi di dalam kotak untuk melengkapinya sendiri."
    ))
    story.append(Spacer(1, 0.08 * inch))
    for slot in SCREENSHOT_SLOTS:
        for flowable in screenshot_block(slot):
            story.append(flowable)
    story.append(PageBreak())

    story.append(h1("5. Data Source and Feasibility Matrix (Diperbarui)"))
    story.append(table(
        ["Dataset", "Status Saat Ini", "Sumber / Metode", "Kebutuhan untuk Produksi"],
        [
            ["Harga pangan (konsumen + produsen, 6 wilayah)", "real-time (terverifikasi live)", "BI Harga Pangan scraper - endpoint GetGridDataDaerah, dua price_type_id", "Monitoring stabilitas endpoint jangka panjang"],
            ["Harga beras per provinsi (34 provinsi, peta nasional)", "real-time (terverifikasi live)", "BI Harga Pangan tanpa agregasi, snapshot table + refresh terjadwal", "Perluasan ke komoditas lain selain beras"],
            ["Prakiraan cuaca", "real-time (terverifikasi live)", "BMKG Open Data, 6/6 titik adm4 wilayah pilot", "Perluasan titik adm4 saat cakupan wilayah bertambah"],
            ["Fase ENSO (input risk model)", "real-time (terverifikasi live)", "NOAA Oceanic Nino Index, feed publik tanpa API key", "Tidak ada - sumber sudah stabil dan gratis"],
            ["Produksi padi", "real-time (terverifikasi live)", "BPS WebAPI (var 2506), per provinsi diagregasi ke 6 wilayah", "Perluasan ke jagung (var 2507) dan komoditas lain"],
            ["Inflasi dan makro", "official-release", "Rilis BPS dan BI", "Pipeline pembaruan berkala dari rilis resmi"],
            ["Supply-demand dan stok", "forecast / seed MVP - dicek, tidak ada API publik", "Seed prototype; data granular Bapanas terkunci di sistem internal S.A.P.A", "Kemitraan resmi dengan Bapanas/Bulog/Dinas Pangan"],
            ["ETA/jarak logistik", "real-time jika API key tersedia", "Google Routes API untuk rute jalan yang sesuai", "API key Google dan koordinat titik asal-tujuan"],
            ["Biaya/kapasitas logistik", "forecast / belum tersedia", "Tabel rute prototype", "carrier, capacity_ton, cost_per_ton, lead_time_days"],
        ],
        [1.85 * inch, 1.35 * inch, 2.0 * inch, 1.45 * inch],
    ))
    story.append(Spacer(1, 0.08 * inch))
    story.append(callout(
        "Prinsip data",
        "Kepang AI tidak mengklaim seed, proxy, atau output model sebagai data real-time. Setiap dataset diberi label yang jelas dan sudah diverifikasi langsung di level kode: real-time, official-release, forecast, atau unavailable. Prinsip yang sama berlaku untuk lampiran ini - lihat kebijakan screenshot di bagian 4.",
        fill=LIGHT_AMBER,
    ))
    story.append(h1("6. Impact Measurement"))
    story.append(table(
        ["Indikator", "Target MVP", "Cara Mengukur"],
        [
            ["Waktu menemukan wilayah prioritas", "Di bawah 3 menit", "Uji tugas dengan persona TPID/dinas pangan"],
            ["Penurunan waktu analisis", "50% dibanding baseline manual", "Bandingkan workflow Cockpit dengan spreadsheet/manual"],
            ["Penurunan gap pasokan simulatif", "Minimal 30%", "Skenario sebelum dan sesudah redistribusi"],
            ["Potensi efisiensi biaya logistik", "5-10%", "Perbandingan biaya per ton sebelum dan sesudah optimasi rute"],
            ["Kelengkapan data lineage", "100%", "Audit tampilan UI dan respons API - sudah diverifikasi konsisten"],
            ["Cakupan granularitas peta", "34/34 provinsi", "Verifikasi nama provinsi vs GeoJSON dan snapshot harga - sudah 100%"],
            ["Validasi rekomendasi", "5-10 interview", "Interview terstruktur dengan calon pengguna - dijadwalkan, lihat bagian 9"],
        ],
        [2.0 * inch, 1.45 * inch, 3.2 * inch],
    ))
    story.append(PageBreak())

    story.append(h1("7. Business Model"))
    story.append(p(
        "Business model tidak berubah sejak submission ke-2: melewati fase pilot terlebih dahulu, lalu berkembang menjadi B2G/B2B SaaS berulang. Konteks pasar diperkuat: APBN 2026 mengalokasikan Rp210,4 triliun untuk ketahanan pangan, sehingga anggaran untuk decision infrastructure tersedia di sisi pembeli."
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
        "Kontribusi recurring per klien standar sekitar Rp192 juta/tahun (lisensi Rp240 juta/tahun dikurangi direct cost sekitar Rp48 juta/tahun). Fixed cost awal sekitar Rp1,09 miliar/tahun, sehingga break-even operasional dicapai pada sekitar 6 klien standar aktif penuh setahun. Angka ini asumsi model bisnis internal, belum hasil negosiasi klien aktual.",
        fill=LIGHT_GREEN,
    ))
    story.append(PageBreak())

    story.append(h1("8. Guidebook Alignment (Tahap 3)"))
    story.append(table(
        ["Kriteria Guidebook", "Bukti di Kepang AI", "Status"],
        [
            ["Use Case Clarity & Alignment", "Use case end-to-end analis TPID -> Cockpit -> peta 34 provinsi -> action plan; problem tervalidasi via data sekunder resmi", "Siap - evidence primer (interview) masih gap, dijadwalkan"],
            ["Algorithm Quality & UX", "Risk scoring, resilience scoring, dan deviasi harga per provinsi rule-based, transparan, dapat ditelusuri ke komponen penyusun via API", "Siap"],
            ["Implementation Feasibility", "Innovation Level 3 - functional prototype live, empat integrasi data live terverifikasi, MVP plan dengan milestone dan PIC", "Siap"],
            ["Complexity", "5+ sumber data heterogen disatukan dengan arsitektur modular per service, lintas 34 provinsi, bukan pipeline monolitik", "Siap"],
            ["Business Plan & ROI", "B2G SaaS, break-even ~6 klien, konteks pasar APBN Rp210,4T, asumsi transparan", "Siap"],
            ["Team Readiness for Startup", "4 peran jelas (product, backend, frontend, data/AI), roadmap 6-12 bulan konkret", "Siap"],
        ],
        [1.9 * inch, 3.75 * inch, 1.0 * inch],
    ))
    story.append(PageBreak())

    story.append(h1("9. Test Evidence (Diverifikasi Ulang untuk Tahap 3)"))
    story.append(table(
        ["Pemeriksaan", "Hasil", "Observasi"],
        [
            ["BI Harga Pangan scraper - live fetch (6 wilayah)", "Lolos", "Record harga real ditarik untuk 6+ komoditas x 6 wilayah, konsumen dan produsen"],
            ["BI Harga Pangan per-provinsi - live fetch (34 provinsi)", "Lolos", "34/34 provinsi terisi; median Rp15.900; distribusi geografis masuk akal (lumbung padi di bawah median, wilayah jauh di atas)"],
            ["Kecocokan nama provinsi GeoJSON vs data BI", "Lolos", "34/34 nama cocok tanpa mismatch - diverifikasi dengan perbandingan set nama"],
            ["BMKG forecast API - live fetch 6 wilayah", "Lolos", "6/6 kode adm4 valid setelah perbaikan 1 kode wilayah NT yang sebelumnya 404"],
            ["NOAA ONI feed - live fetch", "Lolos", "Fase ENSO aktual berhasil ditarik dan diklasifikasi (El Nino)"],
            ["BPS WebAPI produksi padi - live fetch", "Lolos", "Data produksi per provinsi diagregasi ke 6 wilayah, production_source='bps'"],
            ["Frontend production build (redesign Industry)", "Lolos", "Vite build selesai tanpa error setelah redesain Cockpit, sidebar, dan 7 halaman lain"],
            ["Peta choropleth 34 provinsi - render live", "Lolos", "34 path SVG ter-render di produksi; hover/tooltip dan legend berfungsi; nol error console"],
            ["Role switcher & scenario simulator - interaksi live", "Lolos", "Berpindah peran mengubah decision brief; slider skenario mengubah skor secara real-time"],
            ["Deploy publik (Render + Vercel) - health check", "Lolos", "Backend live, frontend live, database ok, data per-provinsi populated=true"],
        ],
        [2.35 * inch, 1.05 * inch, 3.25 * inch],
    ))
    story.append(h1("10. Open Gaps and Next Validation (Dinyatakan Jujur)"))
    story.append(bullets([
        "Evidence of demand masih berbasis data sekunder resmi (BPS/BI/Bapanas); wawancara terstruktur dengan pihak Bank Indonesia yang menangani pangan sedang dijadwalkan sebagai langkah validasi pertama, disusul TPID/dinas pangan.",
        "Usability testing dengan pengguna eksternal belum formal; pengujian pada tahap ini bersifat verifikasi teknis dan QA manual internal (API, build, integrasi data live, interaksi UI live).",
        "Supply-demand, stok, biaya, dan kapasitas logistik tetap berlabel forecast/unavailable karena data granular Bapanas/Bulog/mitra logistik belum tersedia secara publik - sudah dicek langsung, portal Bapanas memerlukan akses aplikasi internal (S.A.P.A), bukan API terbuka.",
        "Peta harga per provinsi saat ini hanya untuk komoditas beras; komoditas lain masih memakai granularitas 6 wilayah agregasi.",
        "Produksi jagung (BPS var 2507) sudah terhubung di kode tapi belum ada baris supply_demand yang cocok untuk di-update.",
        "AI Forecasting masih memakai template offline berlabel jelas ('Template offline') karena ANTHROPIC_API_KEY belum diisi; bukan output model live.",
        "Hosting backend gratis (Render free tier) berisiko idle/cold-start; dimitigasi dengan cron job keep-alive setiap 10 menit.",
    ]))

    doc.build(story, onFirstPage=page_footer, onLaterPages=page_footer)
    print(PDF_PATH)
    size_mb = PDF_PATH.stat().st_size / (1024 * 1024)
    print(f"Size: {size_mb:.2f} MB (limit 5 MB)")


if __name__ == "__main__":
    build_pdf()
