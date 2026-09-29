export type UserRole = 'ADMIN' | 'KITCHEN' | 'NGO' | 'PROCESSING_UNIT' | 'LOGISTICS_PARTNER';

export type FoodCategory = 
  | 'VEGETABLES' 
  | 'FRUITS' 
  | 'GRAINS' 
  | 'DAIRY' 
  | 'BAKERY' 
  | 'PREPARED_MEALS' 
  | 'MEAT_POULTRY' 
  | 'OTHERS';

export type DietaryTag = 'VEGETARIAN' | 'VEGAN' | 'NON_VEGETARIAN' | 'JAIN' | 'HALAL';

export type FoodLifecycleStage = 
  | 'CREATED'
  | 'QUALITY_CHECKED'
  | 'AVAILABLE'
  | 'MATCHED'
  | 'PICKUP_ASSIGNED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'IMPACT_RECORDED'
  | 'DIVERTED_PROCESSING'
  | 'DIVERTED_COMPOST';

export type SpoilageRisk = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type PackagingType = 'INSULATED_BOXES' | 'BULK_CONTAINERS' | 'VACUUM_SEALED' | 'STANDARD_TRAYS';
export type StorageCondition = 'REFRIGERATED' | 'DEEP_FREEZE' | 'AMBIENT_DRY' | 'HOT_HELD';
export type RecoveryRoute = 'DONATION' | 'FOOD_PROCESSING' | 'COMPOSTING' | 'ANIMAL_FEED' | 'BIOGAS';

export interface FoodItemListing {
  id: string;
  title: string;
  category: FoodCategory;
  dietaryTags: DietaryTag[];
  quantityKg: number;
  expiryString: string;
  sourceHub: string;
  status: 'AVAILABLE' | 'MATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'EXPIRED' | 'DIVERTED';
  lifecycleStage: FoodLifecycleStage;
  matchedNgoName?: string;
  matchedNgoId?: string;
  freshnessScore: number;
  preparationTime: string;
  createdAt: string;
  spoilageRisk: SpoilageRisk;
  safeWindowHours: number;
  packagingType: PackagingType;
  storageCondition: StorageCondition;
  recoveryRoute: RecoveryRoute;
  urgency: 'NORMAL' | 'ELEVATED' | 'CRITICAL_SOS';
  aiRecommendationReason?: string;
  imageThumbnail?: string;
}

export interface NgoEntity {
  id: string;
  name: string;
  activeBeneficiaries: number;
  coldStorageAvailable: boolean;
  distanceKm: number;
  urgencyLevel: 'NORMAL' | 'ELEVATED' | 'CRITICAL_SOS';
  dietaryAccepted: DietaryTag[];
  shelterType: string;
  lat: number;
  lng: number;
  contactPerson: string;
  phone: string;
  dailyIntakeCapacityKg: number;
  currentIntakeKg: number;
}

export interface UpcomingPickup {
  id: string;
  hubName: string;
  quantityKg: number;
  scheduledTime: string;
  driverName: string;
  vehicleType: string;
  status: 'CONFIRMED' | 'IN_TRANSIT' | 'SCHEDULED' | 'DELIVERED';
  tempCelsius: number;
  lat: number;
  lng: number;
  targetNgoName: string;
  etaMinutes: number;
  optimizedRouteDistanceKm: number;
  baselineDistanceKm: number;
  doorSensorStatus: 'SEALED' | 'OPEN_ALERT';
}

export interface GlobalImpactStats {
  totalFoodSavedKg: number;
  foodProcessedKg: number;
  foodCompostedKg: number;
  activePartners: number;
  co2SavedTons: number;
  totalBeneficiaries: number;
  waterPreservedLiters: number;
  arableLandPreservedSqM: number;
  landfillDiversionRatePercent: number;
}

// AI Demand & Production Planning
export interface DemandForecastData {
  dayOfWeek: string;
  dateString: string;
  historicalBaselineKg: number;
  eventMultiplier: number;
  predictedDemandKg: number;
  recommendedProductionKg: number;
  expectedSurplusKg: number;
  confidenceScorePercent: number;
  contributingFactors: string[];
}

export interface SurplusPredictionData {
  id: string;
  itemName: string;
  predictedSurplusKg: number;
  timeToSurplusHours: number;
  riskLevel: SpoilageRisk;
  rootCause: string;
  recommendedProactiveAction: string;
  confidencePercent: number;
}

export interface ProductionPlanItem {
  id: string;
  dishName: string;
  currentPlannedKg: number;
  aiRecommendedKg: number;
  varianceKg: number;
  expectedWasteReductionPercent: number;
  costSavingsEstimatedInr: number;
}

// IoT Cold-Chain & Storage Telemetry
export interface IotSensorTelemetry {
  id: string;
  unitName: string;
  location: string;
  temperatureCelsius: number;
  targetMinTemp: number;
  targetMaxTemp: number;
  humidityPercent: number;
  doorStatus: 'CLOSED' | 'OPEN';
  doorOpenDurationMinutes: number;
  sensorHealth: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  batteryPercent: number;
  lastUpdated: string;
}

// Processing Unit Dashboard
export interface ProcessingUnitStats {
  unitId: string;
  unitName: string;
  productionThroughputKg: number;
  rawMaterialUsedKg: number;
  expectedLossPercent: number;
  actualLossPercent: number;
  overallEquipmentEfficiencyPercent: number; // OEE
  energyConsumptionKwh: number;
  energyOptimizationSavingsPercent: number;
  activeMachines: {
    name: string;
    type: string;
    status: 'RUNNING' | 'MAINTENANCE_REQUIRED' | 'IDLE';
    downtimeMinutesLast24h: number;
    vibrationAnomalyScore: number;
    recommendedMaintenance: string;
  }[];
}

// Action & Incident Queue
export interface ActionQueueItem {
  id: string;
  title: string;
  category: 'FOOD_RISK' | 'TEMPERATURE' | 'SURPLUS' | 'PROCESSING_LOSS' | 'MACHINE' | 'REDISTRIBUTION';
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  suggestedAction: string;
  timestamp: string;
  source: string;
}

// Audit & Activity Log
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  details: string;
  hash: string;
}

// Auth User Profile
export interface AuthUser {
  username: string;
  displayName: string;
  role: UserRole;
  organization: string;
  hubLocation: string;
}
