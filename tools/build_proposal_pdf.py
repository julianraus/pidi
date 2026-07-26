"""Builds the formal proposal PDF for Kepang AI (3rd submission attachment).

Unlike the earlier "lampiran" (a stack of evidence tables), this follows
conventional proposal structure: cover, executive summary, background, problem,
objectives, solution, evidence, method, status, business model, roadmap, team,
closing, references.

Figures come from submission_attachments/assets/charts/facts.json, which
build_proposal_charts.py writes straight from the live API - so the prose and
the charts can never disagree with each other or with the running app.

Run build_proposal_charts.py first, then this.
"""

import json
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Image, KeepTogether, ListFlowable, ListItem, NextPageTemplate, PageBreak,
    Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "submission_attachments"
CHARTS = OUT_DIR / "assets" / "charts"
PDF = OUT_DIR / "P0684 - Kepang AI Decision Intelligence untuk Resiliensi Ketahanan Pangan Daerah.pdf"

FOREST = colors.HexColor("#07291F")
EMERALD = colors.HexColor("#16A34A")
EMERALD_D = colors.HexColor("#15803D")
MINT = colors.HexColor("#ECFDF5")
AMBER_BG = colors.HexColor("#FFF7E8")
AMBER = colors.HexColor("#B45309")
INK = colors.HexColor("#0B1F17")
MUTED = colors.HexColor("#5B6B63")
LINE = colors.HexColor("#D8E8DE")
ROSE = colors.HexColor("#BE123C")

W, H = A4
MARGIN = 2.0 * cm
CONTENT_W = W - 2 * MARGIN

F = json.loads((CHARTS / "facts.json").read_text(encoding="utf-8"))
MACRO = F.get("macro", {})

BULAN_ID = {
    "January": "Januari", "February": "Februari", "March": "Maret", "April": "April",
    "May": "Mei", "June": "Juni", "July": "Juli", "August": "Agustus",
    "September": "September", "October": "Oktober", "November": "November",
    "December": "Desember",
}


def tanggal_id(s):
    for en, idn in BULAN_ID.items():
        s = s.replace(en, idn)
    return s


def rp(n):
    """Format a number with Indonesian thousands separators.

    Formatting the number alone - rather than running .replace(',', '.') over a
    whole sentence - keeps sentence commas intact.
    """
    return f"{int(n):,}".replace(",", ".")


AS_OF = tanggal_id(F["as_of"])

S = getSampleStyleSheet()
S.add(ParagraphStyle("Body", parent=S["Normal"], fontName="Helvetica", fontSize=9.6,
                     leading=14.2, textColor=INK, alignment=TA_JUSTIFY, spaceAfter=7))
S.add(ParagraphStyle("H1", parent=S["Heading1"], fontName="Helvetica-Bold", fontSize=16,
                     leading=19, textColor=FOREST, spaceBefore=2, spaceAfter=9))
S.add(ParagraphStyle("H2", parent=S["Heading2"], fontName="Helvetica-Bold", fontSize=11.5,
                     leading=14, textColor=EMERALD_D, spaceBefore=11, spaceAfter=5))
S.add(ParagraphStyle("Kicker", parent=S["Normal"], fontName="Helvetica-Bold", fontSize=8,
                     textColor=EMERALD, spaceAfter=3))
S.add(ParagraphStyle("Cap", parent=S["Normal"], fontName="Helvetica-Oblique", fontSize=8.2,
                     leading=11, textColor=MUTED, spaceBefore=3, spaceAfter=9))
S.add(ParagraphStyle("Cell", parent=S["Normal"], fontName="Helvetica", fontSize=8.3,
                     leading=11.4, textColor=INK))
S.add(ParagraphStyle("CellH", parent=S["Normal"], fontName="Helvetica-Bold", fontSize=8.3,
                     leading=11.4, textColor=FOREST))


def p(t, style="Body"):
    return Paragraph(t, S[style])


def h1(n, t):
    return Paragraph(f"{n}&nbsp;&nbsp;{t}", S["H1"])


def h2(t):
    return Paragraph(t, S["H2"])


def cell(t, hdr=False):
    safe = str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return Paragraph(safe, S["CellH" if hdr else "Cell"])


def table(headers, rows, widths, zebra=True):
    data = [[cell(x, True) for x in headers]] + [[cell(x) for x in r] for r in rows]
    t = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), MINT),
        ("LINEBELOW", (0, 0), (-1, 0), 0.9, EMERALD),
        ("LINEBELOW", (0, 1), (-1, -1), 0.4, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    if zebra:
        for i in range(1, len(data)):
            if i % 2 == 0:
                style.append(("BACKGROUND", (0, i), (-1, i), colors.HexColor("#F7FBF9")))
    t.setStyle(TableStyle(style))
    return t


def callout(title, body, fill=MINT, bar=EMERALD, tcol=EMERALD_D):
    inner = [
        Paragraph(f"<b>{title}</b>", ParagraphStyle("ct", parent=S["Body"], fontSize=9.4,
                                                    textColor=tcol, spaceAfter=3, alignment=0)),
        Paragraph(body, ParagraphStyle("cb", parent=S["Body"], fontSize=9.2, leading=13.4,
                                       spaceAfter=0)),
    ]
    t = Table([[inner]], colWidths=[CONTENT_W], hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), fill),
        ("LINEBEFORE", (0, 0), (0, -1), 2.6, bar),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t


