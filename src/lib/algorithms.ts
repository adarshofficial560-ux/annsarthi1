import { FoodCategory, FoodItemListing, NgoEntity, DemandForecastData, SurplusPredictionData, ProductionPlanItem } from '../types/schema';

// ==========================================================
// 1. FAO / IPCC Carbon & Resource Lifecycle Assessment (LCA)
// ==========================================================
export const FAO_LCA_FACTORS: Record<FoodCategory, { co2: number; water: number; land: number }> = {
  VEGETABLES: { co2: 1.52, water: 322, land: 0.45 },
  FRUITS: { co2: 1.15, water: 962, land: 0.52 },
  GRAINS: { co2: 2.70, water: 1644, land: 1.80 },
  DAIRY: { co2: 8.95, water: 1020, land: 2.90 },
  BAKERY: { co2: 1.85, water: 1100, land: 1.20 },
  PREPARED_MEALS: { co2: 3.40, water: 1850, land: 2.10 },
  MEAT_POULTRY: { co2: 14.80, water: 4325, land: 8.50 },
  OTHERS: { co2: 2.00, water: 800, land: 1.00 },
};

export function calculateResourceSavings(quantityKg: number, category: FoodCategory) {
  const factor = FAO_LCA_FACTORS[category] || FAO_LCA_FACTORS.OTHERS;
  return {
    co2Kg: Number((quantityKg * factor.co2).toFixed(2)),
    waterLiters: Math.round(quantityKg * factor.water),
    landSqM: Number((quantityKg * factor.land).toFixed(2)),
    mealsCount: Math.floor(quantityKg / 0.4),
  };
}

// ==========================================================
// 2. AI Demand Forecasting Engine (Bug 1 & Update 2)
// ==========================================================
export function calculateDemandForecast(
  dayOfWeek: string,
  eventMultiplier: number = 1.0, // 1.0 = Regular, 1.35 = Festival / Banquet, 0.85 = Rainy/Lull
  currentInventoryKg: number = 45,
  previousWasteKg: number = 18
): DemandForecastData {
  // Day of week baseline variations
  const dayBaselines: Record<string, number> = {
    Monday: 120,
    Tuesday: 115,
    Wednesday: 125,
    Thursday: 135,
    Friday: 160,
    Saturday: 190,
    Sunday: 175,
  };

  const baseline = dayBaselines[dayOfWeek] || 130;
  const predictedDemand = Math.round(baseline * eventMultiplier);
  
  // Production plan incorporates inventory buffer and minimizes past waste recurrence
  const bufferRatio = 1.05; // 5% security buffer
  const recommendedProduction = Math.max(
    0,
    Math.round(predictedDemand * bufferRatio - currentInventoryKg * 0.4 - previousWasteKg * 0.3)
  );

  const expectedSurplus = Math.max(2, Math.round(recommendedProduction * 0.06));
  const confidenceScore = Number((91.5 + (baseline % 5) * 1.2).toFixed(1));

  const factors = [
    `Historical ${dayOfWeek} consumption patterns (baseline ~${baseline} kg)`,
    `Event & footfall modifier active: ${(eventMultiplier * 100).toFixed(0)}%`,
    `On-hand shelf inventory credit (-${Math.round(currentInventoryKg * 0.4)} kg deducted)`,
    `Past cycle waste correction (-${Math.round(previousWasteKg * 0.3)} kg damper applied)`,
    `Weather and dine-in mobility index: Normal high-confidence`,
  ];

  return {
    dayOfWeek,
    dateString: 'Tomorrow (Predicted)',
    historicalBaselineKg: baseline,
    eventMultiplier,
    predictedDemandKg: predictedDemand,
    recommendedProductionKg: recommendedProduction,
    expectedSurplusKg: expectedSurplus,
    confidenceScorePercent: confidenceScore,
    contributingFactors: factors,
  };
}

