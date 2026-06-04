/**
 * Optimization Service
 * Greedy + assignment algorithm for food redistribution planning.
 * In production, consider using Google OR-Tools via Python microservice
 * or a JS LP solver (glpk.js) for true optimal solutions.
 */

/**
 * Compute optimal redistribution plan given regional balances and available routes.
 * Uses a greedy nearest-surplus-to-deficit matching algorithm.
 *
 * @param {Array} regions - [{code, name, balance_ton}]
 * @param {Array} routes  - [{origin_code, destination_code, cost_per_ton, duration_days, capacity_ton}]
 * @returns {Object} redistribution plan with routes, costs, timeline
 */
export function computeRedistributionPlan(regions, routes) {
  const surpluses = regions
    .filter(r => parseFloat(r.balance_ton) > 10000)
    .map(r => ({ ...r, available: parseFloat(r.balance_ton) }))
    .sort((a, b) => b.available - a.available);

  const deficits = regions
    .filter(r => parseFloat(r.balance_ton) < -10000)
    .map(r => ({ ...r, needed: Math.abs(parseFloat(r.balance_ton)) }))
    .sort((a, b) => b.needed - a.needed);

  // Build route lookup: origin → destination → route
  const routeMap = {};
  for (const r of routes) {
    if (!routeMap[r.origin_code]) routeMap[r.origin_code] = {};
    routeMap[r.origin_code][r.destination_code] = r;
  }

  const assignments = [];
  const surplusState = surpluses.map(s => ({ ...s }));
  const deficitState = deficits.map(d => ({ ...d }));

  let totalCost = 0;
  let totalVolume = 0;

  for (const deficit of deficitState) {
    let remaining = deficit.needed;

    // Sort surplus regions by route cost to this deficit
    const candidates = surplusState
      .filter(s => s.available > 0)
      .map(s => ({
        surplus: s,
        route: routeMap[s.code]?.[deficit.code] || null,
      }))
      .filter(c => c.route !== null)
      .sort((a, b) => parseFloat(a.route.cost_per_ton) - parseFloat(b.route.cost_per_ton));

    for (const { surplus, route } of candidates) {
      if (remaining <= 0) break;

      const transferable = Math.min(remaining, surplus.available, parseFloat(route.capacity_ton));
      if (transferable <= 0) continue;

      const cost = transferable * parseFloat(route.cost_per_ton);
      const batches = Math.ceil(transferable / parseFloat(route.capacity_ton));

      assignments.push({
        origin:         surplus.name || surplus.code,
        origin_code:    surplus.code,
        destination:    deficit.name || deficit.code,
        destination_code: deficit.code,
        volume_ton:     Math.round(transferable),
        cost_idr:       Math.round(cost),
        cost_per_ton:   parseFloat(route.cost_per_ton),
        duration_days:  parseFloat(route.duration_days),
        transport_mode: route.transport_mode,
        distance_km:    parseInt(route.distance_km),
        batches,
        status: 'planned',
      });

      surplus.available -= transferable;
      remaining -= transferable;
      totalCost += cost;
      totalVolume += transferable;
    }

    if (remaining > 0) {
      assignments.push({
        origin: 'IMPORT',
        origin_code: 'IMP',
        destination: deficit.name || deficit.code,
        destination_code: deficit.code,
        volume_ton: Math.round(remaining),
        cost_idr: Math.round(remaining * 650000), // Approx import cost/ton
        cost_per_ton: 650000,
        duration_days: 21,
        transport_mode: 'sea_import',
        distance_km: null,
        batches: Math.ceil(remaining / 15000),
        status: 'pending_procurement',
        note: 'Memerlukan impor — tidak ada surplus domestik mencukupi',
      });
      totalCost += remaining * 650000;
      totalVolume += remaining;
    }
  }

  // Generate timeline phases
  const timeline = generateTimeline(assignments);

  return {
    assignments,
    summary: {
      total_volume_ton: Math.round(totalVolume),
      total_cost_idr: Math.round(totalCost),
      cost_per_ton_avg: totalVolume > 0 ? Math.round(totalCost / totalVolume) : 0,
      duration_weeks: timeline.total_weeks,
      routes_count: assignments.filter(a => a.origin !== 'IMPORT').length,
      requires_import: assignments.some(a => a.origin === 'IMPORT'),
    },
    timeline,
    cost_breakdown: computeCostBreakdown(totalCost, assignments),
  };
}

