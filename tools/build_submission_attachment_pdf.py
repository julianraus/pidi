from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Image,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from build_submission_attachment import create_architecture_image


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "submission_attachments"
ASSET_DIR = OUT_DIR / "assets"
PDF_PATH = OUT_DIR / "P0684 - Kepang AI Decision Intelligence untuk Resiliensi Ketahanan Pangan Daerah.pdf"

GREEN = colors.HexColor("#047857")
BLUE = colors.HexColor("#2563EB")
DARK = colors.HexColor("#111827")
MUTED = colors.HexColor("#6B7280")
LIGHT_BLUE = colors.HexColor("#E8EEF5")
LIGHT_GREEN = colors.HexColor("#ECFDF5")
LIGHT_AMBER = colors.HexColor("#FFFBEB")
LIGHT_GRAY = colors.HexColor("#F3F4F6")
BORDER = colors.HexColor("#D1D5DB")


def styles():
    base = getSampleStyleSheet()
    base.add(ParagraphStyle(
        name="TitleMain",
        parent=base["Title"],
        fontName="Helvetica-Bold",
        fontSize=28,
        leading=32,
        textColor=GREEN,
        alignment=TA_CENTER,
        spaceAfter=8,
    ))
    base.add(ParagraphStyle(
        name="Subtitle",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=14,
        leading=18,
        textColor=DARK,
        alignment=TA_CENTER,
        spaceAfter=12,
    ))
    base.add(ParagraphStyle(
        name="Meta",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=MUTED,
        alignment=TA_CENTER,
        spaceAfter=8,
    ))
    base.add(ParagraphStyle(
        name="H1Custom",
        parent=base["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=18,
        textColor=BLUE,
        spaceBefore=6,
        spaceAfter=8,
    ))
    base.add(ParagraphStyle(
        name="H2Custom",
        parent=base["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=11.5,
        leading=14,
        textColor=colors.HexColor("#1F4D78"),
        spaceBefore=8,
        spaceAfter=5,
    ))
    base.add(ParagraphStyle(
        name="BodyCustom",
        parent=base["BodyText"],
        fontName="Helvetica",
        fontSize=9.2,
        leading=12,
        textColor=DARK,
        spaceAfter=6,
    ))
    base.add(ParagraphStyle(
        name="Small",
        parent=base["BodyText"],
        fontName="Helvetica",
        fontSize=7.4,
        leading=9,
        textColor=DARK,
    ))
    base.add(ParagraphStyle(
        name="TableCell",
        parent=base["BodyText"],
        fontName="Helvetica",
        fontSize=7.2,
        leading=9,
        textColor=DARK,
    ))
    base.add(ParagraphStyle(
        name="TableHeader",
        parent=base["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=7.5,
        leading=9,
        textColor=DARK,
    ))
    base.add(ParagraphStyle(
        name="CalloutTitle",
        parent=base["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=11,
        textColor=GREEN,
        spaceAfter=3,
    ))
    return base


S = styles()


def p(text, style="BodyCustom"):
    return Paragraph(text, S[style])


def h1(text):
    return Paragraph(text, S["H1Custom"])


def h2(text):
    return Paragraph(text, S["H2Custom"])


def cell(text, header=False):
    safe = str(text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return Paragraph(safe, S["TableHeader" if header else "TableCell"])


def table(headers, rows, widths, header_fill=LIGHT_BLUE):
    data = [[cell(h, header=True) for h in headers]]
    data.extend([[cell(v) for v in row] for row in rows])
    t = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), header_fill),
        ("GRID", (0, 0), (-1, -1), 0.45, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return t


def callout(title, body, fill=LIGHT_GREEN):
    title_safe = str(title).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    body_safe = str(body).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    content = [[Paragraph(f"<b>{title_safe}</b><br/>{body_safe}", S["BodyCustom"])]]
    t = Table(content, colWidths=[6.65 * inch], hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), fill),
        ("BOX", (0, 0), (-1, -1), 0.6, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return t


def bullets(items):
    return ListFlowable(
        [ListItem(p(item, "BodyCustom"), leftIndent=12) for item in items],
        bulletType="bullet",
        start="circle",
        leftIndent=16,
        bulletFontName="Helvetica",
        bulletFontSize=7,
    )


def page_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(0.55 * inch, 0.36 * inch, "Kepang AI - Lampiran Submission Tahap 2")
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
        title="Kepang AI Lampiran Submission Gabungan",
        author="Kepang AI",
    )

    story = []
    story.append(Spacer(1, 0.35 * inch))
    story.append(Paragraph("Kepang AI", S["TitleMain"]))
    story.append(Paragraph("Decision Intelligence untuk Resiliensi Ketahanan Pangan Daerah", S["Subtitle"]))
    story.append(Paragraph("Lampiran Submission Tahap 2", S["Meta"]))
    story.append(Spacer(1, 0.12 * inch))
    story.append(callout(
        "Tujuan",
        "PDF ini merangkum bahan pendukung utama untuk penilaian: bukti kebutuhan, cara kerja solusi, arsitektur sistem, kebijakan data, target dampak, business model, kesiapan MVP, dan rencana validasi berikutnya.",
    ))
    story.append(Spacer(1, 0.16 * inch))
    story.append(table(
        ["Keterangan", "Isi"],
        [
            ["ID Tim", "P0684"],
            ["Nama Tim", "J4"],
            ["Judul Proposal", "Kepang AI: Decision Intelligence untuk Resiliensi Ketahanan Pangan Daerah"],
            ["Status Prototype", "Prototype web lokal dengan API backend, database Supabase, forecasting berbasis sumber data, rekomendasi logistik, dan Evidence Room."],
            ["Nama File", "P0684 - Kepang AI Decision Intelligence untuk Resiliensi Ketahanan Pangan Daerah.pdf"],
        ],
        [1.35 * inch, 5.3 * inch],
    ))
    story.append(PageBreak())

    story.append(h1("1. Executive Summary Pendukung"))
    story.append(p("Kepang AI adalah platform decision intelligence untuk membantu pengambil kebijakan pangan membaca risiko lebih cepat. Masalah yang dijawab bukan sekadar ketiadaan dashboard, melainkan policy lag: harga, cuaca, stok, logistik, dan tekanan makro sering dibaca secara terpisah, sehingga keputusan bisa datang setelah harga pangan lebih dulu bergerak."))
    story.append(p("Kepang AI menyatukan rilis resmi, data yang dapat diperbarui real-time, keluaran model forecasting, dan kebutuhan data yang belum tersedia ke dalam satu ruang keputusan. Dari sana, sistem menghasilkan Resilience Score, simulasi guncangan, rekomendasi rute, action card, KPI, dan data lineage agar keputusan lebih cepat sekaligus tetap dapat diaudit."))
    story.append(table(
        ["Sinyal Bukti", "Maknanya bagi Masalah", "Respons Kepang AI"],
        [
            ["Volatile food 6,24% yoy", "Tekanan pangan masih relevan terhadap inflasi", "Pemantauan inflasi pangan dan penilaian risiko komoditas"],
            ["USD/IDR Rp17.700", "Rupiah yang melemah dapat menekan biaya impor, energi, dan logistik", "Scenario planning kurs dan paparan imported inflation"],
            ["Risiko cuaca", "Gangguan cuaca dapat memengaruhi produksi dan pasokan", "Mesin risiko cuaca berbasis BMKG"],
            ["Ketimpangan wilayah", "Wilayah surplus dan defisit membutuhkan koordinasi distribusi", "Peta surplus-defisit dan rekomendasi rute"],
            ["Kepercayaan data", "Data resmi, forecast, dan seed MVP harus dibedakan", "Data lineage dan daftar data produksi yang dibutuhkan"],
        ],
        [1.65 * inch, 2.3 * inch, 2.7 * inch],
    ))
    story.append(PageBreak())
    story.append(h1("2. Evidence of Demand"))
    story.append(p("Kebutuhan terhadap Kepang AI terlihat dari tiga lapisan: tekanan pangan yang masih nyata, risiko makro yang membuat keputusan pangan harus lebih tahan guncangan, dan kebutuhan institusional untuk menyatukan data yang selama ini tersebar. Artinya, demand tidak hanya datang dari kebutuhan membuat dashboard, tetapi dari kebutuhan mengubah data menjadi keputusan yang lebih cepat, terukur, dan dapat dipertanggungjawabkan."))
    story.append(callout(
        "Kesimpulan demand",
        "Pasar awal Kepang AI adalah institusi yang sudah memiliki mandat stabilisasi pangan tetapi masih membutuhkan decision layer: TPID, pemda, dinas pangan, Bapanas/Bulog, BI regional, dan mitra logistik. Data publik menunjukkan problemnya nyata; rekomendasi Ombudsman dan agenda Satu Data menunjukkan kebutuhan integrasinya juga nyata.",
        fill=LIGHT_AMBER,
    ))
    story.append(table(
        ["Bukti Masalah Nyata", "Sumber", "Sinyal Demand untuk Kepang AI"],
        [
            ["Inflasi Mei 2026 mencapai 3,08% yoy; inflasi provinsi tertinggi 5,94% dan kab/kota tertinggi 6,09%", "BPS, 2 Juni 2026", "Risiko pangan perlu dibaca sampai level wilayah, bukan hanya rata-rata nasional"],
            ["Volatile food mencapai 6,24% yoy, dipengaruhi cabai merah, bawang merah, dan cuaca ekstrem", "Bloomberg Technoz mengutip BPS", "Komoditas pangan strategis membutuhkan early warning berbasis harga, cuaca, dan produksi"],
            ["BI-Rate naik menjadi 5,25%; rupiah 19 Mei 2026 tercatat Rp17.700/USD", "Bank Indonesia RDG Mei 2026", "Keputusan pangan perlu scenario planning terhadap imported inflation, energi, dan biaya logistik"],
            ["PIHPS BI menghimpun harga komoditas pangan strategis lintas provinsi dan jenis pasar", "Bank Indonesia", "Pipeline harga pangan real-time/near-real-time feasible untuk prototype dan pilot"],
            ["BMKG menyediakan prakiraan cuaca desa 3 hari, per 3 jam, diperbarui 2 kali sehari", "BMKG Open Data", "Data cuaca dapat diubah menjadi sinyal risiko panen dan pasokan"],
            ["Ombudsman meminta integrasi data harga, produksi, konsumsi, distribusi, dan stok beras melalui Satu Data Indonesia", "Ombudsman RI, Feb 2026", "Kepang AI tepat sebagai lapisan integrasi, audit data, dan mitigasi stok-distribusi"],
            ["Bapanas memiliki Open Data untuk ketersediaan, konsumsi, kerawanan, dan keterjangkauan pangan", "Open Data Bapanas", "Solusi dapat berangkat dari data publik dan diperkuat bertahap lewat data mitra"],
            ["Disparitas akses pangan dan kerentanan iklim masih menjadi tantangan Indonesia", "WFP Indonesia CSP 2026-2030", "Resilience Score dan prioritas wilayah relevan untuk ketahanan pangan jangka panjang"],
        ],
        [2.65 * inch, 1.45 * inch, 2.55 * inch],
    ))
    story.append(PageBreak())

    story.append(h1("3. Problem-Solution Mapping"))
    story.append(table(
        ["Masalah", "Mekanisme Solusi", "Hasil"],
        [
            ["Data pangan tersebar", "Harga, supply-demand, cuaca, makro, dan logistik disatukan dalam satu ruang keputusan", "Pengambil keputusan melihat penyebab risiko, bukan hanya gejala kenaikan harga"],
            ["Policy lag", "Early warning, Resilience Score, action card, dan rekomendasi redistribusi", "Intervensi stok, operasi pasar, dan mitigasi panen dapat dimulai lebih cepat"],
            ["Rupiah melemah dan imported inflation", "Scenario planning kurs, eksposur komoditas impor, dan simulasi biaya logistik", "Keputusan pangan lebih siap menghadapi shock eksternal"],
            ["Kualitas data belum jelas", "Data lineage membedakan real-time, official-release, forecast, dan unavailable", "Rekomendasi lebih transparan dan mudah diaudit"],
            ["Rute logistik belum optimal", "Ranking rute, estimasi volume, ETA/jarak Google bila tersedia, dan kebutuhan data mitra", "Redistribusi dari wilayah surplus ke defisit menjadi lebih terarah"],
        ],
        [1.75 * inch, 2.45 * inch, 2.45 * inch],
    ))
    story.append(Spacer(1, 0.08 * inch))
    story.append(h1("4. System Architecture"))
    story.append(p("Arsitektur Kepang AI dibuat modular agar mudah dikembangkan dari prototype menuju pilot. Frontend berfungsi sebagai ruang kerja analis, backend mengorkestrasi data dan model, database menyimpan data serta metadata sumber, sedangkan data lineage menjaga agar setiap output tetap jelas asal-usul dan statusnya."))
    story.append(Image(str(arch_path), width=6.65 * inch, height=4.35 * inch))
    story.append(PageBreak())

    story.append(h1("5. Data & Feasibility"))
    story.append(table(
        ["Dataset", "Status Saat Ini", "Sumber / Metode", "Kebutuhan untuk Produksi"],
        [
            ["Inflasi dan makro", "official-release", "Rilis BPS dan BI", "Pipeline pembaruan berkala dari rilis resmi"],
            ["Prakiraan cuaca", "siap real-time", "BMKG Open Data", "Pemetaan kode adm4 untuk semua wilayah target"],
            ["Harga pangan", "siap real-time", "Scraper/API BI Harga Pangan; Bapanas jika endpoint stabil", "Akses endpoint yang stabil dan pencatatan timestamp sumber"],
            ["Supply-demand", "forecast / seed MVP", "Seed prototype; data Bapanas/Bulog/Dinas dibutuhkan", "production_ton, stock_ton, demand_ton, warehouse_id"],
            ["ETA/jarak logistik", "real-time jika API key tersedia", "Google Routes API untuk rute jalan yang sesuai", "API key Google dan koordinat titik asal-tujuan yang dapat dirutekan"],
            ["Biaya/kapasitas logistik", "forecast / belum tersedia", "Tabel rute prototype", "carrier, capacity_ton, cost_per_ton, lead_time_days"],
            ["Resilience Score", "forecast", "Model Kepang AI", "Validasi terhadap data historis dan intervensi lapangan"],
        ],
        [1.45 * inch, 1.25 * inch, 2.05 * inch, 1.9 * inch],
    ))
    story.append(Spacer(1, 0.08 * inch))
    story.append(callout(
        "Prinsip data",
        "Kepang AI tidak mengklaim seed, proxy, atau output model sebagai data real-time. Setiap dataset diberi label yang jelas: real-time, official-release, forecast, atau unavailable.",
        fill=LIGHT_AMBER,
    ))
    story.append(h1("6. Impact Measurement"))
    story.append(table(
        ["Indikator", "Target MVP", "Cara Mengukur"],
        [
            ["Waktu menemukan wilayah prioritas", "Di bawah 3 menit", "Uji tugas dengan persona TPID/dinas pangan"],
            ["Penurunan waktu analisis", "50% dibanding baseline manual", "Bandingkan workflow dashboard dengan spreadsheet/manual"],
            ["Penurunan gap pasokan simulatif", "Minimal 30%", "Skenario sebelum dan sesudah redistribusi"],
            ["Potensi efisiensi biaya logistik", "5-10%", "Perbandingan biaya per ton sebelum dan sesudah optimasi rute"],
            ["Kelengkapan data lineage", "100%", "Audit tampilan UI dan respons API"],
            ["Validasi rekomendasi", "5-10 interview", "Interview terstruktur dengan calon pengguna"],
        ],
        [2.0 * inch, 1.45 * inch, 3.2 * inch],
    ))
    story.append(PageBreak())

    story.append(h1("7. Business Model"))
    story.append(p("Business model Kepang AI dirancang untuk melewati fase pilot terlebih dahulu, lalu berkembang menjadi B2G/B2B SaaS yang berulang. Prinsipnya: data publik tidak dijual sebagai produk utama; yang dimonetisasi adalah integrasi, pemodelan risiko, rekomendasi aksi, audit data, onboarding, dan workflow keputusan lintas pemangku kepentingan."))
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
    story.append(h2("Asumsi Harga dan Unit Economics"))
    story.append(table(
        ["Paket / Komponen", "Harga Estimasi", "Cara Hitung dan Catatan"],
        [
            ["Pilot 3-4 bulan", "Rp75-150 juta one-time", "Audit data, setup wilayah, training, dashboard MVP, dan laporan evaluasi pilot"],
            ["Lisensi regional standar", "Rp15-30 juta/bulan", "Cocok untuk pemda/TPID/dinas pangan; asumsi base-case Rp20 juta/bulan"],
            ["Enterprise nasional/multiwilayah", "Rp900 juta-1,5 miliar/tahun", "Untuk lembaga pusat atau agregator besar dengan integrasi, SSO, dan SLA lebih tinggi"],
            ["Managed analytics", "Rp8-25 juta/bulan", "Briefing risiko bulanan, laporan komoditas, dan scenario note untuk pengambil keputusan"],
            ["API/logistics add-on", "Rp5-15 juta/bulan/partner", "Akses risk score, anomali harga, ETA/jarak, dan rekomendasi redistribusi"],
            ["Kontribusi per klien standar", "Rp340 juta tahun pertama", "Rp100 juta setup + Rp20 juta/bulan x 12; direct cost estimasi Rp83 juta; kontribusi kotor sekitar Rp257 juta"],
        ],
        [1.85 * inch, 1.55 * inch, 3.25 * inch],
    ))
    story.append(PageBreak())
    story.append(h2("Asumsi Perhitungan"))
    story.append(table(
        ["Asumsi", "Nilai Base-Case", "Alasan / Implikasi"],
        [
            ["Mata uang dan pajak", "Rupiah; belum memasukkan PPN/PPh", "Angka dibuat sebagai model proposal MVP, bukan laporan keuangan audited"],
            ["Unit pelanggan", "1 institusi regional = 1 akun berbayar", "Contoh: pemda/TPID/dinas pangan/Bulog regional; enterprise nasional dihitung terpisah"],
            ["Durasi kontrak", "12 bulan untuk lisensi; Year 1 memakai rata-rata 6 bulan", "Year 1 masih fase pilot sehingga kontrak diasumsikan belum berjalan penuh sejak awal tahun"],
            ["Biaya implementasi", "Rp100 juta per klien baru", "Mencakup audit data, setup wilayah, integrasi awal, training, dan laporan evaluasi"],
            ["Lisensi standar", "Rp20 juta/bulan; Year 1 didiskon menjadi Rp15 juta/bulan", "Diskon Year 1 dipakai untuk mempercepat adopsi pilot dan validasi demand"],
            ["Managed analytics", "Rp8 juta/bulan pada Year 1; meningkat saat skala naik", "Layanan manusia + sistem: briefing risiko, laporan komoditas, dan scenario note"],
            ["API/logistics add-on", "Rp5-15 juta/bulan/partner", "Dipakai setelah ada mitra logistik/data; tidak dihitung agresif pada Year 1"],
            ["Direct cost per klien", "Rp48 juta/tahun recurring + Rp35 juta setup awal", "Cloud, API peta/cuaca, data pipeline, support, dan onboarding teknis"],
            ["Fixed cost Year 1", "Rp1,09 miliar/tahun", "Tim inti, cloud/API/security/data, validasi lapangan, legal, administrasi, dan procurement"],
            ["Break-even", "Sekitar 6 klien standar aktif", "Rumus: fixed cost Rp1,09 miliar / kontribusi recurring Rp192 juta per klien per tahun"],
        ],
        [1.55 * inch, 1.55 * inch, 3.55 * inch],
    ))
    story.append(callout(
        "Formula utama",
        "Revenue = setup fee + lisensi bulanan + managed analytics + API/logistics add-on. Expense = fixed cost tim dan operasional + direct cost per klien. Net = revenue - expense. Kontribusi recurring per klien = Rp240 juta lisensi tahunan - Rp48 juta direct cost tahunan = Rp192 juta.",
        fill=LIGHT_AMBER,
    ))
    story.append(PageBreak())
    story.append(h2("Estimasi Revenue dan Expense"))
    story.append(table(
        ["Tahun", "Asumsi Revenue", "Estimasi Expense", "Hasil"],
        [
            ["Year 1 - Pilot", "3 pilot x Rp100 juta setup = Rp300 juta; 3 lisensi rata-rata 6 bulan x Rp15 juta = Rp270 juta; managed analytics 2 klien x 6 bulan x Rp8 juta = Rp96 juta. Total revenue: Rp666 juta.", "Tim inti 5 orang Rp720 juta; cloud/API/security/data Rp180 juta; validasi lapangan/training Rp120 juta; legal/admin/procurement Rp70 juta. Total expense: Rp1,09 miliar.", "Net: -Rp424 juta. Ditutup lewat grant, sponsorship, atau dana inovasi karena fokus tahun pertama adalah validasi dan pilot."],
            ["Year 2 - Early Scale", "8 institusi x Rp20 juta/bulan x 12 = Rp1,92 miliar; 5 setup baru x Rp100 juta = Rp500 juta; managed analytics Rp600 juta; API/logistics add-on Rp360 juta. Total revenue: Rp3,38 miliar.", "Tim 8 orang Rp1,34 miliar; cloud/API/data Rp300 juta; sales/implementation Rp350 juta; compliance/admin Rp150 juta. Total expense: Rp2,19 miliar.", "Net: +Rp1,19 miliar. Break-even tercapai bila minimal 6 klien standar aktif setahun penuh."],
            ["Year 3 - Scale-up", "20 institusi x Rp20 juta/bulan x 12 = Rp4,8 miliar; 12 setup baru = Rp1,2 miliar; 1 enterprise nasional = Rp900 juta; managed analytics Rp1,8 miliar; API/logistics add-on Rp1,2 miliar. Total revenue: Rp9,9 miliar.", "Tim 15 orang Rp2,88 miliar; cloud/API/security/data Rp800 juta; sales/partner/implementation Rp850 juta; G&A/compliance Rp350 juta. Total expense: Rp4,88 miliar.", "Net: +Rp5,02 miliar. Skala ekonomis muncul karena platform multi-tenant dan modul analitik dapat dipakai ulang lintas wilayah."],
        ],
        [0.95 * inch, 2.35 * inch, 2.15 * inch, 1.6 * inch],
    ))
    story.append(callout(
        "Logika break-even",
        "Dengan lisensi standar Rp240 juta/tahun dan direct cost sekitar Rp48 juta/tahun per klien, kontribusi recurring per klien sekitar Rp192 juta/tahun. Fixed cost awal sekitar Rp1,09 miliar/tahun, sehingga break-even operasional dicapai pada sekitar 6 klien standar aktif, atau lebih cepat bila tiap klien juga membayar biaya implementasi.",
        fill=LIGHT_GREEN,
    ))
    story.append(PageBreak())
    story.append(h1("8. Guidebook Alignment"))
    story.append(table(
        ["Kriteria Guidebook", "Bukti di Kepang AI", "Status"],
        [
            ["Alignment with Problem Statement", "Fokus pada digitalisasi ketahanan pangan, policy lag, supply-demand, harga, cuaca, logistik, dan rupiah", "Siap"],
            ["Effectiveness & Impact", "Resilience Score, action card, target KPI, gap pasokan, dan efisiensi rute", "Siap untuk MVP"],
            ["Uniqueness / Creativity", "Ruang keputusan terpadu, skenario guncangan rupiah, data lineage, dan logistik yang transparan sumbernya", "Siap"],
            ["Technical Quality", "React/Vite, Express, PostgreSQL/Supabase, scraper BI, layanan BMKG, dan Google Routes opsional", "Prototype siap"],
            ["Business Model Feasibility", "B2G SaaS, biaya implementasi, managed analytics, langganan API, dan logistics add-on", "Siap"],
        ],
        [1.8 * inch, 3.75 * inch, 1.1 * inch],
    ))
    story.append(PageBreak())

    story.append(h1("9. Implementation Readiness"))
    story.append(table(
        ["Pemeriksaan", "Hasil", "Observasi"],
        [
            ["Build frontend", "Lolos", "Build produksi Vite selesai; peringatan ukuran chunk tidak menghambat"],
            ["Cek sintaks backend", "Lolos", "Route forecast, route logistik, dan googleRoutesService valid"],
            ["GET /api/health", "Lolos", "status=ok, database=ok, Redis disabled pada setup lokal"],
            ["GET /api/forecast/resilience", "Lolos", "Konteks makro, Resilience Score, kebijakan data, dan asal-usul data dikembalikan"],
            ["GET /api/logistics/recommendations", "Lolos", "Ranking rute, kebijakan sumber data, dan daftar data produksi yang dibutuhkan dikembalikan"],
            ["Cek browser", "Lolos", "Evidence Room dan Dashboard tampil tanpa karakter rusak"],
        ],
        [1.7 * inch, 0.85 * inch, 4.1 * inch],
    ))
    story.append(h1("10. Roadmap Pilot dan Scale-up"))
    story.append(bullets([
        "Pilot 3-4 bulan dimulai pada 2-3 wilayah prioritas dan 5-10 komoditas strategis untuk mengukur penurunan waktu analisis, ketepatan prioritas wilayah, dan manfaat rekomendasi logistik.",
        "Integrasi data produksi bertahap difokuskan pada stok, produksi, konsumsi, gudang, carrier, kapasitas angkut, lead time, dan biaya per ton agar rekomendasi semakin presisi saat masuk tahap pilot.",
        "Co-creation dengan TPID, dinas pangan, Bapanas/Bulog, BI regional, gudang, carrier, dan pelaku pasar digunakan untuk menyelaraskan workflow aplikasi dengan proses keputusan yang benar-benar dipakai di lapangan.",
        "Modul logistik ditingkatkan dari estimasi ETA/jarak menjadi route intelligence yang menggabungkan data peta, kapasitas mitra, biaya aktual, dan prioritas redistribusi dari wilayah surplus ke defisit.",
        "Scale-up dilakukan melalui model multi-tenant: satu platform inti dapat dipakai lintas wilayah, sementara konfigurasi komoditas, wilayah, pengguna, dan data partner dapat disesuaikan per institusi.",
        "Aset pendukung pilot mencakup demo produk, dashboard Evidence Room, dokumentasi data lineage, dan laporan KPI yang memudahkan juri, calon mitra, dan institusi pengguna memahami nilai Kepang AI.",
    ]))
    story.append(h1("11. Daftar Sumber"))
    story.append(table(
        ["Sumber", "URL"],
        [
            ["BPS Inflasi Mei 2026", "https://www.bps.go.id/id/pressrelease/2026/06/02/2579/inflasi-year-on-year--y-on-y--pada-mei-2026-sebesar-3-08-persen-.html"],
            ["Bloomberg Technoz / BPS volatile food", "https://www.bloombergtechnoz.com/detail-news/110660/inflasi-mei-2026-tembus-3-08-kemenkeu-janji-jaga-akses-pangan"],
            ["BI RDG Mei 2026", "https://www.bi.go.id/id/publikasi/ruang-media/news-release/Pages/sp_2810726.aspx"],
            ["BI PIHPS Nasional", "https://www.bi.go.id/id/publikasi/ruang-media/news-release/Pages/sp_2517423.aspx"],
            ["BPS Ekspor-Impor Februari 2026", "https://www.bps.go.id/assets/pressrelease/2026/04/01/2557/ekspor-dan-impor-indonesia-februari-2026-masing-masing-tercatat-usd-22-17-miliar-dan-usd-20-89-miliar-.html"],
            ["BPS NTP Mei 2026", "https://www.bps.go.id/id/pressrelease/2026/06/02/2580/nilai-tukar-petani--ntp--mei-2026-sebesar-127-73-atau-naik-1-99-persen.html"],
            ["BMKG Open Data", "https://data.bmkg.go.id/prakiraan-cuaca"],
            ["Open Data Bapanas", "https://data.badanpangan.go.id/home"],
            ["Ombudsman RI SPHP Beras", "https://ombudsman.go.id/news/download/ombudsman-ri-sampaikan-tindakan-korektif-layanan-stabilisasi-pasokan-dan-harga-pangan-sphp-beras"],
            ["Satu Data Indonesia", "https://setkab.go.id/presiden-jokowi-tandangani-perpres-no-392019-tentang-satu-data-indonesia/"],
            ["SPBE Perpres 95/2018", "https://peraturan.bpk.go.id/Details/96913/perpres-"],
            ["WFP Indonesia CSP 2026-2030", "https://www.wfp.org/operations/id03-indonesia-country-strategic-plan-2026-2030"],
            ["Bapanas Renstra 2025-2029", "https://peraturan.go.id/filespengundangan/peraturan-bapanas-no-9-tahun-2025.pdf"],
        ],
        [1.85 * inch, 4.8 * inch],
    ))

    doc.build(story, onFirstPage=page_footer, onLaterPages=page_footer)
    print(PDF_PATH)


if __name__ == "__main__":
    build_pdf()
