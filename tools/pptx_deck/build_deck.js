const pptxgen = require('pptxgenjs');
const path = require('path');

const ICONS = path.join(__dirname, 'icons');
const OUT = path.join(__dirname, 'Kepang AI - Video Pitch Deck.pptx');

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 in
pres.author = 'Tim J4';
pres.title = 'Kepang AI - Video Pitch Deck';

const W = 13.333, H = 7.5;

// ---- Palette (Kepang AI brand: forest/emerald, matches live app) ----
const DARK = '07291F';      // deep forest background
const DARK2 = '0B3B2E';     // panel on dark
const DARK3 = '0F4534';     // lighter panel on dark
const LIGHT = 'F3FAF6';     // pale mint content background
const CARD_LIGHT = 'FFFFFF';
const BORDER_LIGHT = 'D8E8DE';
const ACCENT = '22C55E';    // bright emerald
const ACCENT_DEEP = '16A34A';
const AMBER = 'D97706';
const AMBER_BG = 'FFF7E8';
const TEXT_DARK = '0B1F17';
const MUTED_DARK = '5B6B63';
const TEXT_LIGHT = 'F3FAF6';
const MUTED_LIGHT = '9FD9B8';
const BORDER_DARK = '1F5A44';

const FONT = 'Calibri';
const MONO = 'Courier New';

// ---------------------------------------------------------------------
// Low-level helpers (each returns a FRESH options object - never share
// one object literal across multiple add* calls, per pptxgenjs gotcha).
// ---------------------------------------------------------------------

function rect(slide, x, y, w, h, opts = {}) {
  slide.addShape('rect', {
    x, y, w, h,
    fill: opts.fill === null ? undefined : { color: opts.fill || CARD_LIGHT },
    line: opts.line ? { color: opts.line, width: opts.lineWidth || 1 } : { type: 'none' },
    rectRadius: opts.radius,
    shadow: opts.shadow ? {
      type: 'outer', color: '0B1F17', opacity: 0.18, blur: 10, offset: 3, angle: 90,
    } : undefined,
  });
}

function roundRect(slide, x, y, w, h, opts = {}) {
  slide.addShape('roundRect', {
    x, y, w, h,
    rectRadius: opts.radius != null ? opts.radius : 0.08,
    fill: opts.fill === null ? undefined : { color: opts.fill || CARD_LIGHT },
    line: opts.line ? { color: opts.line, width: opts.lineWidth || 1 } : { type: 'none' },
    shadow: opts.shadow ? {
      type: 'outer', color: '0B1F17', opacity: 0.16, blur: 12, offset: 4, angle: 90,
    } : undefined,
  });
}

function txt(slide, text, x, y, w, h, opts = {}) {
  slide.addText(text, {
    x, y, w, h,
    fontFace: opts.fontFace || FONT,
    fontSize: opts.fontSize || 14,
    bold: !!opts.bold,
    italic: !!opts.italic,
    color: opts.color || TEXT_DARK,
    align: opts.align || 'left',
    valign: opts.valign || 'top',
    margin: opts.margin != null ? opts.margin : 0,
    lineSpacingMultiple: opts.lineSpacing || 1.15,
    charSpacing: opts.charSpacing,
    breakLine: true,
  });
}

function icon(slide, name, x, y, size) {
  slide.addImage({ path: path.join(ICONS, `${name}.png`), x, y, w: size, h: size });
}

// Blueprint-style corner registration marks - the app's actual .corner motif
// (two 1px lines forming an L at each corner, offset just outside the box).
// This is the deck's one repeated visual motif, tied directly to the live
// product's design system (not a generic accent stripe).
function cornerMarks(slide, x, y, w, h, color) {
  const len = 0.16, off = 0.05;
  const corners = [
    [x - off, y - off, true, true],   // top-left
    [x + w + off, y - off, false, true], // top-right
    [x - off, y + h + off, true, false], // bottom-left
    [x + w + off, y + h + off, false, false], // bottom-right
  ];
  corners.forEach(([cx, cy, right, down]) => {
    const lx = right ? cx : cx - len;
    const ly = down ? cy : cy - len;
    slide.addShape('line', { x: lx, y: cy, w: len, h: 0, line: { color, width: 1.5 } });
    slide.addShape('line', { x: cx, y: ly, w: 0, h: len, line: { color, width: 1.5 } });
  });
}

function pill(slide, text, x, y, w, h, opts = {}) {
  roundRect(slide, x, y, w, h, { fill: opts.bg || ACCENT, radius: h / 2 });
  txt(slide, text, x, y, w, h, {
    align: 'center', valign: 'middle', bold: true,
    fontSize: opts.fontSize || 10.5, color: opts.color || 'FFFFFF',
    fontFace: opts.fontFace || FONT, charSpacing: opts.charSpacing,
  });
}

