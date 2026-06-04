import axios from 'axios';

const GOOGLE_ROUTES_ENDPOINT = 'https://routes.googleapis.com/directions/v2:computeRoutes';
const GOOGLE_FIELD_MASK = [
  'routes.distanceMeters',
  'routes.duration',
  'routes.staticDuration',
  'routes.polyline.encodedPolyline',
].join(',');

const ROAD_ROUTABLE_MODES = new Set(['road', 'truck', 'multimodal']);

export const EXPECTED_LOGISTICS_FIELDS = [
  'origin_region',
  'destination_region',
  'transport_mode',
  'capacity_ton',
  'cost_per_ton',
  'lead_time_days',
  'carrier',
  'congestion_status',
  'warehouse_stock_ton',
  'last_updated_at',
  'source_owner',
];

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function hasCoordinates(route) {
  return Number.isFinite(toNumber(route.origin_latitude, NaN))
    && Number.isFinite(toNumber(route.origin_longitude, NaN))
    && Number.isFinite(toNumber(route.destination_latitude, NaN))
    && Number.isFinite(toNumber(route.destination_longitude, NaN));
}

function isRoadRoutable(mode = '') {
  return ROAD_ROUTABLE_MODES.has(String(mode).toLowerCase());
}

function parseGoogleDurationSeconds(duration) {
  if (!duration || typeof duration !== 'string') return null;
  const seconds = Number(duration.replace('s', ''));
  return Number.isFinite(seconds) ? seconds : null;
}

function haversineDistanceKm(route) {
  if (!hasCoordinates(route)) return null;

  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const lat1 = toRadians(toNumber(route.origin_latitude));
  const lat2 = toRadians(toNumber(route.destination_latitude));
  const deltaLat = toRadians(toNumber(route.destination_latitude) - toNumber(route.origin_latitude));
  const deltaLng = toRadians(toNumber(route.destination_longitude) - toNumber(route.origin_longitude));
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earthRadiusKm * c);
}

