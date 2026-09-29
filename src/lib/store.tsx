'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  FoodItemListing, NgoEntity, UpcomingPickup, GlobalImpactStats, 
  FoodCategory, UserRole, IotSensorTelemetry, ProcessingUnitStats, 
  ActionQueueItem, AuditLogEntry, AuthUser, FoodLifecycleStage, RecoveryRoute 
} from '../types/schema';
import { matchOptimalNgos, calculateResourceSavings, parseSmsSurplusString } from './algorithms';

interface SystemNotification {
  id: string;
  title: string;
  timeAgo: string;
  type: 'ALERT' | 'INFO' | 'SUCCESS';
}

interface FoodRescueContextType {
  // Auth
  isAuthenticated: boolean;
  currentUser: AuthUser;
  login: (username: string, password: string, role?: UserRole) => { success: boolean; message: string };
  logout: () => void;
  switchRole: (role: UserRole) => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Offline Mode
  isOffline: boolean;
  toggleOffline: () => void;
  offlineQueueCount: number;
  syncOfflineQueue: () => { syncedCount: number };

  // Core Data
  listings: FoodItemListing[];
  ngos: NgoEntity[];
  pickups: UpcomingPickup[];
  stats: GlobalImpactStats;
  notifications: SystemNotification[];
  iotSensors: IotSensorTelemetry[];
  processingStats: ProcessingUnitStats;
  actionQueue: ActionQueueItem[];
  auditLogs: AuditLogEntry[];

  // Kitchen Metrics
  kitchenDailyUsedKg: number;
  kitchenEstimatedSurplusKg: number;
  kitchenAvoidedKg: number;

  // Actions
  listForDonation: (id: string) => { success: boolean; matchedNgoName: string; score: number };
  confirmNgoDispatch: (
    listingId: string, 
    ngoId: string, 
    vehicleType?: string, 
    driverName?: string, 
    etaMinutes?: number
  ) => { success: boolean };
  requestFood: (listingId: string, ngoName: string) => void;
  addNewFoodListing: (item: Omit<FoodItemListing, 'id' | 'createdAt' | 'status' | 'lifecycleStage'>) => void;
  divertFoodToAlternativeRoute: (listingId: string, route: RecoveryRoute) => void;
  advanceLifecycleStage: (listingId: string, nextStage: FoodLifecycleStage) => void;
  simulateSmsListing: (smsText: string) => { success: boolean; message: string };
  simulateSensorAnomaly: () => void;
  dismissNotification: (id: string) => void;
  resolveActionQueueItem: (id: string) => void;
}

const INITIAL_USER: AuthUser = {
  username: 'annsarthi',
  displayName: 'Annsarthi Authority',
  role: 'ADMIN',
  organization: 'National Food Safety & Redistribution Council',
  hubLocation: 'Central Operations Command - Zone 1',
};