function timeBadge(slide, range, x, y, dark) {
  const w = 1.55, h = 0.34;
  roundRect(slide, x, y, w, h, { fill: dark ? DARK3 : LIGHT, radius: 0.06, line: dark ? BORDER_DARK : BORDER_LIGHT, lineWidth: 1 });
  txt(slide, range, x, y, w, h, {
    align: 'center', valign: 'middle', bold: true, fontFace: MONO,
    fontSize: 11, color: dark ? ACCENT : ACCENT_DEEP,
  });
}

function typeBadge(slide, kind) {
  // kind: 'record' | 'slide'
  const w = 2.05, h = 0.34;
  const x = W - 0.55 - w, y = 0.42;
  if (kind === 'record') {
    roundRect(slide, x, y, w, h, { fill: AMBER_BG, radius: 0.06, line: AMBER, lineWidth: 1 });
    icon(slide, 'video', x + 0.08, y + 0.06, 0.22);
    txt(slide, 'REKAM LAYAR LIVE', x + 0.36, y, w - 0.4, h, { align: 'left', valign: 'middle', bold: true, fontSize: 9.5, color: AMBER });
  } else {
    roundRect(slide, x, y, w, h, { fill: 'DCFCE7', radius: 0.06, line: ACCENT_DEEP, lineWidth: 1 });
    icon(slide, 'image', x + 0.08, y + 0.06, 0.22);
    txt(slide, 'SLIDE OVERLAY', x + 0.36, y, w - 0.4, h, { align: 'left', valign: 'middle', bold: true, fontSize: 9.5, color: ACCENT_DEEP });
  }
}

function footer(slide, dark, pageLabel) {
  txt(slide, 'Kepang AI · Tim J4 · Video Pitch 180 detik', 0.55, H - 0.42, 6, 0.3, {
    fontSize: 9, color: dark ? MUTED_LIGHT : MUTED_DARK,
  });
  if (pageLabel) {
    txt(slide, pageLabel, W - 0.55 - 3, H - 0.42, 3, 0.3, {
      fontSize: 9, color: dark ? MUTED_LIGHT : MUTED_DARK, align: 'right',
    });
  }
}

function braidLogo(slide, x, y, size, dark) {
  // Three overlapping curved "ribbon" strokes suggesting a braid ("kepang"),
  // matching the app's own logo mark.
  const strokeColor = dark ? ACCENT : ACCENT_DEEP;
  roundRect(slide, x, y, size, size, { fill: dark ? ACCENT : ACCENT_DEEP, radius: size * 0.22 });
  const cx = x + size / 2, cy = y + size / 2, r = size * 0.28;
  [0, 1, 2].forEach((i) => {
    slide.addShape('arc', {
      x: cx - r + i * (r * 0.28) - r * 0.28, y: cy - r * 0.55, w: r * 2, h: r * 1.5,
      angleRange: [10, 170],
      line: { color: dark ? DARK : 'FFFFFF', width: 2.4 },
      fill: { type: 'none' },
    });
  });
}

// ---------------------------------------------------------------------
// SLIDE 1 - TITLE CARD  (0:00-0:05)  -> real video overlay
// ---------------------------------------------------------------------
function slide01() {
  const s = pres.addSlide();
  s.background = { color: DARK };
  // subtle darker panel band for depth (not a stripe accent - full-bleed backdrop)
  rect(s, 0, 0, W, H, { fill: DARK });
  roundRect(s, 0.9, 0.75, 1.1, 1.1, { fill: ACCENT, radius: 0.22 });
  icon(s, 'layers', 1.16, 1.01, 0.58);

  txt(s, 'TIM J4  ·  PIDI – DIGDAYA X HACKATHON 2026  ·  3RD SUBMISSION', 0.9, 2.15, 10, 0.4, {
    fontSize: 13, color: ACCENT, bold: true, charSpacing: 1,
  });
  txt(s, 'Kepang AI', 0.9, 2.65, 10, 1.1, {
    fontSize: 60, color: 'FFFFFF', bold: true, fontFace: FONT,
  });
  txt(s, 'Decision Intelligence untuk Resiliensi Ketahanan Pangan Daerah', 0.9, 3.75, 9.5, 0.7, {
    fontSize: 22, color: TEXT_LIGHT,
  });

  roundRect(s, 0.9, 4.75, 8.6, 1.35, { fill: DARK2, radius: 0.08, line: BORDER_DARK, lineWidth: 1 });
  txt(s,
    '“Kami tim J4. Ini Kepang AI — decision intelligence untuk ketahanan pangan daerah.”',
    1.2, 4.95, 8.0, 1.0,
    { fontSize: 15, italic: true, color: TEXT_LIGHT, valign: 'middle' }
  );

  timeBadge(s, '0:00–0:05', 0.9, 6.45, true);
  typeBadge(s, 'slide');

  s.addNotes(
    'NARASI (ucapkan): "Kami tim J4. Ini Kepang AI - decision intelligence untuk ketahanan pangan daerah."\n\n' +
    'DURASI: 5 detik.\n' +
    'YANG TAMPIL: Kartu judul ini persis - logo + judul lengkap.\n' +
    'CATATAN: Ini slide overlay sungguhan untuk video, bukan storyboard - potong langsung dari slide ini ke screen recording di detik 0:05.'
  );
}