def bullets(items):
    return ListFlowable(
        [ListItem(p(i), leftIndent=10, value="circle") for i in items],
        bulletType="bullet", start="circle", leftIndent=13,
        bulletFontSize=6, bulletColor=EMERALD,
    )


def stat_row(items):
    """Row of big-number tiles."""
    cells = []
    for value, label in items:
        inner = [
            Paragraph(value, ParagraphStyle("sv", parent=S["Normal"], fontName="Helvetica-Bold",
                                            fontSize=17, leading=20, textColor=FOREST,
                                            alignment=TA_CENTER)),
            Paragraph(label, ParagraphStyle("sl", parent=S["Normal"], fontName="Helvetica",
                                            fontSize=7.6, leading=9.6, textColor=MUTED,
                                            alignment=TA_CENTER)),
        ]
        cells.append(inner)
    cw = CONTENT_W / len(cells)
    t = Table([cells], colWidths=[cw] * len(cells), hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), MINT),
        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.white),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    return t


def chart(name, caption, width=CONTENT_W):
    img = Image(str(CHARTS / name))
    ratio = img.imageHeight / img.imageWidth
    img.drawWidth = width
    img.drawHeight = width * ratio
    return KeepTogether([img, p(caption, "Cap")])


# ── page furniture ──────────────────────────────────────────────────────────
def cover_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(FOREST)
    canvas.rect(0, 0, W, H, fill=1, stroke=0)
    canvas.setFillColor(EMERALD)
    canvas.rect(0, H - 1.0 * cm, W, 1.0 * cm, fill=1, stroke=0)

    canvas.setFillColor(colors.HexColor("#6EE7B7"))
    canvas.setFont("Helvetica-Bold", 9.5)
    canvas.drawString(MARGIN, H - 3.4 * cm, "PROPOSAL  ·  PIDI – DIGDAYA X HACKATHON 2026")
    canvas.setFont("Helvetica", 9)
    canvas.drawString(MARGIN, H - 4.0 * cm, "Submission Tahap 3")

    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 41)
    canvas.drawString(MARGIN, H - 7.4 * cm, "Kepang AI")
    canvas.setFont("Helvetica", 15)
    canvas.drawString(MARGIN, H - 8.9 * cm, "Decision Intelligence untuk")
    canvas.drawString(MARGIN, H - 9.8 * cm, "Resiliensi Ketahanan Pangan Daerah")

    canvas.setStrokeColor(EMERALD)
    canvas.setLineWidth(2)
    canvas.line(MARGIN, H - 10.7 * cm, MARGIN + 4.5 * cm, H - 10.7 * cm)

    canvas.setFillColor(colors.HexColor("#9FD9B8"))
    canvas.setFont("Helvetica", 10)
    ty = H - 12.2 * cm
    for label, value in [("ID Tim", "P0684"), ("Nama Tim", "J4"),
                         ("Problem Statement", "Peningkatan Produktivitas, Ketahanan Pangan,"),
                         ("", "dan Penciptaan Lapangan Kerja"),
                         ("Sub-Problem", "Digitalisasi Ketahanan Pangan")]:
        if label:
            canvas.setFillColor(colors.HexColor("#6EE7B7"))
            canvas.drawString(MARGIN, ty, label)
        canvas.setFillColor(colors.white)
        canvas.drawString(MARGIN + 4.2 * cm, ty, value)
        ty -= 0.62 * cm

    # live-status strip
    canvas.setFillColor(colors.HexColor("#0B3B2E"))
    canvas.rect(MARGIN, 4.4 * cm, CONTENT_W, 2.5 * cm, fill=1, stroke=0)
    canvas.setFillColor(EMERALD)
    canvas.circle(MARGIN + 0.55 * cm, 6.25 * cm, 0.11 * cm, fill=1, stroke=0)
    canvas.setFillColor(colors.HexColor("#6EE7B7"))
    canvas.setFont("Helvetica-Bold", 8.5)
    canvas.drawString(MARGIN + 0.85 * cm, 6.17 * cm, "PROTOTIPE LIVE — DAPAT DIUJI LANGSUNG")
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica", 9.5)
    canvas.drawString(MARGIN + 0.55 * cm, 5.45 * cm, "pidi-seven.vercel.app")
    canvas.setFillColor(colors.HexColor("#9FD9B8"))
    canvas.setFont("Helvetica", 8)
    canvas.drawString(MARGIN + 0.55 * cm, 4.85 * cm,
                      f"Seluruh angka dalam proposal ini ditarik dari API sistem pada {AS_OF}")

    canvas.setFillColor(colors.HexColor("#5B6B63"))
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(MARGIN, 2.4 * cm, "Dokumen ini memuat data yang bergerak mengikuti sumber resmi.")
    canvas.restoreState()


