/**
 * Weather Risk Scoring Service
 * Computes harvest risk scores from weather forecast data.
 */

/**
 * Compute a 0–100 risk score for a region based on weather parameters.
 *
 * Scoring weights:
 *   - Rainfall deviation from 30yr normal: 40%
 *   - Flood risk index:                    30%
 *   - Drought index:                       20%
 *   - ENSO phase multiplier:               10%
 *
 * @param {Object} params
 * @param {number} params.rainfallDev     - % deviation from 30-yr normal (positive = excess, negative = drought)
 * @param {number} params.avgRainfallMm   - Average forecasted daily rainfall (mm)
 * @param {number} params.maxRainfallMm   - Max single-day rainfall in forecast window (mm)
 * @param {string} params.ensoPhase       - 'neutral' | 'weak_la_nina' | 'strong_la_nina' | 'el_nino'
 * @returns {{ score: number, level: string, floodRisk: number, droughtRisk: number }}
 */
export function computeRiskScore({ rainfallDev = 0, avgRainfallMm = 10, maxRainfallMm = 30, ensoPhase = 'neutral' }) {
  // Flood risk: triggered by excess rainfall
  const floodRisk = rainfallDev > 20
    ? Math.min(100, (rainfallDev - 20) * 2.5 + (maxRainfallMm > 50 ? 15 : 0))
    : Math.max(0, rainfallDev * 0.5);

  // Drought risk: triggered by rainfall deficit
  const droughtRisk = rainfallDev < -20
    ? Math.min(100, (-rainfallDev - 20) * 2.0)
    : 0;

  // ENSO multiplier
  const ensoMultiplier = {
    neutral:        1.0,
    weak_la_nina:   1.15,
    strong_la_nina: 1.35,
    el_nino:        1.25,
  }[ensoPhase] || 1.0;

  const rawScore =
    (Math.abs(rainfallDev) * 0.40) +
    (floodRisk * 0.30) +
    (droughtRisk * 0.20) +
    (10 * 0.10); // base ENSO contribution

  const score = Math.min(100, Math.max(0, rawScore * ensoMultiplier));

  const level =
    score >= 70 ? 'critical' :
    score >= 50 ? 'high' :
    score >= 30 ? 'medium' : 'normal';

  return {
    score: parseFloat(score.toFixed(2)),
    level,
    floodRisk: parseFloat(floodRisk.toFixed(2)),
    droughtRisk: parseFloat(droughtRisk.toFixed(2)),
  };
}

/**
 * Estimate potential harvest loss given a risk score.
 * Returns estimated loss percentage and tonnage.
 *
 * @param {number} riskScore       - 0–100
 * @param {number} baseProductionTon - Expected production without weather risk
 */
export function estimateHarvestLoss(riskScore, baseProductionTon) {
  // Loss curve: no loss below 30, linear up to 50% loss at score 100
  const lossPct = riskScore < 30 ? 0 : Math.min(50, (riskScore - 30) * 0.71);
  const lossTon = baseProductionTon * (lossPct / 100);

  return {
    loss_pct: parseFloat(lossPct.toFixed(1)),
    loss_ton: Math.round(lossTon),
    adjusted_production_ton: Math.round(baseProductionTon - lossTon),
  };
}

/**
 * Determine recommended action based on risk level.
 */
export function getActionPlan(riskLevel, regionName, lossEstimateTon) {
  const actions = {
    critical: [
      `Aktivasi pompa drainase darurat di ${regionName}`,
      `Pre-posisi stok Bulog ${Math.round(lossEstimateTon / 1000)}K ton ke gudang regional`,
      'Distribusi benih tahan genangan (Inpara 3/4)',
      'Monitoring harian via citra satelit LAPAN',
    ],
    high: [
      `Perkuat sistem drainase irigasi di ${regionName}`,
      'Distribusi pestisida OPT bersubsidi',
      `Tambah cadangan stok Bulog regional ${Math.round(lossEstimateTon / 1000)}K ton`,
    ],
    medium: [
      `Pantau perkembangan cuaca ${regionName} secara mingguan`,
      'Siapkan benih cadangan untuk penyulaman',
      'Koordinasi dengan Dinas Pertanian setempat',
    ],
    normal: [
      'Produksi on-track, monitoring rutin',
    ],
  };

  return actions[riskLevel] || actions.normal;
}