// ---------------------------------------------------------------------
// Generic CUE (storyboard) slide builder for screen-recording segments
// ---------------------------------------------------------------------
function cueSlide({ pageNum, totalPages, timeRange, title, focusLabel, narasi, aksiList, chips, extraNote }) {
  const s = pres.addSlide();
  s.background = { color: LIGHT };

  timeBadge(s, timeRange, 0.55, 0.42, false);
  typeBadge(s, 'record');

  txt(s, focusLabel.toUpperCase(), 0.55, 0.95, 10, 0.35, {
    fontSize: 11, bold: true, color: MUTED_DARK, charSpacing: 1.2,
  });
  txt(s, title, 0.55, 1.28, 11.8, 0.75, {
    fontSize: 30, bold: true, color: TEXT_DARK,
  });

  // Narasi card (left column)
  const nx = 0.55, ny = 2.25, nw = 6.85, nh = 3.55;
  roundRect(s, nx, ny, nw, nh, { fill: CARD_LIGHT, radius: 0.09, line: BORDER_LIGHT, lineWidth: 1, shadow: true });
  cornerMarks(s, nx, ny, nw, nh, ACCENT_DEEP);
  icon(s, 'compass', nx + 0.32, ny + 0.32, 0.4);
  txt(s, 'NARASI', nx + 0.85, ny + 0.34, 4, 0.35, { fontSize: 11, bold: true, color: ACCENT_DEEP, charSpacing: 1 });
  txt(s, narasi, nx + 0.32, ny + 0.85, nw - 0.64, nh - 1.1, {
    fontSize: 15.5, italic: true, color: TEXT_DARK, lineSpacing: 1.3,
  });

  // Aksi di layar card (right column)
  const ax = 7.6, ay = 2.25, aw = W - 0.55 - ax, ah = 3.55;
  roundRect(s, ax, ay, aw, ah, { fill: DARK2, radius: 0.09 });
  cornerMarks(s, ax, ay, aw, ah, ACCENT);
  icon(s, 'monitor', ax + 0.3, ay + 0.3, 0.36);
  txt(s, 'AKSI DI LAYAR', ax + 0.78, ay + 0.32, 3, 0.35, { fontSize: 11, bold: true, color: ACCENT, charSpacing: 1 });

  const bulletParas = aksiList.map((t, i) => ({
    text: t,
    options: {
      bullet: { code: '25B8' }, color: TEXT_LIGHT, fontSize: 13.5, fontFace: FONT,
      breakLine: i < aksiList.length - 1, paraSpaceAfter: 10,
    },
  }));
  s.addText(bulletParas, { x: ax + 0.3, y: ay + 0.82, w: aw - 0.6, h: ah - 1.05, valign: 'top', lineSpacingMultiple: 1.2, margin: 0 });

  // Metric chips row (optional)
  if (chips && chips.length) {
    let cx = 0.55;
    const cy = 6.05, chH = 0.55;
    chips.forEach((c) => {
      const cw = Math.max(1.7, c.length * 0.105 + 0.5);
      roundRect(s, cx, cy, cw, chH, { fill: 'DCFCE7', radius: chH / 2 });
      txt(s, c, cx, cy, cw, chH, { align: 'center', valign: 'middle', bold: true, fontSize: 11.5, color: ACCENT_DEEP });
      cx += cw + 0.22;
    });
  }

  if (extraNote) {
    txt(s, extraNote, 0.55, 6.75, 12.2, 0.4, { fontSize: 10.5, italic: true, color: MUTED_DARK });
  }

  footer(s, false, `Cue ${pageNum} / ${totalPages}`);

  s.addNotes(
    `NARASI (ucapkan): "${narasi}"\n\n` +
    `DURASI: ${timeRange}\n` +
    `FOKUS: ${focusLabel}\n` +
    `AKSI DI LAYAR:\n- ${aksiList.join('\n- ')}\n\n` +
    'CATATAN: Slide ini adalah storyboard/teleprompter, BUKAN dipotong langsung ke video. ' +
    'Segmen ini direkam sebagai screen recording aplikasi live (https://pidi-seven.vercel.app).'
  );
  return s;
}

// ---------------------------------------------------------------------
// SLIDE 2 (0:05-0:15)
// ---------------------------------------------------------------------
function slide02() {
  cueSlide({
    pageNum: 1, totalPages: 7,
    timeRange: '0:05–0:15',
    title: 'Sinyal Krisis, Empat Lembaga Terpisah',
    focusLabel: 'Cockpit live — sorot metrik',
    narasi: 'Inflasi pangan 5,58 persen — hampir dua kali inflasi umum. Rupiah dan suku bunga menekan. Tapi sinyalnya tersebar di empat lembaga, dan TPID telat bertindak.',
    aksiList: [
      'Buka Cockpit di pidi-seven.vercel.app',
      'Sorot metrik Volatile Food 5,58%',
      'Sorot metrik USD/IDR Rp17.944',
      'Sorot metrik Resilience Score',
    ],
    chips: ['Volatile Food 5,58%', 'USD/IDR Rp17.944', 'Resilience Score'],
  });
}