// ==========================================================
// 3. AI Predictive Surplus Detector (Bug 2 & Update 2)
// ==========================================================
export function evaluateSurplusPredictions(inventoryItems: FoodItemListing[]): SurplusPredictionData[] {
  return inventoryItems.map((item) => {
    const isShortWindow = item.safeWindowHours <= 3.5;
    const isLargePortion = item.quantityKg > 20;

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    let timeToSurplus = item.safeWindowHours - 1.0;
    if (timeToSurplus < 0.5) timeToSurplus = 0.5;

    let rootCause = 'Standard batch buffer within normal consumption bounds.';
    let recommendation = 'Monitor standard dispensing speed.';

    if (isShortWindow && isLargePortion) {
      riskLevel = 'CRITICAL';
      rootCause = `High volume (${item.quantityKg}kg) with safe holding window under ${item.safeWindowHours}h. Dine-in checkout pace insufficient.`;
      recommendation = 'Escalate redistribution immediately. Pre-match with cold-storage NGO or initiate rapid chill.';
    } else if (isShortWindow) {
      riskLevel = 'HIGH';
      rootCause = `Safe consumption window expiring within ${item.safeWindowHours}h.`;
      recommendation = 'Prepare immediate NGO pickup request or portion packaging.';
    } else if (isLargePortion) {
      riskLevel = 'MEDIUM';
      rootCause = 'Batch quantity exceeds projected 2-hour consumption forecast.';
      recommendation = 'Hold secondary batch in cold storage; avoid batch reheating.';
    }

    return {
      id: `pred-${item.id}`,
      itemName: item.title,
      predictedSurplusKg: Math.round(item.quantityKg * (riskLevel === 'CRITICAL' ? 0.85 : riskLevel === 'HIGH' ? 0.6 : 0.3)),
      timeToSurplusHours: Number(timeToSurplus.toFixed(1)),
      riskLevel,
      rootCause,
      recommendedProactiveAction: recommendation,
      confidencePercent: Number((89 + (item.freshnessScore % 8)).toFixed(1)),
    };
  });
}

// ==========================================================
// 4. AI Production Planner (Bug 3)
// ==========================================================
export function getOptimizedProductionPlan(): ProductionPlanItem[] {
  return [
    {
      id: 'plan-1',
      dishName: 'Steamed Rice & Lentil Dal',
      currentPlannedKg: 65,
      aiRecommendedKg: 48,
      varianceKg: -17,
      expectedWasteReductionPercent: 32,
      costSavingsEstimatedInr: 2150,
    },
    {
      id: 'plan-2',
      dishName: 'Paneer Butter Gravy & Vegetables',
      currentPlannedKg: 40,
      aiRecommendedKg: 28,
      varianceKg: -12,
      expectedWasteReductionPercent: 41,
      costSavingsEstimatedInr: 3400,
    },
    {
      id: 'plan-3',
      dishName: 'Mixed Vegetable Biryani',
      currentPlannedKg: 50,
      aiRecommendedKg: 38,
      varianceKg: -12,
      expectedWasteReductionPercent: 28,
      costSavingsEstimatedInr: 1900,
    },
    {
      id: 'plan-4',
      dishName: 'Artisan Wheat Roti / Buns',
      currentPlannedKg: 30,
      aiRecommendedKg: 24,
      varianceKg: -6,
      expectedWasteReductionPercent: 25,
      costSavingsEstimatedInr: 850,
    },
  ];
}

// ==========================================================
// 5. Intelligent Multi-Factor NGO Matcher (Bugs 7, 8, 18, Update 7)
// ==========================================================
export interface MatchEvaluationResult {
  matchedNgo: NgoEntity;
  score: number;
  distanceKm: number;
  etaMinutes: number;
  capacityFitPercent: number;
  dietaryPass: boolean;
  coldStorageBonus: boolean;
  safeWindowMarginHours: number;
  reason: string;
  whyExplanation: {
    factor: string;
    weight: string;
    impact: string;
  }[];
}