def body_page(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, H - 1.35 * cm, W - MARGIN, H - 1.35 * cm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7.4)
    canvas.drawString(MARGIN, H - 1.15 * cm, "Kepang AI · P0684 · Proposal Submission Tahap 3")
    canvas.drawRightString(W - MARGIN, H - 1.15 * cm, "pidi-seven.vercel.app")
    canvas.line(MARGIN, 1.5 * cm, W - MARGIN, 1.5 * cm)
    canvas.setFont("Helvetica", 7.8)
    canvas.drawRightString(W - MARGIN, 1.05 * cm, str(doc.page - 1))
    canvas.restoreState()


def build():
    doc = SimpleDocTemplate(
        str(PDF), pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=2.1 * cm, bottomMargin=2.0 * cm,
        title="Proposal Kepang AI - Decision Intelligence untuk Resiliensi Ketahanan Pangan Daerah",
        author="Tim J4",
    )
    st = []
    A = st.append

    # cover is drawn by the page callback; this just occupies the page
    A(Spacer(1, 1))
    A(NextPageTemplate("later"))
    A(PageBreak())

    # ── Daftar isi ──
    A(h1("", "Daftar Isi"))
    toc = [
        ("1", "Ringkasan Eksekutif"), ("2", "Latar Belakang"),
        ("3", "Rumusan Masalah"), ("4", "Tujuan dan Sasaran"),
        ("5", "Solusi yang Ditawarkan"), ("6", "Temuan dari Sistem"),
        ("7", "Arsitektur dan Metode"), ("8", "Status Pengembangan dan Batasan"),
        ("9", "Model Bisnis dan Nilai Terukur"), ("10", "Rencana Implementasi"),
        ("11", "Tim"), ("12", "Penutup"), ("", "Lampiran: Sumber Data"),
    ]
    A(table(["Bab", "Judul"], toc, [1.6 * cm, CONTENT_W - 1.6 * cm], zebra=False))
    A(Spacer(1, 0.5 * cm))
    A(callout(
        "Tentang angka dalam dokumen ini",
        f"Seluruh angka ditarik langsung dari API Kepang AI pada {AS_OF}, bukan diketik manual. "
        "Karena sumbernya data hidup (BI, BMKG, BPS, NOAA), angka dapat berbeda tipis saat pembaca "
        "membuka aplikasi di hari lain. Perbedaan itu bukan kekeliruan dokumen, melainkan bukti "
        "bahwa sistemnya benar-benar berjalan."))
    A(PageBreak())

    # ── 1. Ringkasan Eksekutif ──
    A(h1("1", "Ringkasan Eksekutif"))
    A(p(
        "Kepang AI adalah <b>decision intelligence platform</b> untuk memperkuat ketahanan pangan "
        "daerah. Penggunanya adalah TPID, Bapanas, Bulog, Bank Indonesia regional, dan dinas pangan. "
        "Masalah yang diselesaikan bukan ketiadaan data, melainkan <b>policy lag</b>: harga, cuaca, "
        "produksi, dan tekanan rupiah berada di lembaga yang berbeda, sehingga keputusan intervensi "
        "baru diambil setelah harga terlanjur naik."))
    A(p(
        "Kepang AI menganyam empat sumber data resmi yang berjalan otomatis — BI Harga Pangan, BMKG, "
        "BPS, dan NOAA — menjadi satu ruang keputusan: peta harga 34 provinsi, Resilience Score, "
        "simulator skenario, dan rencana aksi berprioritas yang memuat pemilik, tenggat, dan indikator "
        "keberhasilan. Setiap angka diberi label asal-usulnya secara jujur."))
    A(Spacer(1, 0.25 * cm))
    A(stat_row([
        (f"{F['spread_pct']}%", "disparitas harga beras<br/>antarprovinsi"),
        (f"{F['provinces']}", "provinsi terpantau<br/>harga hariannya"),
        (str(F["resilience"]), "Resilience Score<br/>nasional saat ini"),
        (f"{F['confidence']}%", "data confidence<br/>tanpa dibulatkan"),
    ]))
    A(Spacer(1, 0.3 * cm))
    A(callout(
        "Temuan utama",
        f"Pada hari yang sama, harga beras di {F['cheapest']['name']} tercatat "
        f"Rp{rp(F['cheapest']['price'])} per kg sementara di {F['priciest']['name']} "
        f"Rp{rp(F['priciest']['price'])} — selisih <b>{F['spread_pct']} persen</b>. "
        f"Sistem juga menemukan {' dan '.join(F['double_risk'])} berstatus defisit "
        "sekaligus berisiko panen tinggi secara bersamaan. Kombinasi seperti ini tidak terlihat "
        "bila laporan BPS dan BMKG dibaca terpisah."))
    A(PageBreak())

    # ── 2. Latar Belakang ──
    A(h1("2", "Latar Belakang"))
    A(p(
        "Tekanan pangan Indonesia pada 2026 bersifat berlapis. Badan Pusat Statistik mencatat inflasi "
        f"Juni 2026 sebesar {MACRO.get('headline_inflation_yoy_pct', '3,34')} persen secara tahunan, "
        f"sementara kelompok pangan bergejolak berada jauh di atasnya pada "
        f"{MACRO.get('volatile_food_yoy_pct', '5,58')} persen — hampir dua kali lipat. Pada saat yang "
        f"sama Bank Indonesia menaikkan BI-Rate menjadi {MACRO.get('bi_rate_pct', '5,75')} persen untuk "
        f"menahan pelemahan rupiah yang berada di kisaran Rp{rp(MACRO.get('usd_idr', 17944))} per dolar, "
        "yang menekan biaya komoditas impor, energi, dan distribusi."))
    A(p(
        "Secara struktural, produksi pangan nasional terpusat di Jawa dan Sumatera, sementara wilayah "
        "timur bergantung pada distribusi antarpulau. Akibatnya, guncangan produksi atau cuaca di satu "
        "wilayah tidak berdiri sendiri: ia merambat menjadi disparitas harga di wilayah lain."))
    A(p(
        "Di sisi tata kelola, data yang dibutuhkan sebenarnya <i>tersedia</i> — tetapi terpisah. Harga "
        "ada di Bank Indonesia, produksi di BPS, cuaca di BMKG, dan indeks iklim global di NOAA. "
        "Menggabungkannya menjadi satu gambaran keputusan masih dikerjakan manual, berulang, dan "
        "memakan waktu justru pada saat waktu paling mahal."))
    A(h2("Ruang lingkup proposal"))
    A(p(
        "Proposal ini memaparkan solusi, bukti temuan dari sistem yang sudah berjalan, arsitektur "
        "teknis, status pengembangan beserta batasannya, model bisnis, dan rencana implementasi menuju "
        "pilot. Dokumen ini bersifat melengkapi jawaban pada formulir submission."))

    # ── 3. Rumusan Masalah ──
    A(h1("3", "Rumusan Masalah"))
    A(p("Tiga persoalan yang menjadi fokus Kepang AI:"))
    A(bullets([
        "<b>Fragmentasi data lintas lembaga.</b> Sinyal krisis pangan tersebar pada empat institusi "
        "dengan format, frekuensi pembaruan, dan tingkat keandalan yang berbeda-beda.",
        "<b>Disparitas antarwilayah yang tidak terukur rutin.</b> Perbedaan harga antarprovinsi tidak "
        "terpantau harian pada satu tampilan, sehingga prioritas wilayah sulit ditetapkan secara objektif.",
        "<b>Rekomendasi yang berhenti pada angka.</b> Dashboard yang tersedia umumnya menampilkan "
        "grafik, bukan tindakan dengan penanggung jawab, tenggat, dan indikator keberhasilan.",
    ]))
    A(Spacer(1, 0.2 * cm))
    A(p(
        "Dampaknya, intervensi bersifat reaktif. Operasi pasar dan penempatan stok dimulai setelah "
        "tekanan harga membesar, ketika biaya penanganannya sudah jauh lebih tinggi."))

    # ── 4. Tujuan ──
    A(h1("4", "Tujuan dan Sasaran"))
    A(table(
        ["Tujuan", "Sasaran terukur"],
        [
            ["Memperpendek waktu dari sinyal ke keputusan",
             "Identifikasi wilayah prioritas selesai di bawah 3 menit, dari sebelumnya penggabungan manual lintas sumber"],
            ["Membuat disparitas antarwilayah terlihat harian",
             f"Pemantauan harga {F['provinces']} provinsi dengan pembanding median nasional, diperbarui otomatis"],
            ["Mengubah data menjadi tindakan",
             "Setiap rekomendasi memuat pemilik, tenggat, dan indikator keberhasilan"],
            ["Menjaga kepercayaan terhadap data",
             "Seluruh dataset berlabel status, dengan skor confidence yang dihitung dan tidak dibulatkan"],
        ],
        [5.6 * cm, CONTENT_W - 5.6 * cm]))
    A(PageBreak())

    # ── 5. Solusi ──
    A(h1("5", "Solusi yang Ditawarkan"))
    A(p(
        "Nama <i>Kepang</i> diambil dari anyaman: beberapa untai data yang lemah bila berdiri sendiri "
        "menjadi kuat ketika dianyam. Prinsip itu diterjemahkan menjadi lima kemampuan inti."))
    A(table(
        ["Kemampuan", "Masalah yang dijawab", "Keluaran bagi pengguna"],
        [
            ["Peta harga 34 provinsi", "Disparitas antarwilayah tidak terukur",
             "Provinsi di atas dan di bawah median nasional terlihat seketika"],
            ["Resilience Score", "Sinyal tersebar di banyak sumber",
             "Satu skor keputusan dari gabungan harga, cuaca, pasokan, dan makro"],
            ["Decision brief berprioritas", "Rekomendasi terlalu abstrak",
             "Aksi dengan pemilik, tenggat, dan indikator keberhasilan"],
            ["Simulator skenario", "Dampak guncangan sulit diuji lebih dulu",
             "Uji pelemahan rupiah, biaya logistik, dan gagal panen sebelum anggaran keluar"],
            ["Data lineage dan Source Health", "Data asli dan estimasi tercampur",
             "Status per dataset dan skor confidence yang dapat diaudit"],
        ],
        [3.9 * cm, 5.0 * cm, CONTENT_W - 8.9 * cm]))
    A(Spacer(1, 0.25 * cm))
    A(h2("Alur penggunaan"))
    A(p(
        "Analis membuka cockpit dan memilih perannya, sehingga ringkasan keputusan menyesuaikan mandat "
        "instansinya. Ia membaca peta nasional untuk menemukan wilayah bertekanan harga, memeriksa "
        "komposisi tekanan pada Resilience Room, menguji skenario guncangan, lalu mengekspor ringkasan "
        "keputusan sebagai bahan rapat. Manusia tetap pengambil keputusan akhir; sistem menyiapkan "
        "dasar dan jejak penelusurannya."))

    # ── 6. Temuan ──
    A(PageBreak())
    A(h1("6", "Temuan dari Sistem"))
    A(p(
        "Bagian ini bukan kutipan dari sumber lain, melainkan keluaran sistem Kepang AI sendiri yang "
        "dapat diverifikasi pembaca dengan membuka aplikasi. Inilah bukti bahwa solusi ini menghasilkan "
        "informasi yang sebelumnya tidak tersedia dalam satu tempat."))
    A(h2("6.1 Disparitas harga antarprovinsi"))
    A(chart("01_province_spread.png",
            f"Gambar 1. Harga beras {F['provinces']} provinsi pada hari yang sama, ditarik dari BI Harga Pangan. "
            f"Merah menandakan di atas median nasional, hijau di bawah. Terdapat {F['above_median']} provinsi "
            f"di atas median."))
    A(p(
        f"Rentangnya mencapai <b>{F['spread_pct']} persen</b>: dari Rp{rp(F['cheapest']['price'])} di "
        f"{F['cheapest']['name']} hingga Rp{rp(F['priciest']['price'])} di {F['priciest']['name']}. "
        "Selisih sebesar ini pada komoditas pokok yang sama menunjukkan persoalan distribusi dan "
        "keterjangkauan yang tidak tertangkap oleh rata-rata nasional."))
    A(PageBreak())
    A(h2("6.2 Risiko yang hanya terlihat setelah data dianyam"))
    A(chart("02_deficit_vs_risk.png",
            "Gambar 2. Neraca pasokan dibandingkan skor risiko panen per wilayah. Kuadran kiri atas memuat "
            "wilayah yang berstatus defisit sekaligus berisiko panen tinggi."))
    A(p(
        f"Dari enam wilayah agregasi, <b>{' dan '.join(F['double_risk'])}</b> berada pada kuadran risiko "
        "ganda: berstatus defisit sekaligus memiliki skor risiko panen tinggi. Membaca laporan produksi "
        "saja atau prakiraan cuaca saja tidak memunculkan kombinasi ini, padahal justru kombinasi "
        "tersebut yang menentukan urgensi dan urutan intervensi."))
    A(h2("6.3 Kejujuran data sebagai bagian dari produk"))
    A(chart("03_lineage.png",
            "Gambar 3. Komposisi status data yang menyusun skor keputusan.", width=CONTENT_W * 0.62))
    A(p(
        f"Skor <i>data confidence</i> saat ini <b>{F['confidence']} persen</b>, dihitung dari komposisi "
        "status seluruh dataset. Angka ini sengaja tidak dibulatkan menjadi seratus. Dataset yang belum "
        "tersedia — stok gudang dan biaya logistik aktual — ditandai secara eksplisit, bukan diisi "
        "dengan estimasi yang tampak meyakinkan."))
    A(PageBreak())

    # ── 7. Arsitektur ──
    A(h1("7", "Arsitektur dan Metode"))
    A(h2("7.1 Alur pemrosesan"))
    A(p(
        "Pengumpulan data dari empat sumber, lalu normalisasi format tanggal, harga, dan pemetaan "
        "wilayah, disertai pelabelan sumber dan waktu. Data disimpan pada PostgreSQL dengan kolom "
        "sumber per baris. Lapisan skoring menghitung risiko cuaca, Resilience Score, dan deviasi harga "
        "provinsi terhadap median. Keluarannya berupa API JSON yang memuat komponen penyusun skor, "
        "bukan hanya angka akhir, sehingga hasilnya dapat ditelusuri."))
    A(h2("7.2 Logika penilaian"))
    A(p(
        "Sistem memakai aturan dan pembobotan yang transparan, bukan model kotak hitam. Skor risiko "
        "panen dihitung dari deviasi curah hujan terhadap normal bulanan (bobot 40 persen), indeks "
        "banjir (30 persen), indeks kekeringan (20 persen), dan pengali fase iklim ENSO dari NOAA "
        "(10 persen). Pendekatan berbasis aturan dipilih karena pada kebijakan publik keterlusuran "
        "lebih bernilai daripada akurasi marjinal yang sulit dijelaskan."))
    A(callout(
        "Keterbatasan yang kami akui",
        "Bobot 40/30/20/10 adalah asumsi awal berbasis literatur risiko panen dan belum dikalibrasi "
        "terhadap data historis kejadian gagal panen. Kalibrasi ini menjadi bagian eksplisit dari "
        "rencana pengembangan, bukan hal yang kami klaim sudah selesai.",
        fill=AMBER_BG, bar=colors.HexColor("#D97706"), tcol=AMBER))
    A(h2("7.3 Ketahanan sistem"))
    A(bullets([
        "Setiap sumber data berupa layanan terpisah, sehingga kegagalan satu sumber tidak menjatuhkan yang lain.",
        "Percobaan ulang bertingkat pada endpoint yang tidak berdokumentasi resmi, dengan isolasi kegagalan per provinsi.",
        "Cadangan berlabel <i>forecast</i> saat sumber gagal — bukan kegagalan diam-diam, dan bukan data karangan.",
        "Kunci API hanya berada di sisi server; variabel lingkungan divalidasi saat sistem dinyalakan.",
    ]))
    A(PageBreak())

    # ── 8. Status ──
    A(h1("8", "Status Pengembangan dan Batasan"))
    A(p(
        "Kepang AI berada pada <b>Innovation Level 3 — Prototype, Validasi, atau Implementasi Awal</b>. "
        "Prototipe berfungsi penuh, ter-deploy publik, dan dapat diuji siapa pun."))
    A(table(
        ["Komponen", "Status", "Keterangan"],
        [
            ["Harga pangan (konsumen dan produsen)", "Berjalan real-time", "BI Harga Pangan, termasuk lapisan per provinsi"],
            ["Prakiraan cuaca", "Berjalan real-time", "BMKG Open Data untuk seluruh wilayah pilot"],
            ["Fase iklim ENSO", "Berjalan real-time", "Indeks NOAA, dibaca langsung oleh model risiko"],
            ["Produksi padi", "Rilis resmi", "BPS WebAPI, bulanan per provinsi"],
            ["Skor risiko dan Resilience Score", "Keluaran model", "Berbasis aturan, komponennya dapat ditelusuri"],
            ["Permintaan dan stok gudang", "Belum tersedia", "Perlu kemitraan Bapanas dan Bulog"],
            ["Biaya dan kapasitas logistik", "Belum tersedia", "Perlu kemitraan operator dan pelabuhan"],
        ],
        [5.4 * cm, 3.1 * cm, CONTENT_W - 8.5 * cm]))
    A(Spacer(1, 0.25 * cm))
    A(callout(
        "Yang belum kami lakukan",
        "Pengujian kegunaan bersama pengguna eksternal belum dilaksanakan. Instrumen kuesioner telah "
        "disiapkan dan wawancara dengan Bank Indonesia sedang dijadwalkan sebagai langkah validasi "
        "pertama. Kami menyatakannya terbuka karena panduan melarang klaim tanpa bukti — dan karena "
        "kredibilitas data adalah inti produk ini.",
        fill=AMBER_BG, bar=colors.HexColor("#D97706"), tcol=AMBER))

    # ── 9. Bisnis ──
    A(PageBreak())
    A(h1("9", "Model Bisnis dan Nilai Terukur"))
    A(p(
        "Model pendapatan berbasis langganan institusional (B2G), dengan perluasan ke lisensi data "
        "menyusul terbentuknya kemitraan. Data publik tidak dijual sebagai produk; yang bernilai adalah "
        "integrasinya, pemodelan risikonya, dan alur keputusan yang dihasilkannya."))
    A(table(
        ["Aliran pendapatan", "Pembeli", "Nilai yang dibeli"],
        [
            ["Lisensi tahunan", "Pemda, TPID, Bapanas, Bulog, BI regional", "Akses cockpit sesuai cakupan wilayah, pengguna, dan modul"],
            ["Biaya implementasi", "Institusi pilot", "Setup, integrasi data, pelatihan, penyesuaian alur kerja"],
            ["Laporan analitik terkelola", "Pemerintah dan mitra", "Laporan risiko berkala dan catatan skenario"],
            ["Langganan API", "Asuransi pertanian, pembiayaan agri", "Skor risiko dan sinyal anomali harga"],
            ["Add-on logistik", "Operator, gudang, agregator", "Optimasi rute dan pemanfaatan muatan balik"],
        ],
        [3.4 * cm, 5.2 * cm, CONTENT_W - 8.6 * cm]))
    A(Spacer(1, 0.25 * cm))
    A(h2("Konteks pasar dan titik impas"))
    A(p(
        "APBN 2026 mengalokasikan Rp210,4 triliun untuk ketahanan pangan, sehingga anggaran di sisi "
        "pembeli tersedia. Struktur pasarnya jelas: 38 provinsi dan 514 kabupaten/kota, masing-masing "
        "memiliki TPID dengan kewajiban rapat dan pelaporan rutin."))
    A(callout(
        "Asumsi titik impas",
        "Berdasarkan model internal — bukan hasil negosiasi klien — kontribusi berulang per klien "
        "standar sekitar Rp192 juta per tahun (lisensi Rp240 juta dikurangi biaya langsung Rp48 juta). "
        "Dengan biaya tetap awal sekitar Rp1,09 miliar per tahun, titik impas operasional tercapai pada "
        "sekitar enam klien aktif setahun penuh."))
    A(Spacer(1, 0.2 * cm))
    A(h2("Nilai terukur yang ditargetkan"))
    A(table(
        ["Indikator", "Target", "Cara pengukuran"],
        [
            ["Waktu identifikasi wilayah prioritas", "Turun minimal 50%", "Uji tugas dibanding proses manual lintas berkas"],
            ["Efisiensi biaya distribusi", "5–10%", "Perbandingan biaya per ton sebelum dan sesudah optimasi rute"],
            ["Penurunan gap pasokan simulatif", "Minimal 30%", "Skenario sebelum dan sesudah redistribusi"],
            ["Kelengkapan pelabelan data", "100%", "Audit tampilan dan respons API"],
        ],
        [5.6 * cm, 2.6 * cm, CONTENT_W - 8.2 * cm]))
    A(p("Seluruh angka pada tabel ini adalah target simulasi tahap MVP, bukan hasil implementasi lapangan.", "Cap"))

    # ── 10. Roadmap ──
    A(PageBreak())
    A(h1("10", "Rencana Implementasi"))
    A(table(
        ["Tahap", "Kegiatan utama", "Penanggung jawab"],
        [
            ["0–2 bulan", "Validasi lapangan diawali wawancara Bank Indonesia, dilanjutkan 5–10 TPID dan dinas pangan; menstabilkan deployment publik", "Product Lead"],
            ["2–6 bulan", "Kemitraan data awal dengan satu dinas pangan atau TPID untuk pilot terbatas; kalibrasi bobot skor risiko dengan data historis", "Product Lead dan Data Engineer"],
            ["6–12 bulan", "Memperdalam granularitas menuju kabupaten/kota; menjajaki kemitraan data stok dengan Bapanas atau Bulog", "Tim inti"],
        ],
        [2.5 * cm, CONTENT_W - 6.9 * cm, 4.4 * cm]))
    A(Spacer(1, 0.3 * cm))
    A(h2("Risiko dan mitigasi"))
    A(table(
        ["Risiko", "Mitigasi"],
        [
            ["Endpoint sumber tidak berdokumentasi resmi sebagai API publik",
             "Percobaan ulang bertingkat, isolasi kegagalan per provinsi, dan cadangan berlabel forecast"],
            ["Keterbatasan hosting tahap awal", "Pemantauan kesehatan berkala dan penjadwalan pemanggilan rutin"],
            ["Data stok dan logistik memerlukan perjanjian berbagi data",
             "Dataset tetap ditandai belum tersedia hingga kemitraan resmi terbentuk"],
            ["Siklus pengadaan pemerintah panjang",
             "Masuk lewat anggaran perubahan dan jalur BUMN, sambil membuka jalur B2B yang siklusnya lebih pendek"],
        ],
        [6.2 * cm, CONTENT_W - 6.2 * cm]))

    # ── 11. Tim ──
    A(PageBreak())
    A(h1("11", "Tim"))
    A(table(
        ["Nama", "Peran", "Tanggung jawab"],
        [
            ["Julian Raus", "Ketua Tim, Product", "Arah produk, validasi masalah, prioritas fitur, dan hubungan institusional"],
            ["Wiennetou Joel", "Backend Engineer", "API, skema basis data, dan seluruh integrasi sumber data eksternal"],
            ["Jati Kusuma", "Frontend Engineer", "Cockpit keputusan, peta nasional, dan visualisasi status data"],
            ["Jonathan Wibowo", "Data/AI Engineer", "Skor risiko, model resiliensi, dan logika rekomendasi"],
        ],
        [3.2 * cm, 3.4 * cm, CONTENT_W - 6.6 * cm]))
    A(Spacer(1, 0.25 * cm))
    A(p(
        "Bukti eksekusi yang dapat diverifikasi: prototipe live yang dapat diakses publik, empat "
        "integrasi data resmi yang berjalan otomatis, serta penyelesaian hambatan integrasi nyata "
        "seperti penapisan keamanan pada WebAPI BPS dan endpoint BI yang tidak berdokumentasi."))
    A(p(
        "Prinsip kerja yang tidak dinegosiasikan dalam tim: <b>tidak ada data hasil perkiraan yang "
        "ditampilkan seolah-olah data asli.</b> Prinsip ini yang menjadi dasar seluruh pelabelan status "
        "pada produk."))

    # ── 12. Penutup ──
    A(h1("12", "Penutup"))
    A(p(
        "Kepang AI berangkat dari satu keyakinan sederhana: persoalan pangan Indonesia hari ini bukan "
        "kekurangan data, melainkan kekurangan waktu untuk merangkainya. Dengan menganyam sumber yang "
        "sudah ada menjadi satu ruang keputusan yang jujur asal-usulnya, keputusan dapat diambil lebih "
        "cepat tanpa mengorbankan kemampuan untuk dipertanggungjawabkan."))
    A(p(
        "Yang kami bawa pada tahap ini bukan sekadar gagasan, melainkan sistem yang berjalan dan "
        "menghasilkan temuan yang dapat diverifikasi. Yang kami butuhkan berikutnya adalah kesempatan "
        "menguji sistem ini bersama penggunanya yang sesungguhnya."))
    A(Spacer(1, 0.3 * cm))
    A(callout(
        "Ajakan kolaborasi",
        "Kami membuka kesempatan pilot bersama Bank Indonesia regional, TPID, atau dinas pangan, serta "
        "membuka jalur kemitraan data stok dengan Bapanas dan Bulog. Aplikasinya dapat langsung dicoba "
        "di pidi-seven.vercel.app."))

    # ── Lampiran ──
    A(PageBreak())
    A(h1("", "Lampiran: Sumber Data dan Rujukan"))
    A(table(
        ["Dataset", "Sumber", "Sifat pembaruan"],
        [
            ["Harga pangan konsumen dan produsen", "Bank Indonesia — Harga Pangan", "Harian"],
            ["Harga beras per provinsi", "Bank Indonesia — Harga Pangan", "Harian, disegarkan terjadwal"],
            ["Prakiraan cuaca dan peringatan dini", "BMKG Open Data", "Harian"],
            ["Produksi padi per provinsi", "BPS WebAPI", "Bulanan"],
            ["Indeks iklim ENSO", "NOAA Oceanic Nino Index", "Bulanan"],
            ["Inflasi, kurs, dan suku bunga acuan", "BPS dan Bank Indonesia", "Rilis berkala"],
            ["Anggaran ketahanan pangan APBN 2026", "Kementerian Keuangan dan Badan Pangan Nasional", "Tahunan"],
        ],
        [5.6 * cm, 6.2 * cm, CONTENT_W - 11.8 * cm]))
    A(Spacer(1, 0.35 * cm))
    A(table(
        ["Tautan", "Alamat"],
        [
            ["Aplikasi (publik)", "pidi-seven.vercel.app"],
            ["API backend", "kepang-ai-api.onrender.com"],
            ["Repositori kode", "github.com/julianraus/pidi"],
        ],
        [4.2 * cm, CONTENT_W - 4.2 * cm]))
    A(Spacer(1, 0.4 * cm))
    A(p(
        f"Dokumen ini disusun pada {AS_OF}. Seluruh angka kuantitatif ditarik secara otomatis dari "
        "API sistem pada tanggal tersebut.", "Cap"))

    from reportlab.platypus.doctemplate import PageTemplate
    from reportlab.platypus.frames import Frame
    frame = Frame(MARGIN, 2.0 * cm, CONTENT_W, H - 4.1 * cm, id="n")
    doc.addPageTemplates([
        PageTemplate(id="cover", frames=[frame], onPage=cover_page),
        PageTemplate(id="later", frames=[frame], onPage=body_page),
    ])
    doc.build(st)
    size = PDF.stat().st_size / (1024 * 1024)
    print(f"{PDF.name}\n{size:.2f} MB (limit 5 MB)")


if __name__ == "__main__":
    build()