// ---------------------------------------------------------------------
// SLIDE 3 (0:15-0:35)
// ---------------------------------------------------------------------
function slide03() {
  cueSlide({
    pageNum: 2, totalPages: 7,
    timeRange: '0:15–0:35',
    title: 'Peta 34 Provinsi & Decision Brief',
    focusLabel: 'Screen record — hover peta + decision brief',
    narasi: 'Kepang AI menganyam keempatnya jadi satu. Ini peta harga beras 34 provinsi, live dari Bank Indonesia. Papua dan Kalimantan dua puluh persen di atas median nasional — sementara lumbung padi di bawah. Dari sini sistem langsung menyusun prioritas: wilayah mana yang perlu ditindak duluan.',
    aksiList: [
      'Hover peta 34 provinsi — provinsi merah (Papua/Kalimantan) sampai tooltip harga muncul',
      'Lanjut ke decision brief di hero Cockpit',
    ],
    chips: ['Papua +20% median', 'Kalimantan +23% median', 'NTB/DIY/Sulsel di bawah median'],
  });
}

// ---------------------------------------------------------------------
// SLIDE 4 (0:35-0:45)
// ---------------------------------------------------------------------
function slide04() {
  cueSlide({
    pageNum: 3, totalPages: 7,
    timeRange: '0:35–0:45',
    title: 'Skor yang Bisa Ditelusuri, Bukan Black-Box',
    focusLabel: 'Screen record — Source Health / data lineage',
    narasi: 'Skornya bukan black-box. Dihitung dari formula yang bisa ditelusuri — cuaca BMKG, harga BI, produksi BPS, indeks iklim NOAA — semuanya live, dan tiap angka diberi label sumbernya.',
    aksiList: [
      'Scroll ke panel Source Health & Data Lineage',
      'Sorot badge status per dataset (real-time / official-release / forecast)',
    ],
    chips: ['BMKG', 'BI Harga Pangan', 'BPS', 'NOAA ENSO'],
  });
}

// ---------------------------------------------------------------------
// SLIDE 5 - STAT CARD  (0:45-0:55) -> real video overlay
// ---------------------------------------------------------------------
function slide05() {
  const s = pres.addSlide();
  s.background = { color: DARK };
  timeBadge(s, '0:45–0:55', 0.55, 0.5, true);
  typeBadge(s, 'slide');

  txt(s, 'DAMPAK & PASAR', 0.55, 1.15, 10, 0.4, { fontSize: 13, bold: true, color: ACCENT, charSpacing: 1.2 });

  const cardW = 5.6, cardH = 3.9, gap = 0.55;
  const totalW = cardW * 2 + gap;
  const startX = (W - totalW) / 2;
  const cardY = 1.85;

  // Stat 1
  roundRect(s, startX, cardY, cardW, cardH, { fill: DARK2, radius: 0.12, line: BORDER_DARK, lineWidth: 1 });
  cornerMarks(s, startX, cardY, cardW, cardH, ACCENT);
  icon(s, 'trendingUp', startX + 0.4, cardY + 0.4, 0.55);
  txt(s, 'Rp210,4 T', startX + 0.4, cardY + 1.1, cardW - 0.8, 1.1, { fontSize: 46, bold: true, color: 'FFFFFF' });
  txt(s, 'Alokasi APBN 2026 untuk ketahanan pangan — konteks pasar nyata, bukan proyeksi', startX + 0.4, cardY + 2.35, cardW - 0.8, 1.3, {
    fontSize: 14, color: MUTED_LIGHT, lineSpacing: 1.3,
  });

  // Stat 2
  const x2 = startX + cardW + gap;
  roundRect(s, x2, cardY, cardW, cardH, { fill: DARK2, radius: 0.12, line: BORDER_DARK, lineWidth: 1 });
  cornerMarks(s, x2, cardY, cardW, cardH, ACCENT);
  icon(s, 'clock', x2 + 0.4, cardY + 0.4, 0.55);
  txt(s, '< 3 Menit', x2 + 0.4, cardY + 1.1, cardW - 0.8, 1.1, { fontSize: 46, bold: true, color: 'FFFFFF' });
  txt(s, 'Identifikasi wilayah prioritas — dari sebelumnya berjam-jam lintas spreadsheet', x2 + 0.4, cardY + 2.35, cardW - 0.8, 1.3, {
    fontSize: 14, color: MUTED_LIGHT, lineSpacing: 1.3,
  });

  txt(s, '"Hasilnya: identifikasi wilayah prioritas dari berjam-jam jadi di bawah tiga menit. Pasarnya nyata — APBN pangan 210 triliun. Model SaaS ke pemda dan BI regional."',
    0.9, cardY + cardH + 0.35, W - 1.8, 0.9, { fontSize: 13.5, italic: true, color: TEXT_LIGHT, align: 'center', valign: 'top' });

  s.addNotes(
    'NARASI (ucapkan): "Hasilnya: identifikasi wilayah prioritas dari berjam-jam jadi di bawah tiga menit. Pasarnya nyata - APBN pangan 210 triliun. Model SaaS ke pemda dan BI regional."\n\n' +
    'DURASI: 10 detik (0:45-0:55).\n' +
    'CATATAN: Slide overlay sungguhan - potong ke sini setelah demo Source Health, lalu lanjut ke slide 6 (bridge closing).'
  );
}