function buildGoogleMapsUrl(route) {
  if (!hasCoordinates(route)) return null;
  const origin = `${toNumber(route.origin_latitude)},${toNumber(route.origin_longitude)}`;
  const destination = `${toNumber(route.destination_latitude)},${toNumber(route.destination_longitude)}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
}

export function getGoogleRoutesConfig() {
  return {
    configured: Boolean(process.env.GOOGLE_MAPS_API_KEY),
    provider: 'Google Routes API',
    endpoint: GOOGLE_ROUTES_ENDPOINT,
    field_mask: GOOGLE_FIELD_MASK,
    supported_modes: [...ROAD_ROUTABLE_MODES],
  };
}

export async function fetchGoogleRouteMetric(route) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const fetchedAt = new Date().toISOString();

  if (!hasCoordinates(route)) {
    return {
      status: 'unavailable',
      provider: 'Google Routes API',
      fetched_at: fetchedAt,
      reason: 'Koordinat asal/tujuan belum tersedia.',
    };
  }

  if (!isRoadRoutable(route.transport_mode)) {
    return {
      status: 'unavailable',
      provider: 'Google Routes API',
      fetched_at: fetchedAt,
      reason: 'Google Routes tidak memodelkan biaya/ETA kargo laut untuk rute ini.',
    };
  }

  if (!apiKey) {
    return {
      status: 'unavailable',
      provider: 'Google Routes API',
      fetched_at: fetchedAt,
      reason: 'GOOGLE_MAPS_API_KEY belum dikonfigurasi di backend.',
    };
  }

  const body = {
    origin: {
      location: {
        latLng: {
          latitude: toNumber(route.origin_latitude),
          longitude: toNumber(route.origin_longitude),
        },
      },
    },
    destination: {
      location: {
        latLng: {
          latitude: toNumber(route.destination_latitude),
          longitude: toNumber(route.destination_longitude),
        },
      },
    },
    travelMode: 'DRIVE',
    routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
    computeAlternativeRoutes: false,
    languageCode: 'id-ID',
    units: 'METRIC',
  };

  try {
    const response = await axios.post(GOOGLE_ROUTES_ENDPOINT, body, {
      timeout: toNumber(process.env.GOOGLE_ROUTES_TIMEOUT_MS, 7000),
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': GOOGLE_FIELD_MASK,
      },
    });

    const bestRoute = response.data?.routes?.[0];
    if (!bestRoute) {
      return {
        status: 'unavailable',
        provider: 'Google Routes API',
        fetched_at: fetchedAt,
        reason: 'Google Routes tidak mengembalikan rute.',
      };
    }

    const durationSeconds = parseGoogleDurationSeconds(bestRoute.duration);
    const staticDurationSeconds = parseGoogleDurationSeconds(bestRoute.staticDuration);

    return {
      status: 'real-time',
      provider: 'Google Routes API',
      fetched_at: fetchedAt,
      distance_km: Math.round(toNumber(bestRoute.distanceMeters) / 1000),
      duration_hours: durationSeconds ? +(durationSeconds / 3600).toFixed(1) : null,
      static_duration_hours: staticDurationSeconds ? +(staticDurationSeconds / 3600).toFixed(1) : null,
      encoded_polyline: bestRoute.polyline?.encodedPolyline || null,
      source_url: GOOGLE_ROUTES_ENDPOINT,
    };
  } catch (error) {
    return {
      status: 'unavailable',
      provider: 'Google Routes API',
      fetched_at: fetchedAt,
      reason: error.response?.data?.error?.message || error.message || 'Google Routes request gagal.',
    };
  }
}

function buildRouteMetric(route, googleMetric) {
  const dbDistanceKm = toNumber(route.distance_km, null);
  const dbDurationDays = toNumber(route.duration_days, null);
  const fallbackDistanceKm = dbDistanceKm || haversineDistanceKm(route);
  const fallbackDurationDays = dbDurationDays || (fallbackDistanceKm ? +(fallbackDistanceKm / 550).toFixed(1) : null);

  if (googleMetric?.status === 'real-time') {
    return {
      source_type: 'real-time',
      provider: googleMetric.provider,
      fetched_at: googleMetric.fetched_at,
      distance_km: googleMetric.distance_km,
      duration_hours: googleMetric.duration_hours,
      duration_days: googleMetric.duration_hours ? +(googleMetric.duration_hours / 24).toFixed(1) : null,
      encoded_polyline: googleMetric.encoded_polyline,
      note: 'Jarak dan ETA berasal dari Google Routes API untuk moda jalan.',
    };
  }

  return {
    source_type: fallbackDistanceKm && fallbackDurationDays ? 'forecast' : 'unavailable',
    provider: fallbackDistanceKm && fallbackDurationDays ? 'distribution_routes table + distance heuristic' : null,
    fetched_at: new Date().toISOString(),
    distance_km: fallbackDistanceKm,
    duration_hours: fallbackDurationDays ? +(fallbackDurationDays * 24).toFixed(1) : null,
    duration_days: fallbackDurationDays,
    encoded_polyline: null,
    note: googleMetric?.reason || 'ETA dan jarak memakai estimasi route table karena sumber real-time belum tersedia.',
  };
}

function normalizeScore(value, min, max, invert = false) {
  if (!Number.isFinite(value)) return 50;
  if (max === min) return 70;
  const normalized = ((value - min) / (max - min)) * 100;
  return invert ? clamp(100 - normalized) : clamp(normalized);
}

function buildAction({ destinationDeficitTon, originSurplusTon, recommendedVolumeTon, score }) {
  if (destinationDeficitTon <= 0) {
    return {
      label: 'monitor',
      text: 'Monitor rute dan siapkan kontrak siaga.',
    };
  }

  if (originSurplusTon <= 0) {
    return {
      label: 'needs_supply_confirmation',
      text: 'Validasi sumber pasokan sebelum dispatch.',
    };
  }

  if (score >= 72 && recommendedVolumeTon > 0) {
    return {
      label: 'dispatch_priority',
      text: 'Prioritaskan pengiriman bertahap ke wilayah defisit.',
    };
  }

  return {
    label: 'stage_inventory',
    text: 'Siapkan staging stok dan negosiasi kapasitas.',
  };
}

export async function buildLogisticsRecommendations(routes, { commodityCode = 'BERAS' } = {}) {
  const routeRows = Array.isArray(routes) ? routes : [];
  const googleMetrics = await Promise.all(routeRows.map((route) => fetchGoogleRouteMetric(route)));
  const routeMetrics = routeRows.map((route, index) => buildRouteMetric(route, googleMetrics[index]));

  const costs = routeRows.map((route) => toNumber(route.cost_per_ton)).filter(Boolean);
  const capacities = routeRows.map((route) => toNumber(route.capacity_ton)).filter(Boolean);
  const durations = routeMetrics.map((metric) => toNumber(metric.duration_days)).filter(Boolean);
  const deficits = routeRows.map((route) => Math.max(0, -toNumber(route.destination_balance_ton))).filter(Boolean);

  const minCost = costs.length ? Math.min(...costs) : 0;
  const maxCost = costs.length ? Math.max(...costs) : 1;
  const minCapacity = capacities.length ? Math.min(...capacities) : 0;
  const maxCapacity = capacities.length ? Math.max(...capacities) : 1;
  const minDuration = durations.length ? Math.min(...durations) : 0;
  const maxDuration = durations.length ? Math.max(...durations) : 1;
  const maxDeficit = deficits.length ? Math.max(...deficits) : 1;

  const recommendations = routeRows.map((route, index) => {
    const routeMetric = routeMetrics[index];
    const googleMetric = googleMetrics[index];
    const destinationDeficitTon = Math.max(0, -toNumber(route.destination_balance_ton));
    const originSurplusTon = Math.max(0, toNumber(route.origin_balance_ton));
    const capacityTon = toNumber(route.capacity_ton);
    const costPerTon = toNumber(route.cost_per_ton);
    const durationDays = toNumber(routeMetric.duration_days, toNumber(route.duration_days));
    const avgEfficiency = toNumber(route.avg_efficiency_pct, 70);
    const recommendedVolumeTon = Math.round(Math.max(0, Math.min(
      capacityTon,
      destinationDeficitTon,
      originSurplusTon * 0.45 || capacityTon * 0.35,
    )));

    const urgencyScore = normalizeScore(destinationDeficitTon, 0, maxDeficit);
    const costScore = normalizeScore(costPerTon, minCost, maxCost, true);
    const capacityScore = normalizeScore(capacityTon, minCapacity, maxCapacity);
    const etaScore = normalizeScore(durationDays, minDuration, maxDuration, true);
    const sourceConfidence = routeMetric.source_type === 'real-time' ? 95 : routeMetric.source_type === 'forecast' ? 62 : 35;
    const recommendationScore = Math.round(
      urgencyScore * 0.34
      + costScore * 0.17
      + capacityScore * 0.14
      + etaScore * 0.17
      + avgEfficiency * 0.12
      + sourceConfidence * 0.06,
    );

    const action = buildAction({
      destinationDeficitTon,
      originSurplusTon,
      recommendedVolumeTon,
      score: recommendationScore,
    });

    return {
      route_id: route.id,
      route_name: route.route_name,
      commodity_code: commodityCode,
      transport_mode: route.transport_mode,
      origin: {
        code: route.origin_code,
        name: route.origin_name,
        latitude: toNumber(route.origin_latitude, null),
        longitude: toNumber(route.origin_longitude, null),
        balance_ton: Math.round(toNumber(route.origin_balance_ton)),
        supply_ton: Math.round(toNumber(route.origin_supply_ton)),
        demand_ton: Math.round(toNumber(route.origin_demand_ton)),
      },
      destination: {
        code: route.destination_code,
        name: route.destination_name,
        latitude: toNumber(route.destination_latitude, null),
        longitude: toNumber(route.destination_longitude, null),
        balance_ton: Math.round(toNumber(route.destination_balance_ton)),
        supply_ton: Math.round(toNumber(route.destination_supply_ton)),
        demand_ton: Math.round(toNumber(route.destination_demand_ton)),
      },
      route_metric: routeMetric,
      cost_capacity: {
        source_type: 'forecast',
        provider: 'distribution_routes table; production requires carrier/operator feed',
        cost_per_ton_idr: Math.round(costPerTon),
        capacity_ton: Math.round(capacityTon),
        note: 'Biaya dan kapasitas belum berasal dari API operator logistik, sehingga tidak diklaim sebagai real-time.',
      },
      recommendation: {
        action: action.label,
        text: action.text,
        recommended_volume_ton: recommendedVolumeTon,
        rationale: `Tujuan defisit ${Math.round(destinationDeficitTon).toLocaleString('id-ID')} ton, asal surplus ${Math.round(originSurplusTon).toLocaleString('id-ID')} ton, ETA ${durationDays || '-'} hari.`,
        resilience_reason: 'Rute diprioritaskan untuk mempercepat penyeimbangan stok saat biaya logistik dan imported inflation menekan harga pangan.',
      },
      scores: {
        recommendation: recommendationScore,
        urgency: Math.round(urgencyScore),
        cost: Math.round(costScore),
        eta: Math.round(etaScore),
        capacity: Math.round(capacityScore),
        efficiency: Math.round(avgEfficiency),
        source_confidence: Math.round(sourceConfidence),
      },
      maps: {
        google_maps_url: buildGoogleMapsUrl(route),
        embed_supported: hasCoordinates(route),
        caveat: isRoadRoutable(route.transport_mode)
          ? 'Peta Google dapat dipakai sebagai referensi rute jalan.'
          : 'Peta Google hanya referensi lokasi/arah; rute kargo laut tetap membutuhkan data pelabuhan dan operator.',
      },
      google: googleMetric,
      data_lineage: {
        distance_eta: {
          status: routeMetric.source_type,
          provider: routeMetric.provider,
          note: routeMetric.note,
        },
        cost_capacity: {
          status: 'forecast',
          provider: 'distribution_routes table',
          note: 'Expected production source: Bulog/operator logistik/carrier API.',
        },
        stock_balance: {
          status: route.destination_period_month ? 'forecast' : 'unavailable',
          provider: 'supply_demand table',
          period_month: route.destination_period_month || null,
          note: 'Expected production source: Bapanas/Bulog/Dinas Pangan warehouse stock feed.',
        },
      },
    };
  }).sort((a, b) => b.scores.recommendation - a.scores.recommendation);

  return {
    commodity_code: commodityCode,
    generated_at: new Date().toISOString(),
    source_policy: {
      google_routes: getGoogleRoutesConfig(),
      route_cost_capacity: {
        status: 'forecast',
        reason: 'Belum ada koneksi API operator logistik/cargo untuk biaya dan kapasitas real-time.',
      },
      stock_balance: {
        status: 'forecast',
        reason: 'Prototype memakai tabel supply_demand; production membutuhkan feed stok gudang resmi.',
      },
    },
    summary: {
      total_routes: recommendations.length,
      recommended_routes: recommendations.filter((item) => item.recommendation.recommended_volume_ton > 0).length,
      real_time_route_metrics: recommendations.filter((item) => item.route_metric.source_type === 'real-time').length,
      forecast_route_metrics: recommendations.filter((item) => item.route_metric.source_type === 'forecast').length,
      unavailable_google_metrics: recommendations.filter((item) => item.google?.status === 'unavailable').length,
      top_destination_deficit_ton: Math.round(Math.max(...deficits, 0)),
      google_maps_configured: Boolean(process.env.GOOGLE_MAPS_API_KEY),
    },
    expected_production_data: EXPECTED_LOGISTICS_FIELDS,
    recommendations,
  };
}
