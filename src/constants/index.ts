/**
 * PERFORMANCE EQUITY - CONSTANTS
 * Bank-Grade Verification Protocol for Human Performance
 */

import type {
  ScoreTier,
  TrustTier,
  HRZone,
  GateType,
  LayerNumber,
  TrainingStatusType,
  AttackType,
} from '../types';

// ============================================
// COLORS
// ============================================

export const COLORS = {
  // Base
  background: '#0A0A0A',
  surface: '#141414',
  surfaceElevated: '#1A1A1A',
  border: '#2A2A2A',
  borderLight: '#3A3A3A',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#606060',

  // Accent
  accent: '#FFD400',
  accentMuted: '#B39700',
  accentDim: '#665800',

  // Status
  success: '#00C853',
  warning: '#FF9100',
  error: '#FF5252',
  info: '#2196F3',

  // Score Tiers
  score: {
    exceptional: '#FFD400',
    excellent: '#00C853',
    good: '#64DD17',
    building: '#FF9100',
    establishing: '#FF5252',
  } as Record<ScoreTier, string>,

  // Trust Tiers
  trust: {
    platinum: '#E5E4E2',
    gold: '#FFD700',
    silver: '#C0C0C0',
    grey: '#808080',
    red: '#DC143C',
  } as Record<TrustTier, string>,

  // HR Zones
  zones: {
    Z1: '#C0C0C0',  // Silver for Recovery
    Z2: '#81C784',
    Z3: '#FFD54F',
    Z4: '#FF8A65',
    Z5: '#E57373',
  } as Record<HRZone, string>,

  // Layers
  layers: {
    1: '#26C6DA',
    2: '#7E57C2',
    3: '#66BB6A',
    4: '#FFA726',
    5: '#EF5350',
  } as Record<LayerNumber, string>,

  // Gates
  gates: {
    auto: '#00C853',
    confirm: '#FF9100',
    quarantine: '#FF5252',
  } as Record<GateType, string>,
} as const;

// ============================================
// SCORE CONFIGURATION
// ============================================

export const SCORE_TIERS: Record<ScoreTier, { min: number; max: number; label: string }> = {
  exceptional: { min: 850, max: 999, label: 'EXCEPTIONAL' },
  excellent: { min: 700, max: 849, label: 'EXCELLENT' },
  good: { min: 500, max: 699, label: 'GOOD' },
  building: { min: 300, max: 499, label: 'BUILDING' },
  establishing: { min: 0, max: 299, label: 'ESTABLISHING' },
};

export const SCORE_FACTOR_WEIGHTS: Record<string, number> = {
  effort: 35,
  consistency: 25,
  verification: 25,
  trust: 15,
};

export const SCORE_FACTOR_NAMES: Record<string, string> = {
  effort: 'EFFORT VOLUME',
  consistency: 'CONSISTENCY INDEX',
  verification: 'VERIFICATION INTEGRITY',
  trust: 'TRUST INDEX',
};

// ============================================
// TRUST CONFIGURATION
// ============================================

export const TRUST_TIERS: Record<TrustTier, { min: number; minScore: number; multiplier: number; label: string; color: string }> = {
  platinum: { min: 95, minScore: 95, multiplier: 1.0, label: 'PLATINUM', color: '#E5E4E2' },
  gold: { min: 85, minScore: 85, multiplier: 0.9, label: 'GOLD', color: '#FFD700' },
  silver: { min: 70, minScore: 70, multiplier: 0.75, label: 'SILVER', color: '#C0C0C0' },
  grey: { min: 50, minScore: 50, multiplier: 0.5, label: 'GREY', color: '#808080' },
  red: { min: 0, minScore: 0, multiplier: 0.0, label: 'RED', color: '#DC143C' },
};

// ============================================
// GAVL LAYER CONFIGURATION
// ============================================

export const LAYER_NAMES: Record<LayerNumber, { name: string; shortName: string }> = {
  1: { name: 'GAVL SESSION ANCHORING', shortName: 'GAVL' },
  2: { name: 'AI CONGRUENCY ENGINE', shortName: 'ACE' },
  3: { name: 'DEVICE ATTESTATION', shortName: 'DEVA' },
  4: { name: 'TRUST INDEX', shortName: 'TRUDEX' },
  5: { name: 'AUDIT & LIVENESS', shortName: 'AUDIT' },
};

export const ANCHOR_CONFIDENCE: Record<string, number> = {
  nfc: 1.0,
  ble: 0.85,
  wifi: 0.70,
  geo: 0.50,
};

export const ANCHOR_LABELS: Record<string, string> = {
  nfc: 'NFC/RFID',
  ble: 'BLE Keys',
  wifi: 'Wi-Fi BSSID',
  geo: 'GNSS Geo',
  geo_exit: 'GNSS Geo Exit',
};