// ---------------------------------------------------------------------
// SLIDE 6 - BRIDGE CLOSING (0:55-1:00) -> real video overlay
// ---------------------------------------------------------------------
function slide06() {
  const s = pres.addSlide();
  s.background = { color: DARK };
  timeBadge(s, '0:55–1:00', 0.55, 0.5, true);
  typeBadge(s, 'slide');

  roundRect(s, 2.1, 2.3, W - 4.2, 3.0, { fill: DARK2, radius: 0.14, line: BORDER_DARK, lineWidth: 1 });
  cornerMarks(s, 2.1, 2.3, W - 4.2, 3.0, ACCENT);

  icon(s, 'checkCircle', W / 2 - 0.35, 2.6, 0.7);
  txt(s, 'pidi-seven.vercel.app', 2.4, 3.45, W - 4.8, 0.6, {
    fontSize: 24, bold: true, color: 'FFFFFF', align: 'center', fontFace: MONO,
  });
  txt(s, 'Prototype live dengan data real — Tim J4, siap pilot', 2.4, 4.1, W - 4.8, 0.5, {
    fontSize: 15, color: ACCENT, align: 'center',
  });

  txt(s, '"Prototype sudah live dengan data real. Kami buka pilot dengan BI dan TPID."',
    1.3, 5.7, W - 2.6, 0.7, { fontSize: 14, italic: true, color: TEXT_LIGHT, align: 'center' });

  s.addNotes(
    'NARASI (ucapkan): "Prototype sudah live dengan data real. Kami buka pilot dengan BI dan TPID."\n\n' +
    'DURASI: 5 detik (0:55-1:00). Ini adalah JEMBATAN dari pitch ke demo, bukan penutup akhir video.\n' +
    'CATATAN: Setelah slide ini, potong ke screen recording live (mulai segmen demo, slide 8 dst).'
  );
}

// ---------------------------------------------------------------------
// SLIDE 7 - SECTION DIVIDER
// ---------------------------------------------------------------------
function slide07() {
  const s = pres.addSlide();
  s.background = { color: DARK };
  icon(s, 'play', W / 2 - 0.45, 2.15, 0.9);
  txt(s, 'BAGIAN 2 — DEMO LIVE', 0.9, 3.3, W - 1.8, 0.9, {
    fontSize: 38, bold: true, color: 'FFFFFF', align: 'center',
  });
  timeBadge(s, '1:00 – 3:00', W / 2 - 0.85, 4.15, true);
  txt(s, 'Screen recording langsung dari aplikasi live — tanpa slide, kecuali kartu penutup di akhir', 1.3, 4.85, W - 2.6, 0.6, {
    fontSize: 14, color: MUTED_LIGHT, align: 'center',
  });
  footer(s, true, 'Pembatas Bagian');
  s.addNotes('SLIDE PEMBATAS (untuk presenter/editor, bukan bagian tersambung otomatis ke video, tapi boleh dipotong sebagai transisi cepat 1-2 detik jika mau). Menandai mulainya 2 menit demo screen-recording murni.');
}

// ---------------------------------------------------------------------
// SLIDE 8 (1:00-1:10)
// ---------------------------------------------------------------------
function slide08() {
  cueSlide({
    pageNum: 4, totalPages: 7,
    timeRange: '1:00–1:10',
    title: 'Pengantar Deep-Dive',
    focusLabel: 'Pengantar deep dive',
    narasi: 'Ini alur kerja seorang analis TPID saat harga beras naik cepat. Saya mulai dari Cockpit.',
    aksiList: [
      'Buka pidi-seven.vercel.app',
      'Tampilkan halaman Cockpit dari awal',
    ],
  });
}

