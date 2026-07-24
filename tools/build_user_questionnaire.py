"""Builds a self-administered (print/send-ready) user questionnaire for
Kepang AI, converted from the interviewer-led guide in
docs/BI_INTERVIEW_QUESTIONS.md into a shorter form respondents can fill out
on their own: closed questions (Likert scale / single-choice / multi-choice)
plus short open-text prompts. Source of truth for question text is
docs/USER_QUESTIONNAIRE.md - keep both in sync when editing.

Output: submission_attachments/Kuisioner Validasi Pengguna - Kepang AI.docx
"""

from pathlib import Path

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Inches, Pt, RGBColor

from build_submission_attachment import (
    add_body,
    add_callout,
    add_heading,
    configure_styles,
    set_cell_shading,
    set_cell_text,
    set_table_widths,
    BLUE,
    DARK,
    GREEN,
    LIGHT_AMBER,
    LIGHT_BLUE,
    MUTED,
)

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "submission_attachments"
DOCX_PATH = OUT_DIR / "Kuisioner Validasi Pengguna - Kepang AI.docx"

CHECK = "☐"  # ☐


def add_field_line(doc, label, blank_width="________________________________"):
    p = doc.add_paragraph()
    r = p.add_run(f"{label}: ")
    r.bold = True
    r.font.size = Pt(10)
    r2 = p.add_run(blank_width)
    r2.font.size = Pt(10)
    r2.font.color.rgb = RGBColor.from_string(MUTED)


def add_question(doc, num, text, note=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(3)
    r = p.add_run(f"{num}. ")
    r.bold = True
    r.font.size = Pt(10.5)
    r2 = p.add_run(text)
    r2.font.size = Pt(10.5)
    if note:
        pn = doc.add_paragraph()
        pn.paragraph_format.space_after = Pt(3)
        rn = pn.add_run(note)
        rn.italic = True
        rn.font.size = Pt(8.5)
        rn.font.color.rgb = RGBColor.from_string(MUTED)


def add_open_answer(doc, lines=2):
    for _ in range(lines):
        p = doc.add_paragraph("_" * 78)
        p.paragraph_format.space_after = Pt(2)
        for run in p.runs:
            run.font.color.rgb = RGBColor.from_string("D1D5DB")
            run.font.size = Pt(9)


def add_choice_list(doc, options, hint=None):
    if hint:
        ph = doc.add_paragraph()
        rh = ph.add_run(hint)
        rh.italic = True
        rh.font.size = Pt(8.5)
        rh.font.color.rgb = RGBColor.from_string(MUTED)
    for opt in options:
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.25)
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(f"{CHECK}  {opt}")
        r.font.size = Pt(10)