// ============================================
// SESSION CONFIGURATION
// ============================================

export const GATE_THRESHOLDS = {
  auto: 0.80,
  confirm: 0.50,
};

export const GATE_LABELS: Record<GateType, string> = {
  auto: 'AUTO',
  confirm: 'CONFIRM',
  quarantine: 'QUARANTINE',
};

export const HR_ZONE_LABELS: Record<HRZone, { name: string; description: string }> = {
  Z1: { name: 'Recovery', description: '50-60% Max HR' },
  Z2: { name: 'Aerobic', description: '60-70% Max HR' },
  Z3: { name: 'Tempo', description: '70-80% Max HR' },
  Z4: { name: 'Threshold', description: '80-90% Max HR' },
  Z5: { name: 'VO2 Max', description: '90-100% Max HR' },
};

export const HR_ZONE_MULTIPLIERS: Record<HRZone, number> = {
  Z1: 0.8,
  Z2: 1.0,
  Z3: 1.2,
  Z4: 1.4,
  Z5: 1.6,
};

export const MAX_PES_PER_SESSION = 10;

// ============================================
// TRAINING STATUS CONFIGURATION
// ============================================

export const TRAINING_STATUS_CONFIG: Record<TrainingStatusType, {
  label: string;
  description: string;
  color: string;
}> = {
  peaking: {
    label: 'PEAKING',
    description: 'Ideal race readiness',
    color: '#00E676',
  },
  productive: {
    label: 'PRODUCTIVE',
    description: 'Fitness level improving',
    color: '#69F0AE',
  },
  maintaining: {
    label: 'MAINTAINING',
    description: 'Fitness level stable',
    color: '#B2FF59',
  },
  recovery: {
    label: 'RECOVERY',
    description: 'Normal recovery period',
    color: '#FFFF00',
  },
  unproductive: {
    label: 'UNPRODUCTIVE',
    description: 'Training not optimal',
    color: '#FFD740',
  },
  strained: {
    label: 'STRAINED',
    description: 'Insufficient recovery',
    color: '#FF6E40',
  },
  detraining: {
    label: 'DETRAINING',
    description: 'Fitness declining',
    color: '#FF5252',
  },
};

// ============================================
// ATTACK DETECTION LABELS
// ============================================

export const ATTACK_LABELS: Record<AttackType, string> = {
  shaker: 'Shaker Attack Detection',
  gps_spoofing: 'GPS Spoofing Detection',
  replay: 'Replay Attack Detection',
  emulation: 'Device Emulation Detection',
  injection: 'Signal Injection Detection',
};

// ============================================
// SIGNAL TYPES
// ============================================

export const SIGNAL_LABELS: Record<string, string> = {
  HR: 'Heart Rate',
  HRV: 'HRV',
  CAD: 'Cadence',
  GPS: 'GPS',
  IMU: 'IMU',
  BARO: 'Barometer',
  PWR: 'Power',
};

// ============================================
// ACTIVITY TYPES
// ============================================

export const ACTIVITY_TYPES = [
  'Resistance Training',
  'Cardiovascular',
  'HIIT',
  'Yoga',
  'Cycling',
  'Running',
  'Swimming',
  'Combat Training',
  'Martial Arts',
  'CrossFit',
  'Mobility',
  'Other',
] as const;

// ============================================
// DEVICE BRANDS
// ============================================

export const DEVICE_BRANDS = {
  apple: { name: 'Apple Watch', icon: 'apple' },
  garmin: { name: 'Garmin', icon: 'garmin' },
  whoop: { name: 'WHOOP', icon: 'whoop' },
  oura: { name: 'Oura Ring', icon: 'oura' },
  fitbit: { name: 'Fitbit', icon: 'fitbit' },
  generic: { name: 'Generic BLE', icon: 'device' },
} as const;

// ============================================
// GEOFENCE CONFIGURATION (Demo)
// ============================================

export const DEMO_GEOFENCE = {
  center: {
    lat: 33.9871,
    lon: -118.4682,
  },
  radius: 100, // meters
  name: "Gold's Gym Venice",
};

// ============================================
// DEMO ACCOUNT
// ============================================

export const DEMO_CREDENTIALS = {
  email: 'demo@performanceequity.com',
  password: 'Demo!234',
};

// ============================================
// TIME CONSTANTS
// ============================================

export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

// ============================================
// FORMATTING
// ============================================

export const DATE_FORMAT = {
  full: 'YYYY-MM-DD HH:mm:ss',
  date: 'YYYY-MM-DD',
  time: 'HH:mm:ss',
  short: 'MMM DD',
  month: 'MMMM YYYY',
} as const;