// ---------------------------------------------------------------------
// SLIDE 9 (1:10-2:00) - longest beat, 3 sub-steps
// ---------------------------------------------------------------------
function slide09() {
  const s = pres.addSlide();
  s.background = { color: LIGHT };
  timeBadge(s, '1:10–2:00', 0.55, 0.42, false);
  typeBadge(s, 'record');
  txt(s, 'BUKTI UTAMA INOVASI (WALKTHROUGH)', 0.55, 0.95, 11, 0.35, { fontSize: 11, bold: true, color: MUTED_DARK, charSpacing: 1.2 });
  txt(s, 'Role, Decision Brief, Peta Provinsi', 0.55, 1.28, 12, 0.75, { fontSize: 28, bold: true, color: TEXT_DARK });

  const steps = [
    {
      icon: 'users', label: 'Role switcher',
      narasi: 'Pertama saya pilih peran — TPID — dan brief-nya menyesuaikan tanggung jawab saya.',
      aksi: 'Klik role switcher (TPID → Bulog sekilas → kembali TPID)',
    },
    {
      icon: 'target', label: 'Decision brief',
      narasi: 'Resilience Score 63, dan sistem sudah menaruh aksi prioritas: pre-positioning stok ke wilayah defisit, lengkap dengan owner, timeframe, dan KPI.',
      aksi: 'Tunjuk decision brief + klik 1 kartu aksi (drill-down)',
    },
    {
      icon: 'mapPin', label: 'Peta nasional',
      narasi: 'Di peta nasional, saya lihat langsung provinsi mana yang harga berasnya di atas median.',
      aksi: 'Hover 2–3 provinsi merah di peta 34 provinsi',
    },
  ];

  const colW = (W - 1.1 - 0.6) / 3, colY = 2.3, colH = 4.1;
  steps.forEach((step, i) => {
    const x = 0.55 + i * (colW + 0.3);
    roundRect(s, x, colY, colW, colH, { fill: CARD_LIGHT, radius: 0.09, line: BORDER_LIGHT, lineWidth: 1, shadow: true });
    cornerMarks(s, x, colY, colW, colH, ACCENT_DEEP);
    pill(s, String(i + 1), x + 0.25, colY + 0.25, 0.42, 0.42, { bg: ACCENT_DEEP, fontSize: 15 });
    icon(s, step.icon, x + colW - 0.65, colY + 0.25, 0.42);
    txt(s, step.label.toUpperCase(), x + 0.25, colY + 0.8, colW - 0.5, 0.35, { fontSize: 11, bold: true, color: ACCENT_DEEP, charSpacing: 0.8 });
    txt(s, step.narasi, x + 0.25, colY + 1.2, colW - 0.5, 1.65, { fontSize: 12.5, italic: true, color: TEXT_DARK, lineSpacing: 1.25 });
    txt(s, step.aksi, x + 0.25, colY + colH - 0.95, colW - 0.5, 0.85, { fontSize: 11, color: MUTED_DARK, lineSpacing: 1.2 });
  });

  footer(s, false, 'Cue 5 / 7');
  s.addNotes(
    'NARASI (ucapkan berurutan):\n' +
    '1. "Pertama saya pilih peran - TPID - dan brief-nya menyesuaikan tanggung jawab saya." (aksi: klik role switcher TPID->Bulog->TPID)\n' +
    '2. "Resilience Score 63, dan sistem sudah menaruh aksi prioritas: pre-positioning stok ke wilayah defisit, lengkap dengan owner, timeframe, dan KPI." (aksi: tunjuk decision brief + klik 1 kartu aksi drill-down)\n' +
    '3. "Di peta nasional, saya lihat langsung provinsi mana yang harga berasnya di atas median." (aksi: hover 2-3 provinsi merah di peta 34 provinsi)\n\n' +
    'DURASI: 50 detik (1:10-2:00) - beat terpanjang di demo, atur pace narasi santai.\n' +
    'CATATAN: Screen recording murni, storyboard ini untuk latihan/teleprompter saja.'
  );
}

// ---------------------------------------------------------------------
// SLIDE 10 (2:00-2:30)
// ---------------------------------------------------------------------
function slide10() {
  const s = cueSlide({
    pageNum: 6, totalPages: 7,
    timeRange: '2:00–2:30',
    title: 'Formula Skor & Data Lineage',
    focusLabel: 'Cara kerja & kedalaman',
    narasi: 'Di baliknya: input harga harian BI, forecast BMKG, fase ENSO NOAA, produksi BPS. Diproses jadi skor risiko dengan bobot tetap, lalu digabung jadi Resilience Score. Setiap dataset diberi label real-time, rilis resmi, forecast, atau belum tersedia — bisa diaudit dari API, bukan cuma diklaim di layar.',
    aksiList: [
      'Scroll ke panel Source Health',
      'Tunjuk label tiap dataset + persen confidence',
    ],
  });
  // Weight formula chips (override default chip row position slightly lower to avoid clash)
  const weights = ['Deviasi Hujan 40%', 'Indeks Banjir 30%', 'Indeks Kekeringan 20%', 'Multiplier ENSO 10%'];
  let cx = 0.55;
  const cy = 6.05, chH = 0.55;
  weights.forEach((c) => {
    const cw = Math.max(1.9, c.length * 0.095 + 0.5);
    roundRect(s, cx, cy, cw, chH, { fill: DARK2, radius: chH / 2 });
    txt(s, c, cx, cy, cw, chH, { align: 'center', valign: 'middle', bold: true, fontSize: 10.5, color: ACCENT });
    cx += cw + 0.2;
  });
}