def add_likert(doc, low_label, high_label, n=5):
    table = doc.add_table(rows=2, cols=n + 2)
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.LEFT

    # Row 0: low label spans left, numbers across, high label spans right
    set_cell_text(table.cell(0, 0), low_label, bold=True, size=8, color="374151")
    for i in range(1, n + 1):
        c = table.cell(0, i)
        c.text = ""
        para = c.paragraphs[0]
        para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = para.add_run(str(i))
        run.bold = True
        run.font.size = Pt(9)
        run.font.name = "Calibri"
    set_cell_text(table.cell(0, n + 1), high_label, bold=True, size=8, color="374151")

    # Row 1: checkbox row under each number
    table.cell(1, 0).text = ""
    for i in range(1, n + 1):
        c = table.cell(1, i)
        c.text = ""
        para = c.paragraphs[0]
        para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = para.add_run(CHECK)
        run.font.size = Pt(11)
        run.font.name = "Calibri"
    table.cell(1, n + 1).text = ""

    for r in range(2):
        set_cell_shading(table.cell(r, 0), LIGHT_BLUE if r == 0 else "FFFFFF")
        set_cell_shading(table.cell(r, n + 1), LIGHT_BLUE if r == 0 else "FFFFFF")

    widths = [1.35] + [0.55] * n + [1.35]
    set_table_widths(table, widths)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def add_section_divider(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.border_bottom = True  # harmless if unsupported
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(12.5)
    r.font.color.rgb = RGBColor.from_string(BLUE)


def build_docx():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    doc = Document()
    configure_styles(doc)

    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    tr = title.add_run("Kuesioner Validasi Pengguna")
    tr.bold = True
    tr.font.size = Pt(20)
    tr.font.color.rgb = RGBColor.from_string(GREEN)

    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sr = subtitle.add_run("Kepang AI - Decision Intelligence untuk Resiliensi Ketahanan Pangan Daerah")
    sr.font.size = Pt(11.5)
    sr.font.color.rgb = RGBColor.from_string(DARK)

    meta = doc.add_paragraph()
    meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    mr = meta.add_run("Estimasi waktu pengisian: 10-15 menit  |  Tim J4  |  PIDI - Digdaya x Hackathon 2026")
    mr.font.size = Pt(9)
    mr.font.color.rgb = RGBColor.from_string(MUTED)
    doc.add_paragraph()

    add_callout(
        doc,
        "Pengantar",
        "Terima kasih sudah meluangkan waktu. Kami tim J4, sedang mengembangkan Kepang AI - alat bantu keputusan "
        "ketahanan pangan daerah untuk PIDI-Digdaya x Hackathon 2026 bersama Bank Indonesia. Kuesioner ini untuk "
        "memahami bagaimana Bapak/Ibu bekerja dengan data pangan saat ini, dan mendapat masukan jujur atas "
        "prototipe kami. Kami belum menjual apa pun. Jawaban digunakan untuk laporan internal/submission "
        "hackathon; identitas dapat dianonimkan atas permintaan.",
    )

    add_callout(
        doc,
        "Sebelum mengisi Bagian C",
        "Silakan buka demo produk kami di https://pidi-seven.vercel.app terlebih dahulu (atau lihat lampiran "
        "screenshot yang kami sertakan bila tidak bisa mengakses internet).",
        fill=LIGHT_AMBER,
        color="92400E",
    )

    add_section_divider(doc, "Identitas Responden (opsional, boleh dikosongkan)")
    add_field_line(doc, "1. Nama")
    add_field_line(doc, "2. Instansi / unit kerja")
    add_field_line(doc, "3. Jabatan / peran")
    add_question(doc, 4, "Lama bekerja di bidang terkait pangan/ekonomi daerah")
    add_choice_list(doc, ["< 1 tahun", "1-3 tahun", "3-5 tahun", "> 5 tahun"])

    add_section_divider(doc, "Bagian A - Konteks Kerja Saat Ini")
    add_question(doc, 5, "Apa output atau keputusan utama yang Anda hasilkan terkait harga/pasokan pangan?",
                 "Contoh: rekomendasi rapat TPID, laporan asesmen, usulan operasi pasar.")
    add_open_answer(doc, 2)
    add_question(doc, 6, "Seberapa sering Anda perlu memantau/menganalisis data harga pangan?")
    add_choice_list(doc, ["Harian", "Mingguan", "Bulanan", "Hanya menjelang rapat tertentu", "Lainnya: ______________"])
    add_question(doc, 7, "Sumber data apa saja yang biasa Anda gunakan?", "Boleh pilih lebih dari satu.")
    add_choice_list(doc, [
        "PIHPS / Bank Indonesia", "Panel Harga Bapanas", "BPS", "BMKG",
        "Laporan lapangan internal", "Lainnya: ______________",
    ])
    add_question(doc, 8, "Berapa banyak sumber atau aplikasi berbeda yang biasanya Anda buka untuk satu kali analisis harga pangan?")
    add_choice_list(doc, ["1-2", "3-4", "5 atau lebih"])

    add_section_divider(doc, "Bagian B - Masalah yang Dialami")
    add_question(doc, 9, "Seberapa sering data yang Anda butuhkan tersebar di banyak sistem/lembaga berbeda?")
    add_likert(doc, "Tidak pernah", "Selalu")
    add_question(doc, 10, "Seberapa sering Anda menggabungkan data dari berbagai sumber secara manual (mis. ke Excel)?")
    add_likert(doc, "Tidak pernah", "Selalu")
    add_question(doc, 11, "Rata-rata, berapa lama waktu dari menyadari ada masalah harga sampai punya rekomendasi yang siap dibawa ke rapat?")
    add_choice_list(doc, ["< 1 jam", "1-4 jam", "1 hari", "Lebih dari 1 hari"])
    add_question(doc, 12, "Pernahkah Anda merasa intervensi terlambat karena sinyal masalah baru terlihat setelah harga sudah naik?")
    add_choice_list(doc, ["Ya, sering", "Kadang", "Jarang", "Tidak pernah"])
    p = doc.add_paragraph()
    r = p.add_run("Kalau ya/kadang, boleh ceritakan singkat contohnya?")
    r.italic = True
    r.font.size = Pt(9.5)
    add_open_answer(doc, 2)
    add_question(doc, 13, "Seberapa sulit menghubungkan sinyal cuaca/risiko panen dengan keputusan harga pangan saat ini?")
    add_likert(doc, "Sangat mudah", "Sangat sulit")
    add_question(doc, 14, "Seberapa terlihat disparitas harga antarprovinsi/wilayah di tools yang Anda pakai sekarang?")
    add_likert(doc, "Sangat terlihat", "Tidak terlihat")

    doc.add_page_break()
    add_section_divider(doc, "Bagian C - Reaksi terhadap Kepang AI")
    add_question(doc, 15, "Apa kesan pertama Anda terhadap tampilan Cockpit ini?", "Boleh termasuk hal yang membingungkan.")
    add_open_answer(doc, 2)
    add_question(doc, 16, "Seberapa penting label sumber data (real-time / rilis resmi / forecast / belum tersedia) pada setiap angka bagi pekerjaan Anda?")
    add_likert(doc, "Tidak penting", "Sangat penting")
    add_question(doc, 17, "Seberapa berguna peta harga beras per-provinsi, dibanding cara Anda melihat data harga sekarang?")
    add_likert(doc, "Tidak berguna", "Sangat berguna")
    add_question(doc, 18, "Seberapa dibutuhkan fitur simulasi skenario (rupiah melemah / biaya logistik naik / gagal panen) sebelum rapat pengambilan keputusan?")
    add_likert(doc, "Tidak dibutuhkan", "Sangat dibutuhkan")
    add_question(doc, 19, "Fitur mana yang PALING penting bagi Anda?", "Pilih maksimal 2.")
    add_choice_list(doc, [
        "Peta harga 34 provinsi", "Resilience Score", "Simulator skenario",
        "Label sumber data (data lineage)", "Decision brief (owner + KPI)", "Lainnya: ______________",
    ])
    add_question(doc, 20, "Apa yang membuat Anda ragu atau enggan memakai alat seperti ini?", "Jawaban jujur sangat membantu kami.")
    add_open_answer(doc, 2)

    add_section_divider(doc, "Bagian D - Kelayakan Adopsi")
    add_question(doc, 21, "Siapa yang biasanya memutuskan pengadaan alat/tools analitik seperti ini di institusi Anda?")
    add_open_answer(doc, 1)
    add_question(doc, 22, "Menurut Anda, siapa yang paling diuntungkan dari alat ini?")
    add_choice_list(doc, ["BI regional", "TPID", "Bapanas", "Bulog", "Dinas Pangan daerah", "Lainnya: ______________"])

    add_section_divider(doc, "Penutup")
    add_question(doc, 23, "Satu hal yang paling penting untuk kami perbaiki?")
    add_open_answer(doc, 2)
    add_question(doc, 24, "Boleh kami hubungi kembali untuk validasi lanjutan?")
    add_choice_list(doc, ["Ya", "Tidak"])
    add_field_line(doc, "Kontak (opsional)")

    doc.add_paragraph()
    thanks = doc.add_paragraph()
    thanks.alignment = WD_ALIGN_PARAGRAPH.CENTER
    tr2 = thanks.add_run("Terima kasih atas waktu dan masukan Anda.")
    tr2.italic = True
    tr2.font.size = Pt(10)
    tr2.font.color.rgb = RGBColor.from_string(MUTED)

    doc.save(DOCX_PATH)
    print(DOCX_PATH)
    size_kb = DOCX_PATH.stat().st_size / 1024
    print(f"Size: {size_kb:.0f} KB")


if __name__ == "__main__":
    build_docx()