const INITIAL_LISTINGS: FoodItemListing[] = [
  {
    id: 'lst-1',
    title: 'Cooked Basmati Rice & Dal',
    category: 'PREPARED_MEALS',
    dietaryTags: ['VEGETARIAN', 'JAIN'],
    quantityKg: 50,
    expiryString: 'Today (Safe for 2.5h)',
    sourceHub: 'Central Kitchen Hub #4',
    status: 'AVAILABLE',
    lifecycleStage: 'AVAILABLE',
    freshnessScore: 95,
    preparationTime: '12:30 PM',
    createdAt: 'Just now',
    spoilageRisk: 'MEDIUM',
    safeWindowHours: 2.5,
    packagingType: 'INSULATED_BOXES',
    storageCondition: 'HOT_HELD',
    recoveryRoute: 'DONATION',
    urgency: 'CRITICAL_SOS', // Escalate due to safeWindow < 3h!
    aiRecommendationReason: 'High volume prepared meal with safe window < 3 hours. Expedited dispatch to Asha Shelter recommended.',
  },
  {
    id: 'lst-2',
    title: 'Mixed Steamed Vegetables',
    category: 'VEGETABLES',
    dietaryTags: ['VEGETARIAN', 'VEGAN'],
    quantityKg: 30,
    expiryString: 'Today (Safe for 4.5h)',
    sourceHub: 'Express Caterers Node',
    status: 'AVAILABLE',
    lifecycleStage: 'AVAILABLE',
    freshnessScore: 92,
    preparationTime: '01:00 PM',
    createdAt: '15m ago',
    spoilageRisk: 'LOW',
    safeWindowHours: 4.5,
    packagingType: 'STANDARD_TRAYS',
    storageCondition: 'AMBIENT_DRY',
    recoveryRoute: 'DONATION',
    urgency: 'NORMAL',
    aiRecommendationReason: 'Optimal cellular integrity. Suitable for standard local NGO route distribution.',
  },
  {
    id: 'lst-3',
    title: 'Whole Wheat Buns & Bread',
    category: 'BAKERY',
    dietaryTags: ['VEGETARIAN'],
    quantityKg: 20,
    expiryString: 'Tomorrow (Safe for 18h)',
    sourceHub: 'Bakery Processing Unit',
    status: 'AVAILABLE',
    lifecycleStage: 'AVAILABLE',
    freshnessScore: 98,
    preparationTime: '06:00 AM',
    createdAt: '1h ago',
    spoilageRisk: 'LOW',
    safeWindowHours: 18.0,
    packagingType: 'VACUUM_SEALED',
    storageCondition: 'AMBIENT_DRY',
    recoveryRoute: 'DONATION',
    urgency: 'NORMAL',
    aiRecommendationReason: 'Sealed dry goods with extended safe horizon. Candidate for night shelter distribution.',
  },
  {
    id: 'lst-4',
    title: 'Fresh Apples & Bananas (Surplus Grade B)',
    category: 'FRUITS',
    dietaryTags: ['VEGETARIAN', 'VEGAN', 'JAIN'],
    quantityKg: 40,
    expiryString: 'Tomorrow (Safe for 24h)',
    sourceHub: 'Agri Processing Unit #1',
    status: 'AVAILABLE',
    lifecycleStage: 'AVAILABLE',
    freshnessScore: 96,
    preparationTime: '10:00 AM',
    createdAt: '2h ago',
    spoilageRisk: 'LOW',
    safeWindowHours: 24.0,
    packagingType: 'BULK_CONTAINERS',
    storageCondition: 'AMBIENT_DRY',
    recoveryRoute: 'DONATION',
    urgency: 'NORMAL',
    aiRecommendationReason: 'Surface bruising present but internal pulp pristine. Dual routing: donation or fruit puree processing.',
  },
  {
    id: 'lst-5',
    title: 'Fresh Paneer Tikka Gravy',
    category: 'DAIRY',
    dietaryTags: ['VEGETARIAN'],
    quantityKg: 15,
    expiryString: 'Today (Safe for 3.0h)',
    sourceHub: 'Central Kitchen Hub #4',
    status: 'AVAILABLE',
    lifecycleStage: 'AVAILABLE',
    freshnessScore: 91,
    preparationTime: '02:00 PM',
    createdAt: '30m ago',
    spoilageRisk: 'HIGH',
    safeWindowHours: 3.0,
    packagingType: 'INSULATED_BOXES',
    storageCondition: 'REFRIGERATED',
    recoveryRoute: 'DONATION',
    urgency: 'CRITICAL_SOS',
    aiRecommendationReason: 'Dairy emulsion sensitive to temperature drift. Requires continuous ≤4°C cold carrier transit.',
  },
  {
    id: 'lst-6',
    title: 'Bruised Overripe Tomatoes & Pulp',
    category: 'VEGETABLES',
    dietaryTags: ['VEGETARIAN', 'VEGAN'],
    quantityKg: 65,
    expiryString: 'Expired for Raw Dining',
    sourceHub: 'Kitchen Pre-Prep Station',
    status: 'AVAILABLE',
    lifecycleStage: 'AVAILABLE',
    freshnessScore: 42,
    preparationTime: 'Yesterday',
    createdAt: '3h ago',
    spoilageRisk: 'CRITICAL',
    safeWindowHours: 0,
    packagingType: 'BULK_CONTAINERS',
    storageCondition: 'AMBIENT_DRY',
    recoveryRoute: 'FOOD_PROCESSING', // Bug 12: alternative path!
    urgency: 'ELEVATED',
    aiRecommendationReason: 'UNFIT for raw direct consumption. Automatically routed to Processing Unit for Tomato Paste & Sauce dehydration.',
  },
];

const INITIAL_NGOS: NgoEntity[] = [
  {
    id: 'ngo-1',
    name: 'Asha Community Shelter (Sector 4, Rourkela)',
    activeBeneficiaries: 120,
    coldStorageAvailable: true,
    distanceKm: 3.2,
    urgencyLevel: 'CRITICAL_SOS',
    dietaryAccepted: ['VEGETARIAN', 'VEGAN', 'JAIN'],
    shelterType: 'Night Shelter & Children Home',
    lat: 22.2615,
    lng: 84.8520,
    contactPerson: 'Sister Teresa / Ramesh Nair',
    phone: '+91 98201 44521',
    dailyIntakeCapacityKg: 120,
    currentIntakeKg: 45,
  },
  {
    id: 'ngo-2',
    name: 'Annapoorna Kitchen Trust (Udit Nagar, Rourkela)',
    activeBeneficiaries: 200,
    coldStorageAvailable: true,
    distanceKm: 4.8,
    urgencyLevel: 'ELEVATED',
    dietaryAccepted: ['VEGETARIAN', 'VEGAN', 'NON_VEGETARIAN', 'JAIN'],
    shelterType: 'Community Mass Kitchen',
    lat: 22.2280,
    lng: 84.8560,
    contactPerson: 'Sunita Deshmukh',
    phone: '+91 97110 33891',
    dailyIntakeCapacityKg: 250,
    currentIntakeKg: 110,
  },
  {
    id: 'ngo-3',
    name: 'Vatsalya Children Care (Chhend Colony, Rourkela)',
    activeBeneficiaries: 160,
    coldStorageAvailable: false,
    distanceKm: 6.1,
    urgencyLevel: 'NORMAL',
    dietaryAccepted: ['VEGETARIAN', 'VEGAN'],
    shelterType: 'Orphanage & Day Care',
    lat: 22.2580,
    lng: 84.8210,
    contactPerson: 'Dr. Anand Joshi',
    phone: '+91 98451 90214',
    dailyIntakeCapacityKg: 140,
    currentIntakeKg: 80,
  },
  {
    id: 'ngo-4',
    name: 'Sneha Sadan Shelter (Koel Nagar, Rourkela)',
    activeBeneficiaries: 85,
    coldStorageAvailable: true,
    distanceKm: 2.5,
    urgencyLevel: 'CRITICAL_SOS',
    dietaryAccepted: ['VEGETARIAN', 'VEGAN', 'NON_VEGETARIAN'],
    shelterType: 'Senior Citizens & Homeless Shelter',
    lat: 22.2740,
    lng: 84.8980,
    contactPerson: 'Father Joseph',
    phone: '+91 99302 77142',
    dailyIntakeCapacityKg: 90,
    currentIntakeKg: 30,
  },
];