// ---------------------------------------------------------------------
// SLIDE 11 (2:30-2:50)
// ---------------------------------------------------------------------
function slide11() {
  cueSlide({
    pageNum: 7, totalPages: 7,
    timeRange: '2:30–2:50',
    title: 'Bukti Live & Simulator Skenario',
    focusLabel: 'Bukti validasi / hasil awal',
    narasi: 'Datanya benar-benar hidup — harga per provinsi ini ditarik langsung dari BI, bukan angka contoh. Setiap integrasi kami verifikasi; prosesnya menemukan dan memperbaiki bug nyata. Validasi ke pengguna langsung — wawancara dengan BI yang menangani pangan — sedang kami jadwalkan.',
    aksiList: [
      'Jalankan Simulator Shock — geser slider rupiah dan/atau panen',
      'Tunjukkan skor berubah real-time',
    ],
    extraNote: 'Kejujuran: validasi pengguna langsung masih dijadwalkan, bukan diklaim sudah selesai.',
  });
}

// ---------------------------------------------------------------------
// SLIDE 12 - FINAL CLOSING CARD (2:50-3:00) -> real video overlay
// ---------------------------------------------------------------------
function slide12() {
  const s = pres.addSlide();
  s.background = { color: DARK };
  timeBadge(s, '2:50–3:00', 0.55, 0.5, true);
  typeBadge(s, 'slide');

  txt(s, 'STATUS DATA — JUJUR, BUKAN DIKARANG', 0.9, 1.1, W - 1.8, 0.4, {
    fontSize: 13, bold: true, color: ACCENT, charSpacing: 1, align: 'center',
  });

  const boxW = 5.6, boxH = 1.9, gap = 0.55;
  const startX = (W - (boxW * 2 + gap)) / 2, boxY = 1.7;

  roundRect(s, startX, boxY, boxW, boxH, { fill: DARK2, radius: 0.1, line: ACCENT, lineWidth: 1.3 });
  icon(s, 'checkCircle', startX + 0.3, boxY + 0.28, 0.4);
  txt(s, 'REAL — TERVERIFIKASI LIVE', startX + 0.85, boxY + 0.3, boxW - 1.1, 0.4, { fontSize: 13, bold: true, color: ACCENT });
  txt(s, 'Harga (34 provinsi)  ·  Cuaca  ·  Produksi padi', startX + 0.3, boxY + 0.9, boxW - 0.6, 0.85, { fontSize: 13.5, color: TEXT_LIGHT, lineSpacing: 1.3 });

  const x2 = startX + boxW + gap;
  roundRect(s, x2, boxY, boxW, boxH, { fill: DARK2, radius: 0.1, line: AMBER, lineWidth: 1.3 });
  icon(s, 'alertTriangle', x2 + 0.3, boxY + 0.28, 0.4);
  txt(s, 'FORECAST — BELUM PRODUKSI', x2 + 0.85, boxY + 0.3, boxW - 1.1, 0.4, { fontSize: 13, bold: true, color: AMBER });
  txt(s, 'Stok gudang  ·  Biaya logistik aktual', x2 + 0.3, boxY + 0.9, boxW - 0.6, 0.85, { fontSize: 13.5, color: TEXT_LIGHT, lineSpacing: 1.3 });

  txt(s, 'pidi-seven.vercel.app', 0.9, 3.95, W - 1.8, 0.55, {
    fontSize: 20, bold: true, fontFace: MONO, color: 'FFFFFF', align: 'center',
  });
  txt(s, 'Prototype Live · Tim J4 · Siap Pilot dengan Bank Indonesia & TPID', 0.9, 4.55, W - 1.8, 0.45, {
    fontSize: 14, color: ACCENT, align: 'center',
  });
  txt(s, 'Terima kasih.', 0.9, 5.15, W - 1.8, 0.5, {
    fontSize: 20, bold: true, color: 'FFFFFF', align: 'center',
  });

  txt(s, '"Harga, cuaca, dan produksi sudah real. Stok dan biaya logistik kami tandai forecast sampai ada kemitraan Bapanas dan Bulog — bukan dikarang. Prototype live. Terima kasih."',
    1.1, 6.15, W - 2.2, 0.9, { fontSize: 11.5, italic: true, color: MUTED_LIGHT, align: 'center', lineSpacing: 1.25 });

  s.addNotes(
    'NARASI (ucapkan): "Harga, cuaca, dan produksi sudah real. Stok dan biaya logistik kami tandai forecast sampai ada kemitraan Bapanas dan Bulog - bukan dikarang. Prototype live. Terima kasih."\n\n' +
    'DURASI: 10 detik (2:50-3:00).\n' +
    'AKSI SEBELUM SLIDE INI: buka modal Export decision brief di app, tunjukkan bisa dicetak/PDF, baru potong ke kartu penutup ini.\n' +
    'CATATAN: Ini kartu penutup video yang sesungguhnya - slide overlay asli, bukan storyboard.'
  );
}