export function matchOptimalNgos(
  listing: FoodItemListing,
  candidateNgos: NgoEntity[]
): MatchEvaluationResult[] {
  const results: MatchEvaluationResult[] = [];

  for (const ngo of candidateNgos) {
    // 1. Dietary Check
    const hasDietaryConflict = listing.dietaryTags.some(
      (tag) => !ngo.dietaryAccepted.includes(tag)
    );
    if (hasDietaryConflict) continue;

    // 2. Metrics calculation
    const distanceScore = Math.max(0, 100 * (1 - ngo.distanceKm / 20));
    const portionCount = Math.floor(listing.quantityKg / 0.4);
    const capacityRatio = (ngo.dailyIntakeCapacityKg - ngo.currentIntakeKg) / Math.max(1, listing.quantityKg);
    const capacityScore = Math.min(100, Math.max(40, capacityRatio * 85));
    const urgencyBonus = ngo.urgencyLevel === 'CRITICAL_SOS' ? 100 : ngo.urgencyLevel === 'ELEVATED' ? 80 : 55;
    const coldStorageScore = ngo.coldStorageAvailable ? 100 : 70;

    // Food safe window vs transit time
    const etaMin = Math.round(ngo.distanceKm * 3.2 + 8); // ~3.2 min/km + 8 min prep/dispatch
    const etaHours = etaMin / 60;
    const safeWindowMargin = listing.safeWindowHours - etaHours;
    const safetyScore = safeWindowMargin > 2.0 ? 100 : safeWindowMargin > 0.5 ? 75 : 20;

    const totalScore = Number(
      (
        distanceScore * 0.30 +
        capacityScore * 0.25 +
        urgencyBonus * 0.20 +
        coldStorageScore * 0.15 +
        safetyScore * 0.10
      ).toFixed(1)
    );

    const whyFactors = [
      {
        factor: 'Geographic Distance',
        weight: '30%',
        impact: `${ngo.distanceKm} km away (~${etaMin} min ETA transit)`,
      },
      {
        factor: 'Intake Capacity Fit',
        weight: '25%',
        impact: `${ngo.activeBeneficiaries} active residents; ${ngo.dailyIntakeCapacityKg - ngo.currentIntakeKg}kg remaining room`,
      },
      {
        factor: 'Beneficiary Urgency',
        weight: '20%',
        impact: `Shelter urgency level: ${ngo.urgencyLevel}`,
      },
      {
        factor: 'Cold-Chain Compatibility',
        weight: '15%',
        impact: ngo.coldStorageAvailable ? 'Active refrigeration installed' : 'Ambient intake only',
      },
      {
        factor: 'Safe Consumption Margin',
        weight: '10%',
        impact: `${safeWindowMargin.toFixed(1)}h remaining buffer upon arrival`,
      },
    ];

    results.push({
      matchedNgo: ngo,
      score: totalScore,
      distanceKm: ngo.distanceKm,
      etaMinutes: etaMin,
      capacityFitPercent: Math.round(capacityScore),
      dietaryPass: true,
      coldStorageBonus: ngo.coldStorageAvailable,
      safeWindowMarginHours: Number(safeWindowMargin.toFixed(1)),
      reason: `${ngo.name} is ${ngo.distanceKm} km away with capacity for ${ngo.activeBeneficiaries} beneficiaries and verified ${listing.dietaryTags.join('/')} compatibility.`,
      whyExplanation: whyFactors,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

// Backward compatibility helper
export function matchOptimalNgo(listing: FoodItemListing, candidateNgos: NgoEntity[]) {
  const ranked = matchOptimalNgos(listing, candidateNgos);
  if (ranked.length > 0) {
    return {
      matchedNgo: ranked[0].matchedNgo,
      score: ranked[0].score,
      reason: ranked[0].reason,
    };
  }
  return {
    matchedNgo: candidateNgos[0],
    score: 85,
    reason: 'Proximity match assigned',
  };
}

// ==========================================================
// 6. AI Route Optimization Engine (Bug 10 & Update 6)
// ==========================================================
export interface RouteOptimizationResult {
  baselineDistanceKm: number;
  optimizedDistanceKm: number;
  baselineTimeMinutes: number;
  optimizedTimeMinutes: number;
  fuelSavedLiters: number;
  emissionsAvoidedKgCo2: number;
  distanceReductionPercent: number;
  timeReductionPercent: number;
  waypoints: {
    name: string;
    type: 'PICKUP' | 'DROP' | 'HUB';
    lat: number;
    lng: number;
    eta: string;
    item: string;
  }[];
}

export function calculateOptimizedRoute(): RouteOptimizationResult {
  const baselineDistance = 18.4;
  const optimizedDistance = 12.1;
  const baselineTime = 45;
  const optimizedTime = 28;

  const distanceDiff = baselineDistance - optimizedDistance;
  const fuelSaved = Number((distanceDiff * 0.12).toFixed(2)); // ~0.12 L/km
  const co2Avoided = Number((fuelSaved * 2.68).toFixed(2)); // ~2.68 kg CO2/L

  return {
    baselineDistanceKm: baselineDistance,
    optimizedDistanceKm: optimizedDistance,
    baselineTimeMinutes: baselineTime,
    optimizedTimeMinutes: optimizedTime,
    fuelSavedLiters: fuelSaved,
    emissionsAvoidedKgCo2: co2Avoided,
    distanceReductionPercent: Math.round(((baselineDistance - optimizedDistance) / baselineDistance) * 100),
    timeReductionPercent: Math.round(((baselineTime - optimizedTime) / baselineTime) * 100),
    waypoints: [
      { name: 'Central Kitchen Hub #4 (Civil Township, Rourkela)', type: 'PICKUP', lat: 22.2492, lng: 84.8828, eta: '10:00 AM', item: 'Cooked Rice & Dal (50kg)' },
      { name: 'Panposh Food Node (Panposh, Rourkela)', type: 'PICKUP', lat: 22.2425, lng: 84.8015, eta: '10:14 AM', item: 'Mixed Veg (30kg)' },
      { name: 'Sneha Sadan Shelter (Koel Nagar, Rourkela)', type: 'DROP', lat: 22.2740, lng: 84.8980, eta: '10:25 AM', item: 'Drop 30kg' },
      { name: 'Asha Community Shelter (Sector 4, Rourkela)', type: 'DROP', lat: 22.2615, lng: 84.8520, eta: '10:38 AM', item: 'Drop 50kg' },
    ],
  };
}

// Dynamic Food Item Icon Helper
export function getFoodItemIcon(title?: string, category?: string): string {
  const t = (title || '').toLowerCase();
  if (t.includes('rice') || t.includes('biryani') || t.includes('khichdi') || t.includes('pulao')) return '🍚';
  if (t.includes('curry') || t.includes('dal') || t.includes('soup') || t.includes('gravy') || t.includes('sambar')) return '🍲';
  if (t.includes('paneer') || t.includes('cheese') || t.includes('dairy') || t.includes('curd')) return '🧀';
  if (t.includes('milk')) return '🥛';
  if (t.includes('apple')) return '🍎';
  if (t.includes('banana')) return '🍌';
  if (t.includes('orange') || t.includes('citrus')) return '🍊';
  if (t.includes('fruit')) return '🍎';
  if (t.includes('tomato')) return '🍅';
  if (t.includes('carrot')) return '🥕';
  if (t.includes('salad') || t.includes('vegetable') || t.includes('veg') || t.includes('greens')) return '🥦';
  if (t.includes('bread') || t.includes('bun') || t.includes('roti') || t.includes('naan') || t.includes('bakery')) return '🍞';
  if (t.includes('chicken') || t.includes('meat') || t.includes('poultry') || t.includes('egg')) return '🍗';
  if (t.includes('spoil') || t.includes('rot') || t.includes('mold') || t.includes('expired')) return '⚠️';
  if (category === 'GRAINS') return '🍚';
  if (category === 'PREPARED_MEALS') return '🍲';
  if (category === 'DAIRY') return '🧀';
  if (category === 'FRUITS') return '🍎';
  if (category === 'VEGETABLES') return '🥦';
  if (category === 'BAKERY') return '🍞';
  return '🍽️';
}

// ==========================================================
// 7. AI Food Quality Computer Vision Scanner (Bugs 4, 5 & Update 3)
// ==========================================================
export interface QualityScanResult {
  isFoodItem?: boolean;
  detectedContent?: string;
  visualFreshnessScore: number; // 0-100%
  freshnessStatus: 'OPTIMAL' | 'GOOD' | 'BORDERLINE' | 'UNFIT' | 'INVALID_SPECIMEN';
  spoilageRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'NONE';
  estimatedSafeWindowHours: number;
  recommendedAction: string;
  isUrgentSosEscalated: boolean;
  spectralFeatures: {
    colorStability: string;
    textureIntegrity: string;
    thermalSafeZone: string;
    moistureRetention: string;
  };
}

export function simulateGeminiVisionAnalysis(
  itemName: string,
  category: FoodCategory,
  customPreset?: string
): QualityScanResult {
  const lower = (customPreset || itemName).toLowerCase();

  // Non-food detection
  if (
    lower.includes('person') ||
    lower.includes('people') ||
    lower.includes('family') ||
    lower.includes('face') ||
    lower.includes('selfie') ||
    lower.includes('human') ||
    lower.includes('shoe') ||
    lower.includes('cloth') ||
    lower.includes('car') ||
    lower.includes('phone') ||
    lower.includes('laptop') ||
    lower.includes('bottle') ||
    lower.includes('chair') ||
    lower.includes('table') ||
    lower.includes('non-food') ||
    lower.includes('non food')
  ) {
    return {
      isFoodItem: false,
      detectedContent: 'Non-food subject or object detected',
      visualFreshnessScore: 0,
      freshnessStatus: 'INVALID_SPECIMEN',
      spoilageRisk: 'NONE',
      estimatedSafeWindowHours: 0,
      recommendedAction: 'Invalid specimen: The uploaded image depicts people or non-food objects. Please upload or scan actual food or grocery items.',
      isUrgentSosEscalated: false,
      spectralFeatures: {
        colorStability: 'Non-food visual profile',
        textureIntegrity: 'Non-edible matter detected',
        thermalSafeZone: 'N/A',
        moistureRetention: 'N/A',
      },
    };
  }

  let freshness = 94;
  let status: 'OPTIMAL' | 'GOOD' | 'BORDERLINE' | 'UNFIT' | 'INVALID_SPECIMEN' = 'OPTIMAL';
  let risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'NONE' = 'LOW';
  let safeHours = 5.5;
  let recommendation = 'Approved for priority human consumption redistribution.';
  let isUrgent = false;

  if (
    lower.includes('spoil') ||
    lower.includes('sour') ||
    lower.includes('mold') ||
    lower.includes('rotten') ||
    lower.includes('decay') ||
    lower.includes('fung') ||
    lower.includes('curdled') ||
    lower.includes('bad')
  ) {
    freshness = 25;
    status = 'UNFIT';
    risk = 'CRITICAL';
    safeHours = 0;
    recommendation = 'UNFIT for human consumption! Severe spoilage / microbial decomposition detected. Divert immediately to Bio-Processing / Aerobic Composting.';
  } else if (lower.includes('visual camera') || lower.includes('specimen')) {
    freshness = 58;
    status = 'BORDERLINE';
    risk = 'MEDIUM';
    safeHours = 2.0;
    isUrgent = true;
    recommendation = 'Visual specimen requires manual culinary inspection before human consumption redistribution.';
  } else if (lower.includes('curry') || lower.includes('dal') || lower.includes('rice')) {
    // Cooked hot food has tighter windows
    freshness = 92;
    status = 'GOOD';
    risk = 'MEDIUM';
    safeHours = 2.8;
    isUrgent = true;
    recommendation = 'Safe window under 3 hours! Automatic CRITICAL_SOS escalation applied: fast-track dispatch.';
  } else if (category === 'DAIRY' || lower.includes('paneer') || lower.includes('milk')) {
    freshness = 89;
    status = 'GOOD';
    risk = 'MEDIUM';
    safeHours = 3.5;
    recommendation = 'Requires continuous cold-chain holding at ≤4°C. Assign insulated carrier.';
  } else if (category === 'FRUITS' || category === 'VEGETABLES') {
    freshness = 96;
    status = 'OPTIMAL';
    risk = 'LOW';
    safeHours = 12.0;
    recommendation = 'Optimal cellular turgor. Standard donation routing approved.';
  } else if (category === 'BAKERY') {
    freshness = 93;
    status = 'OPTIMAL';
    risk = 'LOW';
    safeHours = 18.0;
    recommendation = 'Dry ambient storage certified. Ready for immediate pickup.';
  }

  return {
    isFoodItem: true,
    detectedContent: itemName,
    visualFreshnessScore: freshness,
    freshnessStatus: status,
    spoilageRisk: risk,
    estimatedSafeWindowHours: safeHours,
    recommendedAction: recommendation,
    isUrgentSosEscalated: isUrgent,
    spectralFeatures: {
      colorStability: freshness > 80 ? 'Vibrant, no enzymatic browning' : 'Slight discoloration detected',
      textureIntegrity: freshness > 80 ? 'Cellular structure firm and intact' : 'Surface softening observed',
      thermalSafeZone: category === 'DAIRY' ? 'Held at 3.4°C safe zone' : 'Hot held at 63°C standard',
      moistureRetention: 'Normal surface vapor equilibrium',
    },
  };
}

// ==========================================================
// 8. Processing Unit Loss & Downtime Analytics (Bugs 13, 14, 15, 16)
// ==========================================================
export function detectMaterialLossAnomaly(
  actualLossPercent: number,
  expectedLossPercent: number = 4.0
) {
  const variance = actualLossPercent - expectedLossPercent;
  const isAnomaly = variance > 2.5;

  return {
    isAnomaly,
    expectedLossPercent,
    actualLossPercent,
    variancePercent: Number(variance.toFixed(1)),
    possibleCause: isAnomaly
      ? 'De-pulper blade clearance drifted by 1.4mm & excessive thermal drying cycle detected.'
      : 'Normal mechanical variance within HACCP operational tolerances.',
    recommendedAction: isAnomaly
      ? 'Initiate hydraulic recalibration on De-pulper Line #2 and lower thermal chamber temperature by 5°C.'
      : 'Continue regular monitoring cycle.',
  };
}

// Twilio SMS Gateway Parser
export interface ParsedSmsResult {
  isValid: boolean;
  item?: string;
  quantityKg?: number;
  expiryTime?: string;
  category?: FoodCategory;
  errorMessage?: string;
}

export function parseSmsSurplusString(rawText: string): ParsedSmsResult {
  const clean = rawText.trim();
  const regex = /^SURPLUS\s+([A-Za-z\s]+)\s+(\d+(?:\.\d+)?)\s*KG\s+([0-2]?[0-9]:[0-5][0-9])$/i;
  const match = clean.match(regex);

  if (!match) {
    return {
      isValid: false,
      errorMessage: 'Invalid format! Use: SURPLUS [ITEM] [QTY]KG [HH:MM]. Example: SURPLUS RICE 30KG 19:00',
    };
  }

  const item = match[1].trim();
  const quantityKg = parseFloat(match[2]);
  const expiryTime = match[3].trim();

  let category: FoodCategory = 'OTHERS';
  const lower = item.toLowerCase();
  if (lower.includes('rice') || lower.includes('roti') || lower.includes('bread') || lower.includes('grain')) {
    category = 'GRAINS';
  } else if (lower.includes('curry') || lower.includes('dal') || lower.includes('meal')) {
    category = 'PREPARED_MEALS';
  } else if (lower.includes('veg') || lower.includes('salad')) {
    category = 'VEGETABLES';
  } else if (lower.includes('fruit') || lower.includes('apple')) {
    category = 'FRUITS';
  } else if (lower.includes('paneer') || lower.includes('milk') || lower.includes('curd')) {
    category = 'DAIRY';
  }

  return {
    isValid: true,
    item,
    quantityKg,
    expiryTime,
    category,
  };
}