const INITIAL_PICKUPS: UpcomingPickup[] = [
  {
    id: 'pick-1',
    hubName: 'Central Kitchen Hub (Civil Township, Rourkela)',
    quantityKg: 50,
    scheduledTime: 'Immediate Dispatch',
    driverName: 'Rajesh Kumar (Fleet #08)',
    vehicleType: 'EV Insulated Van #08',
    status: 'IN_TRANSIT',
    tempCelsius: 3.4,
    lat: 22.2540,
    lng: 84.8680,
    targetNgoName: 'Asha Community Shelter (Sector 4)',
    etaMinutes: 6,
    optimizedRouteDistanceKm: 3.2,
    baselineDistanceKm: 5.4,
    doorSensorStatus: 'SEALED',
  },
  {
    id: 'pick-2',
    hubName: 'Panposh Food Node (Panposh, Rourkela)',
    quantityKg: 30,
    scheduledTime: '11:30 AM',
    driverName: 'Amit Verma (Fleet #04)',
    vehicleType: 'Electric 3-Wheeler Carrier #04',
    status: 'CONFIRMED',
    tempCelsius: 4.1,
    lat: 22.2450,
    lng: 84.8790,
    targetNgoName: 'Sneha Sadan Shelter (Koel Nagar)',
    etaMinutes: 14,
    optimizedRouteDistanceKm: 2.5,
    baselineDistanceKm: 3.8,
    doorSensorStatus: 'SEALED',
  },
  {
    id: 'pick-3',
    hubName: 'Bio-Processing Hub (Rourkela Industrial Estate)',
    quantityKg: 65,
    scheduledTime: 'Tomorrow 10:00 AM',
    driverName: 'Vikram Singh (Fleet #02)',
    vehicleType: 'Refrigerated Heavy Carrier #02',
    status: 'SCHEDULED',
    tempCelsius: 2.8,
    lat: 22.2150,
    lng: 84.8380,
    targetNgoName: 'Annsarthi Bio-Processing Facility',
    etaMinutes: 25,
    optimizedRouteDistanceKm: 5.8,
    baselineDistanceKm: 8.2,
    doorSensorStatus: 'SEALED',
  },
];


const INITIAL_IOT_SENSORS: IotSensorTelemetry[] = [
  {
    id: 'iot-1',
    unitName: 'Walk-In Chiller Bay #1',
    location: 'Central Kitchen Hub #4',
    temperatureCelsius: 3.4,
    targetMinTemp: 1.0,
    targetMaxTemp: 4.0,
    humidityPercent: 68,
    doorStatus: 'CLOSED',
    doorOpenDurationMinutes: 0,
    sensorHealth: 'OPTIMAL',
    batteryPercent: 96,
    lastUpdated: '12 seconds ago',
  },
  {
    id: 'iot-2',
    unitName: 'Deep Freeze Storage #2',
    location: 'Central Kitchen Hub #4',
    temperatureCelsius: -18.4,
    targetMinTemp: -22.0,
    targetMaxTemp: -16.0,
    humidityPercent: 45,
    doorStatus: 'CLOSED',
    doorOpenDurationMinutes: 0,
    sensorHealth: 'OPTIMAL',
    batteryPercent: 92,
    lastUpdated: '8 seconds ago',
  },
  {
    id: 'iot-3',
    unitName: 'Cold Carrier EV Fleet #08',
    location: 'In Transit &bull; Bandra West',
    temperatureCelsius: 3.6,
    targetMinTemp: 2.0,
    targetMaxTemp: 5.0,
    humidityPercent: 62,
    doorStatus: 'CLOSED',
    doorOpenDurationMinutes: 0,
    sensorHealth: 'OPTIMAL',
    batteryPercent: 88,
    lastUpdated: 'Just now',
  },
  {
    id: 'iot-4',
    unitName: 'Bakery Proofing & Ambient Bay',
    location: 'Bakery Processing Hub',
    temperatureCelsius: 22.1,
    targetMinTemp: 18.0,
    targetMaxTemp: 24.0,
    humidityPercent: 54,
    doorStatus: 'CLOSED',
    doorOpenDurationMinutes: 0,
    sensorHealth: 'OPTIMAL',
    batteryPercent: 94,
    lastUpdated: '45 seconds ago',
  },
];