// ---------------------------------------------------------------------
// SLIDE 13 - PRE-RECORDING CHECKLIST (utility, not part of the video)
// ---------------------------------------------------------------------
function slide13() {
  const s = pres.addSlide();
  s.background = { color: LIGHT };
  roundRect(s, 0, 0, W, 1.05, { fill: DARK2 });
  icon(s, 'checkSquare', 0.55, 0.28, 0.5);
  txt(s, 'Persiapan Sebelum Rekam', 1.2, 0.22, 9, 0.6, { fontSize: 24, bold: true, color: 'FFFFFF' });
  txt(s, 'UNTUK PERSIAPAN TIM — BUKAN BAGIAN DARI VIDEO FINAL', W - 5.2, 0.4, 4.65, 0.35, {
    fontSize: 10, bold: true, color: AMBER, align: 'right',
  });

  // Left column: pre-record checklist + tech specs
  const lx = 0.55, ly = 1.35, lw = 6.0;
  roundRect(s, lx, ly, lw, 2.55, { fill: CARD_LIGHT, radius: 0.09, line: BORDER_LIGHT, lineWidth: 1 });
  txt(s, 'CHECKLIST SEBELUM REKAM', lx + 0.3, ly + 0.22, lw - 0.6, 0.35, { fontSize: 12, bold: true, color: ACCENT_DEEP, charSpacing: 0.8 });
  const preChecklist = [
    'Buka pidi-seven.vercel.app 5–10 menit lebih dulu, refresh 1x (hangatkan backend)',
    'Pastikan badge "Harga per provinsi (BI)" aktif di peta',
    'Browser full-screen (F11), zoom 100–110%, tutup tab lain & notifikasi',
    'Latih klik-path demo 2x dengan timer',
    'Siapkan rekaman cadangan (rekam sehari sebelumnya)',
  ].map((t, i, arr) => ({ text: t, options: { bullet: { code: '2022' }, fontSize: 11.5, color: TEXT_DARK, breakLine: i < arr.length - 1, paraSpaceAfter: 6 } }));
  s.addText(preChecklist, { x: lx + 0.3, y: ly + 0.62, w: lw - 0.6, h: 1.85, valign: 'top', margin: 0 });

  const ty = ly + 2.75;
  roundRect(s, lx, ty, lw, 2.3, { fill: CARD_LIGHT, radius: 0.09, line: BORDER_LIGHT, lineWidth: 1 });
  txt(s, 'SPESIFIKASI TEKNIS (WAJIB)', lx + 0.3, ty + 0.22, lw - 0.6, 0.35, { fontSize: 12, bold: true, color: ACCENT_DEEP, charSpacing: 0.8 });
  const specs = [
    'Durasi maksimal 180 detik — termasuk logo/bumper/credit',
    'Resolusi minimum 1920×1080 (Full HD), rasio 16:9 horizontal',
    'Upload YouTube unlisted — pastikan bisa dibuka tanpa login',
    'Subtitle sangat direkomendasikan',
    'Narasi jelas, musik latar tidak menutupi suara',
  ].map((t, i, arr) => ({ text: t, options: { bullet: { code: '2022' }, fontSize: 11.5, color: TEXT_DARK, breakLine: i < arr.length - 1, paraSpaceAfter: 6 } }));
  s.addText(specs, { x: lx + 0.3, y: ty + 0.62, w: lw - 0.6, h: 1.6, valign: 'top', margin: 0 });

  // Right column: click order
  const rx = 6.9, ry = 1.35, rw = W - 0.55 - rx, rh = 5.7;
  roundRect(s, rx, ry, rw, rh, { fill: DARK2, radius: 0.09 });
  cornerMarks(s, rx, ry, rw, rh, ACCENT);
  txt(s, 'URUTAN KLIK DEMO (HAFALKAN)', rx + 0.3, ry + 0.25, rw - 0.6, 0.35, { fontSize: 12, bold: true, color: ACCENT, charSpacing: 0.8 });
  const clickOrder = [
    'Cockpit tampil',
    'Role switcher (TPID → Bulog → TPID)',
    'Decision brief + klik 1 kartu aksi (drill-down)',
    'Hover 2–3 provinsi merah di peta',
    'Scroll ke Source Health',
    'Simulator Shock — geser 1–2 slider',
    'Export decision brief (buka modal) → closing',
  ].map((t, i, arr) => ({
    text: `${i + 1}. ${t}`,
    options: { fontSize: 13, color: TEXT_LIGHT, bold: false, breakLine: i < arr.length - 1, paraSpaceAfter: 14 },
  }));
  s.addText(clickOrder, { x: rx + 0.3, y: ry + 0.75, w: rw - 0.6, h: rh - 1.1, valign: 'top', margin: 0, lineSpacingMultiple: 1.15 });

  footer(s, false, 'Panduan Produksi');
  s.addNotes('Slide referensi tim untuk persiapan syuting - TIDAK dipotong ke dalam video final. Cetak atau buka di layar kedua saat merekam.');
}

// ---------------------------------------------------------------------
slide01();
slide02();
slide03();
slide04();
slide05();
slide06();
slide07();
slide08();
slide09();
slide10();
slide11();
slide12();
slide13();

pres.writeFile({ fileName: OUT }).then(() => {
  console.log('Wrote', OUT);
}).catch((e) => { console.error(e); process.exit(1); });