function generateTimeline(assignments) {
  const phases = [
    {
      phase: 1,
      name: 'Mobilisasi & persiapan',
      week_start: 1,
      week_end: 2,
      activities: [
        'Koordinasi Bulog regional dan Kemendag',
        'Kontrak sewa kapal kargo',
        'Identifikasi dan booking gudang penerima',
        'Pengurusan dokumen izin distribusi',
      ],
    },
    {
      phase: 2,
      name: 'Pengiriman batch pertama',
      week_start: 2,
      week_end: 6,
      activities: assignments
        .filter((_, i) => i % 2 === 0)
        .map(a => `${a.origin} → ${a.destination}: ${a.volume_ton.toLocaleString()} ton`),
    },
    {
      phase: 3,
      name: 'Pengiriman batch kedua',
      week_start: 5,
      week_end: 9,
      activities: assignments
        .filter((_, i) => i % 2 !== 0)
        .map(a => `${a.origin} → ${a.destination}: ${a.volume_ton.toLocaleString()} ton`),
    },
    {
      phase: 4,
      name: 'Distribusi lokal & evaluasi',
      week_start: 9,
      week_end: 12,
      activities: [
        'Distribusi dari gudang ke pasar lokal',
        'Monitoring harga komoditas dampak redistribusi',
        'Evaluasi efektivitas dan pelaporan',
        'Update model prediksi untuk siklus berikutnya',
      ],
    },
  ];

  return { phases, total_weeks: 12 };
}

function computeCostBreakdown(totalCost, assignments) {
  const seaShipping = assignments
    .filter(a => a.transport_mode?.includes('sea'))
    .reduce((s, a) => s + a.cost_idr * 0.72, 0); // ~72% is vessel + fuel

  return [
    { label: 'Sewa kapal & bahan bakar',  amount: Math.round(seaShipping),           pct: 58 },
    { label: 'Bongkar muat & handling',   amount: Math.round(totalCost * 0.12),       pct: 12 },
    { label: 'Sewa gudang',               amount: Math.round(totalCost * 0.097),      pct: 10 },
    { label: 'Distribusi darat lokal',    amount: Math.round(totalCost * 0.121),      pct: 12 },
    { label: 'Asuransi kargo (0.5%)',     amount: Math.round(totalCost * 0.005 * 10), pct: 3  },
    { label: 'Koordinasi & monitoring',   amount: Math.round(totalCost * 0.036),      pct: 4  },
  ];
}

/**
 * Optimize routes for a specific set of shipment requirements.
 * Uses cost minimization with capacity constraints.
 */
export function optimizeRoutes(requirements, availableRoutes) {
  const results = requirements.map(req => {
    const candidates = availableRoutes
      .filter(r => r.origin === req.from && r.destination === req.to)
      .sort((a, b) => parseFloat(a.cost_per_ton) - parseFloat(b.cost_per_ton));

    if (candidates.length === 0) {
      return { ...req, status: 'no_route', recommendation: 'Tidak ada rute langsung tersedia' };
    }

    const best = candidates[0];
    const batches = Math.ceil(req.volumeTon / parseFloat(best.capacity_ton));

    return {
      ...req,
      recommended_route: best,
      batches,
      total_cost: Math.round(req.volumeTon * parseFloat(best.cost_per_ton)),
      total_days: Math.round(best.duration_days * batches * 0.7), // Overlap batches
      efficiency_score: Math.round(90 - (batches * 5)), // Penalty for many batches
      status: 'optimized',
    };
  });

  const totalCost = results.reduce((s, r) => s + (r.total_cost || 0), 0);
  const totalVolume = requirements.reduce((s, r) => s + r.volumeTon, 0);

  return {
    routes: results,
    summary: {
      total_cost_idr: totalCost,
      total_volume_ton: totalVolume,
      avg_cost_per_ton: totalVolume > 0 ? Math.round(totalCost / totalVolume) : 0,
    },
  };
}