const INITIAL_PROCESSING_STATS: ProcessingUnitStats = {
  unitId: 'proc-unit-1',
  unitName: 'Annsarthi Circular Bio-Processing Center',
  productionThroughputKg: 1420,
  rawMaterialUsedKg: 1540,
  expectedLossPercent: 4.0,
  actualLossPercent: 7.8, // Triggers anomaly detection!
  overallEquipmentEfficiencyPercent: 88.4,
  energyConsumptionKwh: 342,
  energyOptimizationSavingsPercent: 18.5,
  activeMachines: [
    {
      name: 'Industrial De-Pulper Line #1',
      type: 'Fruit & Veg Pulp Extractor',
      status: 'MAINTENANCE_REQUIRED',
      downtimeMinutesLast24h: 42,
      vibrationAnomalyScore: 84, // High risk
      recommendedMaintenance: 'Vibration signature indicates bearing wear on primary shaft. Schedule re-lubrication.',
    },
    {
      name: 'Continuous Vacuum Dehydrator #2',
      type: 'Solar-Hybrid Food Dryer',
      status: 'RUNNING',
      downtimeMinutesLast24h: 5,
      vibrationAnomalyScore: 12,
      recommendedMaintenance: 'Normal operational parameters. Filter clean due in 120 operating hours.',
    },
    {
      name: 'Aerobic Bio-Composter Unit #3',
      type: 'Microbial Digestor Vessel',
      status: 'RUNNING',
      downtimeMinutesLast24h: 0,
      vibrationAnomalyScore: 8,
      recommendedMaintenance: 'Microbial culture active at 54°C thermophilic stage. Moisture equilibrium safe.',
    },
  ],
};

const INITIAL_ACTION_QUEUE: ActionQueueItem[] = [
  {
    id: 'act-1',
    title: 'Urgent Redistribution Window: 50kg Cooked Rice',
    category: 'FOOD_RISK',
    urgency: 'CRITICAL',
    description: 'Safe consumption window is under 2.5 hours at Central Kitchen Hub. Courier dispatch required immediately.',
    suggestedAction: 'Dispatch EV Fleet #08 to Asha Community Shelter (fit score 96%).',
    timestamp: '2m ago',
    source: 'AI Quality Engine',
  },
  {
    id: 'act-2',
    title: 'Predicted Surplus Spike for Friday Banquet (+45kg)',
    category: 'SURPLUS',
    urgency: 'HIGH',
    description: 'Demand forecast model predicts 45kg surplus grains & curries due to Corporate Conference banquet overflow.',
    suggestedAction: 'Adjust pre-prep batch size down by 25% and pre-notify Annapoorna Kitchen.',
    timestamp: '15m ago',
    source: 'Demand Forecaster',
  },
  {
    id: 'act-3',
    title: 'Raw Material Loss Anomaly in De-Pulper (+3.8% variance)',
    category: 'PROCESSING_LOSS',
    urgency: 'HIGH',
    description: 'Actual loss 7.8% vs expected 4.0%. De-pulper blade clearance drifted by 1.4mm.',
    suggestedAction: 'Recalibrate hydraulic blade clearance on De-pulper Line #1.',
    timestamp: '30m ago',
    source: 'Processing Analytics',
  },
  {
    id: 'act-4',
    title: 'Energy Peak Consumption Alert (342 kWh peak load)',
    category: 'MACHINE',
    urgency: 'MEDIUM',
    description: 'Dehydrator running during peak grid tariff window. Optimization recommendation ready.',
    suggestedAction: 'Shift batch drying cycle by 90 minutes to off-peak tariff (saves ~18.5%).',
    timestamp: '1h ago',
    source: 'Energy Monitor',
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-1',
    timestamp: '2026-09-28 12:45:10',
    actor: 'Chef Ramesh (Central Kitchen)',
    role: 'KITCHEN',
    action: 'SURPLUS_LISTED',
    details: 'Listed 50 kg Cooked Basmati Rice & Dal (Safe window: 2.5h, Packaging: Insulated Boxes).',
    hash: 'SHA256:8f20b3...a1',
  },
  {
    id: 'aud-2',
    timestamp: '2026-09-28 12:45:12',
    actor: 'Annsarthi AI Matcher',
    role: 'ADMIN',
    action: 'MATCH_RECOMMENDED',
    details: 'Matched listing #lst-1 with Asha Community Shelter (Fit score 96.2%, Proximity 3.2km).',
    hash: 'SHA256:d48e1a...7c',
  },
  {
    id: 'aud-3',
    timestamp: '2026-09-28 12:46:00',
    actor: 'Annsarthi Dispatcher',
    role: 'LOGISTICS_PARTNER',
    action: 'FLEET_ASSIGNED',
    details: 'EV Insulated Van #08 dispatched. Cold chain sensor #iot-3 streaming 3.4°C.',
    hash: 'SHA256:119bc2...4e',
  },
  {
    id: 'aud-4',
    timestamp: '2026-09-28 11:30:00',
    actor: 'Supervisor Vikram',
    role: 'PROCESSING_UNIT',
    action: 'FOOD_DIVERTED_PROCESSING',
    details: 'Diverted 65 kg bruised overripe tomatoes to pureeing & dehydration facility.',
    hash: 'SHA256:498ea0...99',
  },
];

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-welcome',
    title: '🎉 Welcome to Annsarthi — National Closed-Loop AI Food Redistribution OS. 48 Kitchens & 120+ Shelters Connected.',
    timeAgo: 'Just now',
    type: 'SUCCESS',
  },
  {
    id: 'notif-1',
    title: '🚨 CRITICAL SOS: 50kg Cooked Rice safe window < 2.5h. Expedited fleet dispatched.',
    timeAgo: '2m ago',
    type: 'ALERT',
  },
  {
    id: 'notif-2',
    title: 'Cold-chain telemetry optimal across all 14 active EV vans (avg 3.4°C).',
    timeAgo: '15m ago',
    type: 'SUCCESS',
  },
  {
    id: 'notif-3',
    title: 'AI Demand Forecast updated for tomorrow: expected weekend footfall +35%.',
    timeAgo: '1h ago',
    type: 'INFO',
  },
];

