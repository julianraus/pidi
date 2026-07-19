/**
 * AI Service — Calls Anthropic Claude API for intelligent food security forecasting.
 * Uses claude-sonnet-4-20250514 to analyze supply/demand, weather risk, and price data.
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

async function callClaude(systemPrompt, userPrompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    console.warn('[AI] No ANTHROPIC_API_KEY set, returning offline forecast response');
    return getOfflineForecastResponse(userPrompt);
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const result = await response.json();
  const text = result.content?.[0]?.text || '';

  // Parse JSON from response
  try {
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/);
    if (jsonMatch) return { ...JSON.parse(jsonMatch[1]), ai_source: 'claude' };
  } catch (e) {
    console.warn('[AI] Could not parse JSON from response, returning raw text');
  }

  return { raw: text, ai_source: 'claude' };
}

// ─── System Prompts ───────────────────────────────────────────────────────────

const FOOD_SECURITY_SYSTEM = `Kamu adalah analis ketahanan pangan senior untuk Indonesia. 
Tugas kamu adalah menganalisis data supply/demand, cuaca, dan harga komoditas untuk memberikan 
forecast dan rekomendasi yang akurat dan actionable kepada pengambil kebijakan.
Tekankan resiliensi keputusan, ketahanan pangan, tekanan rupiah, imported inflation,
biaya logistik, dan koordinasi stok antarwilayah saat menyusun rekomendasi.

Selalu berikan respons dalam format JSON yang valid dengan struktur yang diminta.
Gunakan bahasa Indonesia yang formal dan profesional.
Berikan analisis yang spesifik, terukur, dan berbasis data.`;

// Offline forecast responses when no API key is configured.

function getOfflineForecastResponse(prompt) {
  if (prompt.includes('forecast_overview')) {
    return {
      national_status: {
        level: 'siaga_2',
        label: 'Siaga 2 — Perlu Perhatian',
        summary: 'Ketahanan pangan nasional dalam kondisi cukup stabil namun terdapat tekanan di beberapa wilayah akibat curah hujan di bawah normal yang meningkatkan risiko gagal panen. Lihat halaman Cuaca & Risiko Panen untuk fase ENSO terkini dan skor risiko per wilayah berbasis data live BMKG/NOAA.',
      },
      forecast_30_days: {
        supply_trend: 'menurun_moderat',
        price_trend: 'meningkat',
        risk_level: 'sedang',
        confidence: 78,
        summary: 'Dalam 30 hari ke depan, pasokan beras nasional diperkirakan menurun 4–7% akibat risiko banjir di sentra produksi. Harga komoditas volatile (cabai, bawang) berpotensi naik 10–15% seiring berkurangnya pasokan dari Sulawesi.',
      },
      forecast_90_days: {
        supply_trend: 'stabil',
        price_trend: 'stabil_menurun',
        risk_level: 'rendah',
        confidence: 62,
        summary: 'Memasuki bulan Juni–Juli, tekanan cuaca diperkirakan mereda. Panen raya musim kedua di Jawa Timur akan menstabilkan pasokan beras nasional. Namun Papua dan Maluku tetap bergantung pada redistribusi dari Sumatera.',
      },
      key_risks: [
        { region: 'Sulawesi Selatan', risk: 'Banjir sawah ekstrem', probability: 78, impact: 'Kehilangan 78.000 ton beras', urgency: 'tinggi' },
        { region: 'Jawa Tengah', risk: 'Serangan OPT wereng coklat', probability: 61, impact: 'Penurunan produksi 18%', urgency: 'sedang' },
        { region: 'Nusa Tenggara Timur', risk: 'Kekeringan musim tanam', probability: 44, impact: 'Gagal panen jagung 35%', urgency: 'sedang' },
      ],
      opportunities: [
        'Surplus beras di Jawa Timur dapat dimaksimalkan untuk redistribusi ke wilayah timur',
        'Harga jagung stabil — momentum baik untuk perkuat cadangan pakan ternak',
        'Musim tanam ketiga di Sumatera Utara berpotensi menghasilkan surplus tambahan 30.000 ton',
      ],
      recommendations: [
        { priority: 1, action: 'Pre-posisi stok Bulog 78.000 ton dari Jawa Timur ke Makassar dalam 2 minggu', category: 'logistik', impact: 'tinggi' },
        { priority: 2, action: 'Aktifkan pompa drainase darurat di 12 kabupaten sentra padi Sulawesi Selatan', category: 'produksi', impact: 'tinggi' },
        { priority: 3, action: 'Distribusi benih tahan genangan Inpara 3/4 ke petani terdampak', category: 'produksi', impact: 'sedang' },
        { priority: 4, action: 'Naikkan HET beras premium Rp 500/kg untuk kurangi tekanan margin petani', category: 'kebijakan', impact: 'sedang' },
        { priority: 5, action: 'Aktifkan kontrak siaga impor 200.000 ton beras dari Vietnam sebagai cadangan', category: 'impor', impact: 'sedang' },
      ],
      generated_at: new Date().toISOString(),
      ai_source: 'offline_template',
    };
  }

  if (prompt.includes('redistribution_analysis')) {
    return {
      optimal_plan: [
        { from: 'Jawa', to: 'Bali & Nusa Tenggara', volume_ton: 60000, cost_idr: 17100000000, duration_weeks: 4, priority: 'kritis', rationale: 'Defisit 60.000 ton harus diselesaikan sebelum musim kering memperburuk kondisi lokal' },
        { from: 'Sumatera', to: 'Papua & Maluku', volume_ton: 55000, cost_idr: 22550000000, duration_weeks: 8, priority: 'kritis', rationale: 'Jarak jauh memerlukan perencanaan lebih awal. Gunakan kapal kargo besar untuk efisiensi biaya' },
        { from: 'Jawa', to: 'Kalimantan', volume_ton: 10000, cost_idr: 2400000000, duration_weeks: 3, priority: 'sedang', rationale: 'Gap kecil namun perlu dipenuhi sebelum musim tanam berikutnya' },
      ],
      total_cost_idr: 42050000000,
      total_volume_ton: 125000,
      efficiency_score: 84,
      ai_insights: [
        'Rute Sumatera → Papua memiliki efisiensi rendah (64%). Rekomendasikan konsolidasi muatan dengan jalur Sulawesi → Maluku untuk kurangi cost 12%.',
        'Waktu optimal keberangkatan: 2 minggu ke depan, sebelum musim angin barat yang akan menghambat pelayaran.',
        'Pertimbangkan penggunaan kapal milik PELNI untuk rute Papua guna mendapat subsidi BBM dan mengurangi biaya 8–12%.',
      ],
      generated_at: new Date().toISOString(),
      ai_source: 'offline_template',
    };
  }

  return {
    answer: 'Berdasarkan data terkini, keputusan pangan perlu diarahkan pada resiliensi stok dan harga. Pelemahan rupiah meningkatkan risiko imported inflation untuk komoditas impor seperti kedelai, bawang putih, dan daging sapi, sementara risiko cuaca dapat mempersempit pasokan lokal. Prioritas tindakan adalah pre-positioning stok ke wilayah defisit, pengamanan rute logistik biaya rendah, dan pemantauan harga harian untuk mencegah policy lag.',
    confidence: 75,
    sources: ['Data BPS/BI 2026', 'Prakiraan BMKG', 'Stok dan rute logistik regional'],
    generated_at: new Date().toISOString(),
    ai_source: 'offline_template',
  };
}

// ─── Exported functions ───────────────────────────────────────────────────────

export async function generateForecast({ supplyData, riskData, priceData, alertData }) {
  const systemPrompt = FOOD_SECURITY_SYSTEM;

  const userPrompt = `forecast_overview

Analisis data ketahanan pangan Indonesia berikut dan berikan forecast komprehensif.

DATA SUPPLY/DEMAND BERAS (ton/bulan):
${JSON.stringify(supplyData, null, 2)}

DATA RISIKO PANEN PER WILAYAH:
${JSON.stringify(riskData, null, 2)}

DATA HARGA KOMODITAS:
${JSON.stringify(priceData, null, 2)}

ALERT AKTIF:
${JSON.stringify(alertData, null, 2)}

Berikan respons dalam format JSON berikut:
{
  "national_status": {
    "level": "aman|waspada|siaga_1|siaga_2|kritis",
    "label": "string deskriptif",
    "summary": "ringkasan 2-3 kalimat kondisi nasional"
  },
  "forecast_30_days": {
    "supply_trend": "meningkat|stabil|menurun_ringan|menurun_moderat|menurun_tajam",
    "price_trend": "menurun|stabil|meningkat|meningkat_tajam",
    "risk_level": "rendah|sedang|tinggi|kritis",
    "confidence": <angka 0-100>,
    "summary": "prediksi 30 hari ke depan dalam 2-3 kalimat"
  },
  "forecast_90_days": {
    "supply_trend": "...",
    "price_trend": "...",
    "risk_level": "...",
    "confidence": <angka 0-100>,
    "summary": "prediksi 90 hari ke depan dalam 2-3 kalimat"
  },
  "key_risks": [
    {"region": "...", "risk": "...", "probability": <0-100>, "impact": "...", "urgency": "tinggi|sedang|rendah"}
  ],
  "opportunities": ["string", "string", "string"],
  "recommendations": [
    {"priority": 1, "action": "...", "category": "logistik|produksi|kebijakan|impor", "impact": "tinggi|sedang|rendah"}
  ],
  "generated_at": "${new Date().toISOString()}"
}`;

  return callClaude(systemPrompt, userPrompt);
}

export async function generateAlert(question, { supplyData, riskData, priceData, additionalContext }) {
  const systemPrompt = FOOD_SECURITY_SYSTEM;

  const userPrompt = `Pertanyaan dari analis kebijakan:
"${question}"

${additionalContext ? `Konteks tambahan: ${additionalContext}\n` : ''}
DATA KONTEKS:
Supply/Demand: ${JSON.stringify(supplyData)}
Risiko Panen: ${JSON.stringify(riskData)}  
Harga: ${JSON.stringify(priceData)}

Berikan jawaban dalam format JSON:
{
  "answer": "jawaban lengkap dan terstruktur dalam bahasa Indonesia",
  "key_points": ["poin 1", "poin 2", "poin 3"],
  "confidence": <0-100>,
  "data_basis": "basis data yang digunakan untuk menjawab",
  "follow_up_questions": ["pertanyaan lanjutan yang relevan"],
  "generated_at": "${new Date().toISOString()}"
}`;

  return callClaude(systemPrompt, userPrompt);
}

export async function generateRedistributionAnalysis({ supplyData, routeData, riskData }) {
  const systemPrompt = FOOD_SECURITY_SYSTEM;

  const userPrompt = `redistribution_analysis

Buat rencana redistribusi pangan optimal berdasarkan data berikut:

NERACA SUPPLY/DEMAND:
${JSON.stringify(supplyData, null, 2)}

RUTE DISTRIBUSI TERSEDIA:
${JSON.stringify(routeData, null, 2)}

RISIKO PANEN (untuk prioritisasi):
${JSON.stringify(riskData, null, 2)}

Berikan rencana redistribusi dalam format JSON:
{
  "optimal_plan": [
    {
      "from": "wilayah asal",
      "to": "wilayah tujuan", 
      "volume_ton": <angka>,
      "cost_idr": <angka>,
      "duration_weeks": <angka>,
      "priority": "kritis|tinggi|sedang",
      "rationale": "alasan pemilihan rute dan volume ini"
    }
  ],
  "total_cost_idr": <angka>,
  "total_volume_ton": <angka>,
  "efficiency_score": <0-100>,
  "ai_insights": [
    "insight 1 tentang optimasi yang bisa dilakukan",
    "insight 2 tentang risiko logistik",
    "insight 3 tentang penghematan biaya"
  ],
  "generated_at": "${new Date().toISOString()}"
}`;

  return callClaude(systemPrompt, userPrompt);
}