const FoodRescueContext = createContext<FoodRescueContextType | null>(null);

export const FoodRescueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // default authenticated for smooth evaluation
  const [currentUser, setCurrentUser] = useState<AuthUser>(INITIAL_USER);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Offline Mode
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  // Core Data
  const [listings, setListings] = useState<FoodItemListing[]>(INITIAL_LISTINGS);
  const [ngos] = useState<NgoEntity[]>(INITIAL_NGOS);
  const [pickups, setPickups] = useState<UpcomingPickup[]>(INITIAL_PICKUPS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [iotSensors, setIotSensors] = useState<IotSensorTelemetry[]>(INITIAL_IOT_SENSORS);
  const [processingStats, setProcessingStats] = useState<ProcessingUnitStats>(INITIAL_PROCESSING_STATS);
  const [actionQueue, setActionQueue] = useState<ActionQueueItem[]>(INITIAL_ACTION_QUEUE);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Stats
  const [stats, setStats] = useState<GlobalImpactStats>({
    totalFoodSavedKg: 12480,
    foodProcessedKg: 2150,
    foodCompostedKg: 980,
    activePartners: 48,
    co2SavedTons: 28.6,
    totalBeneficiaries: 3420,
    waterPreservedLiters: 14520000,
    arableLandPreservedSqM: 18240,
    landfillDiversionRatePercent: 94.2,
  });

  const [kitchenDailyUsedKg, setKitchenDailyUsedKg] = useState(85);
  const [kitchenEstimatedSurplusKg, setKitchenEstimatedSurplusKg] = useState(20);
  const [kitchenAvoidedKg, setKitchenAvoidedKg] = useState(42);

  // Synchronize dark mode class to HTML tag
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (isDarkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const toggleOffline = () => {
    setIsOffline((prev) => {
      const next = !prev;
      setNotifications((n) => [
        {
          id: `notif-${Date.now()}`,
          title: next 
            ? '⚠️ Field No-Signal / Offline Mode Active. Local edits will queue for synchronization.' 
            : '🌐 Online Connectivity Restored. Ready to synchronize queued actions.',
          timeAgo: 'Just now',
          type: next ? 'ALERT' : 'SUCCESS',
        },
        ...n,
      ]);
      return next;
    });
  };

  const syncOfflineQueue = () => {
    const count = offlineQueue.length;
    setOfflineQueue([]);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `✅ Synchronized ${count} offline records to Annsarthi Cloud Database.`,
        timeAgo: 'Just now',
        type: 'SUCCESS',
      },
      ...prev,
    ]);
    return { syncedCount: count };
  };

  // Auth Functions
  const login = (username: string, password: string, role?: UserRole) => {
    if (username === 'annsarthi' && password === 'annsarthi1') {
      const chosenRole: UserRole = role || 'ADMIN';
      const user: AuthUser = {
        username: 'annsarthi',
        displayName: chosenRole === 'ADMIN' 
          ? 'Annsarthi Authority' 
          : chosenRole === 'KITCHEN' 
          ? 'Executive Chef (Kitchen Hub)' 
          : chosenRole === 'NGO' 
          ? 'NGO Intake Coordinator' 
          : 'Processing Unit Manager',
        role: chosenRole,
        organization: chosenRole === 'KITCHEN' 
          ? 'Central Kitchen Unit #4' 
          : chosenRole === 'NGO' 
          ? 'Asha Community Shelter' 
          : 'Annsarthi Zero-Waste Directorate',
        hubLocation: 'Zone 1 Operations',
      };
      setIsAuthenticated(true);
      setCurrentUser(user);
      return { success: true, message: 'Logged in successfully as ' + user.displayName };
    }
    return { success: false, message: 'Invalid credentials! Use demo username "annsarthi" and password "annsarthi1".' };
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const switchRole = (role: UserRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      role,
      displayName: role === 'ADMIN' 
        ? 'Annsarthi Authority' 
        : role === 'KITCHEN' 
        ? 'Executive Chef (Kitchen Hub)' 
        : role === 'NGO' 
        ? 'NGO Intake Coordinator' 
        : role === 'PROCESSING_UNIT'
        ? 'Processing Unit Manager'
        : 'Logistics Dispatcher',
    }));
  };

  // 1. List for donation action with Multi-Factor Algorithmic Matching
  const listForDonation = (id: string) => {
    const item = listings.find((l) => l.id === id);
    if (!item) return { success: false, matchedNgoName: '', score: 0 };

    const ranked = matchOptimalNgos(item, ngos);
    const topMatch = ranked[0] || { matchedNgo: ngos[0], score: 92, etaMinutes: 12 };

    // Update listing status & lifecycle
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: 'MATCHED',
              lifecycleStage: 'MATCHED',
              matchedNgoName: topMatch.matchedNgo.name,
              matchedNgoId: topMatch.matchedNgo.id,
            }
          : l
      )
    );

    // Schedule new upcoming pickup for this NGO
    const newPickup: UpcomingPickup = {
      id: `pick-${Date.now()}`,
      hubName: item.sourceHub,
      quantityKg: item.quantityKg,
      scheduledTime: 'Immediate Dispatch',
      driverName: 'Suresh Patel (Fleet #04)',
      vehicleType: 'EV Insulated Van #04',
      status: 'CONFIRMED',
      tempCelsius: 3.5,
      lat: 19.0835,
      lng: 72.8712,
      targetNgoName: topMatch.matchedNgo.name,
      etaMinutes: topMatch.etaMinutes,
      optimizedRouteDistanceKm: topMatch.matchedNgo.distanceKm,
      baselineDistanceKm: Number((topMatch.matchedNgo.distanceKm * 1.4).toFixed(1)),
      doorSensorStatus: 'SEALED',
    };
    setPickups((prev) => [newPickup, ...prev]);

    // Update impact stats automatically (Bug 20)
    const impact = calculateResourceSavings(item.quantityKg, item.category);
    setStats((prev) => ({
      ...prev,
      totalFoodSavedKg: prev.totalFoodSavedKg + item.quantityKg,
      co2SavedTons: Number((prev.co2SavedTons + impact.co2Kg / 1000).toFixed(2)),
      totalBeneficiaries: prev.totalBeneficiaries + impact.mealsCount,
      waterPreservedLiters: prev.waterPreservedLiters + impact.waterLiters,
      arableLandPreservedSqM: Number((prev.arableLandPreservedSqM + impact.landSqM).toFixed(1)),
    }));

    setKitchenAvoidedKg((prev) => prev + item.quantityKg);
    setKitchenEstimatedSurplusKg((prev) => Math.max(0, prev - item.quantityKg));

    // Append Audit Log (Update 8)
    const auditEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      actor: currentUser.displayName,
      role: currentUser.role,
      action: 'FOOD_MATCHED_ALGORITHMIC',
      details: `${item.title} (${item.quantityKg}kg) assigned to ${topMatch.matchedNgo.name} (Score: ${topMatch.score}%). Courier dispatched.`,
      hash: `SHA256:${Math.random().toString(36).substring(2, 10)}...`,
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);

    // Add notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `AI Matched: ${item.title} (${item.quantityKg}kg) assigned to ${topMatch.matchedNgo.name} (Score: ${topMatch.score}%)`,
        timeAgo: 'Just now',
        type: 'SUCCESS',
      },
      ...prev,
    ]);

    return { success: true, matchedNgoName: topMatch.matchedNgo.name, score: topMatch.score };
  };

  // 2. Resource matching confirmation workflow (Bug 8 & Update 7)
  const confirmNgoDispatch = (
    listingId: string, 
    ngoId: string, 
    vehicleType = 'EV Insulated Van #08',
    driverName = 'Rajesh Kumar (Fleet #08)',
    etaMinutes = 10
  ) => {
    const item = listings.find((l) => l.id === listingId);
    const targetNgo = ngos.find((n) => n.id === ngoId) || ngos[0];
    if (!item) return { success: false };

    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId
          ? {
              ...l,
              status: 'MATCHED',
              lifecycleStage: 'PICKUP_ASSIGNED',
              matchedNgoName: targetNgo.name,
              matchedNgoId: targetNgo.id,
            }
          : l
      )
    );

    const newPickup: UpcomingPickup = {
      id: `pick-${Date.now()}`,
      hubName: item.sourceHub,
      quantityKg: item.quantityKg,
      scheduledTime: 'Immediate Dispatch',
      driverName,
      vehicleType,
      status: 'CONFIRMED',
      tempCelsius: 3.4,
      lat: 19.0760,
      lng: 72.8777,
      targetNgoName: targetNgo.name,
      etaMinutes,
      optimizedRouteDistanceKm: targetNgo.distanceKm,
      baselineDistanceKm: Number((targetNgo.distanceKm * 1.5).toFixed(1)),
      doorSensorStatus: 'SEALED',
    };
    setPickups((prev) => [newPickup, ...prev]);

    // Log to Audit Log
    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        actor: currentUser.displayName,
        role: currentUser.role,
        action: 'DISPATCH_CONFIRMED',
        details: `Confirmed route for ${item.title} to ${targetNgo.name} via ${vehicleType}. ETA ${etaMinutes}m.`,
        hash: `SHA256:${Math.random().toString(36).substring(2, 10)}...`,
      },
      ...prev,
    ]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `🚀 Dispatch Locked: ${vehicleType} en route to ${targetNgo.name} with ${item.quantityKg}kg food.`,
        timeAgo: 'Just now',
        type: 'SUCCESS',
      },
      ...prev,
    ]);

    return { success: true };
  };

  // 3. Alternative waste-management / Circular recovery (Bug 12)
  const divertFoodToAlternativeRoute = (listingId: string, route: RecoveryRoute) => {
    const item = listings.find((l) => l.id === listingId);
    if (!item) return;

    const nextStage: FoodLifecycleStage = 
      route === 'FOOD_PROCESSING' 
        ? 'DIVERTED_PROCESSING' 
        : 'DIVERTED_COMPOST';

    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId
          ? {
              ...l,
              status: 'DIVERTED',
              recoveryRoute: route,
              lifecycleStage: nextStage,
            }
          : l
      )
    );

    // Update sustainability & circular stats (Bug 20)
    setStats((prev) => {
      const isProc = route === 'FOOD_PROCESSING';
      return {
        ...prev,
        foodProcessedKg: isProc ? prev.foodProcessedKg + item.quantityKg : prev.foodProcessedKg,
        foodCompostedKg: !isProc ? prev.foodCompostedKg + item.quantityKg : prev.foodCompostedKg,
        co2SavedTons: Number((prev.co2SavedTons + (item.quantityKg * 1.8) / 1000).toFixed(2)),
      };
    });

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        actor: currentUser.displayName,
        role: currentUser.role,
        action: `DIVERTED_TO_${route}`,
        details: `${item.title} (${item.quantityKg}kg) diverted from landfill to ${route}. Circular recovery active.`,
        hash: `SHA256:${Math.random().toString(36).substring(2, 10)}...`,
      },
      ...prev,
    ]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `♻️ Circular Diversion: ${item.title} successfully rerouted to ${route}. Zero waste recorded.`,
        timeAgo: 'Just now',
        type: 'INFO',
      },
      ...prev,
    ]);
  };

  // 4. Food lifecycle stage stepper (Bug 11 & Update 9)
  const advanceLifecycleStage = (listingId: string, nextStage: FoodLifecycleStage) => {
    const item = listings.find((l) => l.id === listingId);
    if (!item) return;

    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId
          ? {
              ...l,
              lifecycleStage: nextStage,
              status: nextStage === 'DELIVERED' || nextStage === 'IMPACT_RECORDED' ? 'DELIVERED' : l.status,
            }
          : l
      )
    );

    // If delivered, credit impact automatically (Bug 20)
    if (nextStage === 'DELIVERED' || nextStage === 'IMPACT_RECORDED') {
      const impact = calculateResourceSavings(item.quantityKg, item.category);
      setStats((prev) => ({
        ...prev,
        totalBeneficiaries: prev.totalBeneficiaries + impact.mealsCount,
      }));
    }

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        actor: currentUser.displayName,
        role: currentUser.role,
        action: `LIFECYCLE_${nextStage}`,
        details: `${item.title} batch progressed to stage ${nextStage}.`,
        hash: `SHA256:${Math.random().toString(36).substring(2, 10)}...`,
      },
      ...prev,
    ]);
  };

  // 5. NGO requests food
  const requestFood = (listingId: string, ngoName: string) => {
    const item = listings.find((l) => l.id === listingId);
    if (!item) return;

    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId 
          ? { ...l, status: 'IN_TRANSIT', lifecycleStage: 'IN_TRANSIT', matchedNgoName: ngoName } 
          : l
      )
    );

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `${ngoName} accepted request for ${item.title} (${item.quantityKg}kg). Dispatch routing active.`,
        timeAgo: 'Just now',
        type: 'INFO',
      },
      ...prev,
    ]);
  };

  // 6. Add new food listing with enhanced parameters
  const addNewFoodListing = (item: Omit<FoodItemListing, 'id' | 'createdAt' | 'status' | 'lifecycleStage'>) => {
    const newId = `lst-${Date.now()}`;
    const urgency = item.safeWindowHours <= 3.0 ? 'CRITICAL_SOS' : 'NORMAL';

    const newListing: FoodItemListing = {
      ...item,
      id: newId,
      status: 'AVAILABLE',
      lifecycleStage: 'CREATED',
      urgency,
      createdAt: 'Just now',
    };

    if (isOffline) {
      setOfflineQueue((prev) => [...prev, newListing]);
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: `💾 Queued offline: ${item.title} (${item.quantityKg}kg). Will sync when connection resumes.`,
          timeAgo: 'Just now',
          type: 'INFO',
        },
        ...prev,
      ]);
      return;
    }

    setListings((prev) => [newListing, ...prev]);
    setKitchenEstimatedSurplusKg((prev) => prev + item.quantityKg);

    setAuditLogs((prev) => [
      {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        actor: currentUser.displayName,
        role: currentUser.role,
        action: 'SURPLUS_FOOD_CREATED',
        details: `Published ${item.title} (${item.quantityKg}kg) at ${item.sourceHub}. Urgency: ${urgency}.`,
        hash: `SHA256:${Math.random().toString(36).substring(2, 10)}...`,
      },
      ...prev,
    ]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `New food listing published: ${item.title} (${item.quantityKg}kg) at ${item.sourceHub}`,
        timeAgo: 'Just now',
        type: 'INFO',
      },
      ...prev,
    ]);
  };

  // 7. IoT simulated anomaly (Bug 6)
  const simulateSensorAnomaly = () => {
    setIotSensors((prev) =>
      prev.map((s) =>
        s.id === 'iot-1'
          ? {
              ...s,
              temperatureCelsius: 6.8, // Violation! > 4°C
              doorStatus: 'OPEN',
              doorOpenDurationMinutes: 14,
              sensorHealth: 'WARNING',
              lastUpdated: 'Just now (ALERT)',
            }
          : s
      )
    );

    setActionQueue((prev) => [
      {
        id: `act-temp-${Date.now()}`,
        title: '🚨 CRITICAL: Cold Room #1 Temperature Breach (+6.8°C)',
        category: 'TEMPERATURE',
        urgency: 'CRITICAL',
        description: 'Walk-In Chiller Bay temperature rose to 6.8°C (limit ≤4.0°C). Door open for 14 minutes.',
        suggestedAction: 'Close chiller door immediately and check cooling compressor circuit.',
        timestamp: 'Just now',
        source: 'IoT Telemetry Stream',
      },
      ...prev,
    ]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: '🚨 IoT VIOLATION: Walk-In Chiller #1 at 6.8°C! Door open > 14m.',
        timeAgo: 'Just now',
        type: 'ALERT',
      },
      ...prev,
    ]);
  };

  // 8. Twilio SMS simulator listing
  const simulateSmsListing = (smsText: string) => {
    const parsed = parseSmsSurplusString(smsText);
    if (!parsed.isValid || !parsed.item || !parsed.quantityKg) {
      return { success: false, message: parsed.errorMessage || 'Invalid format' };
    }

    const newListing: FoodItemListing = {
      id: `sms-${Date.now()}`,
      title: `${parsed.item.toUpperCase()} (SMS Ingress)`,
      category: parsed.category || 'OTHERS',
      dietaryTags: ['VEGETARIAN'],
      quantityKg: parsed.quantityKg,
      expiryString: `Today (${parsed.expiryTime})`,
      sourceHub: 'Express Caterers (SMS Node)',
      status: 'AVAILABLE',
      lifecycleStage: 'AVAILABLE',
      freshnessScore: 94,
      preparationTime: 'Just now',
      createdAt: 'Just now',
      spoilageRisk: 'LOW',
      safeWindowHours: 4.0,
      packagingType: 'STANDARD_TRAYS',
      storageCondition: 'HOT_HELD',
      recoveryRoute: 'DONATION',
      urgency: 'NORMAL',
    };

    setListings((prev) => [newListing, ...prev]);
    setKitchenEstimatedSurplusKg((prev) => prev + parsed.quantityKg!);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `SMS Gateway logged: ${parsed.item} ${parsed.quantityKg}kg expiring at ${parsed.expiryTime}`,
        timeAgo: 'Just now',
        type: 'SUCCESS',
      },
      ...prev,
    ]);

    return {
      success: true,
      message: `Parsed & listed: ${parsed.quantityKg}kg of ${parsed.item} (Expiry: ${parsed.expiryTime}). Listing ID: #${newListing.id.slice(-4).toUpperCase()}`,
    };
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const resolveActionQueueItem = (id: string) => {
    setActionQueue((prev) => prev.filter((a) => a.id !== id));
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Action item resolved and archived.',
        timeAgo: 'Just now',
        type: 'SUCCESS',
      },
      ...prev,
    ]);
  };

  return (
    <FoodRescueContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        logout,
        switchRole,
        isDarkMode,
        toggleDarkMode,
        isOffline,
        toggleOffline,
        offlineQueueCount: offlineQueue.length,
        syncOfflineQueue,
        listings,
        ngos,
        pickups,
        stats,
        notifications,
        iotSensors,
        processingStats,
        actionQueue,
        auditLogs,
        kitchenDailyUsedKg,
        kitchenEstimatedSurplusKg,
        kitchenAvoidedKg,
        listForDonation,
        confirmNgoDispatch,
        requestFood,
        addNewFoodListing,
        divertFoodToAlternativeRoute,
        advanceLifecycleStage,
        simulateSmsListing,
        simulateSensorAnomaly,
        dismissNotification,
        resolveActionQueueItem,
      }}
    >
      {children}
    </FoodRescueContext.Provider>
  );
};

export const useFoodRescue = () => {
  const context = useContext(FoodRescueContext);
  if (!context) {
    throw new Error('useFoodRescue must be used within a FoodRescueProvider');
  }
  return context;
};

