/**
 * PERFORMANCE EQUITY - MOCK DATA SERVICE
 * Generates realistic demo data for the MVP
 */

import type {
  User,
  PESScore,
  TrustProfile,
  ScoreFactor,
  VerifiedTransaction,
  GAVLLayer,
  CongruencyResult,
  TrainingStatus,
  WeeklyMetrics,
  ActivityDay,
  Device,
  SystemHealth,
  GateDistribution,
  PhysiologicalBaseline,
  ScoreHistoryEntry,
  EquityStatement,
  HRZone,
} from '../types';

import {
  SCORE_FACTOR_WEIGHTS,
  SCORE_FACTOR_NAMES,
  TRUST_TIERS,
  TRAINING_STATUS_CONFIG,
} from '../constants';

// ============================================
// HELPER FUNCTIONS
// ============================================

const generateMerkleRoot = (): string => {
  return '0x' + Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

// ============================================
// PES SCORE
// ============================================

export const mockPESScore: PESScore = {
  value: 902,
  tier: 'excellent',
  percentile: 88,
  delta30d: 47,
  personalBest: 918,
  lastUpdated: Date.now(),
};

// ============================================
// TRUST PROFILE
// ============================================

export const mockTrustProfile: TrustProfile = {
  score: 88,
  tier: 'gold',
  multiplier: 0.9,
  nextTierAt: 95,
  history: [
    { date: Date.now() - 30 * 24 * 60 * 60 * 1000, score: 82, tier: 'gold' },
    { date: Date.now() - 20 * 24 * 60 * 60 * 1000, score: 85, tier: 'gold' },
    { date: Date.now() - 10 * 24 * 60 * 60 * 1000, score: 87, tier: 'gold' },
    { date: Date.now(), score: 88, tier: 'gold' },
  ],
};

// ============================================
// SCORE FACTORS
// ============================================

export const mockScoreFactors: ScoreFactor[] = [
  {
    id: 'effort',
    name: SCORE_FACTOR_NAMES.effort,
    weight: SCORE_FACTOR_WEIGHTS.effort,
    value: 82,
    trend: 'up',
    delta: 4,
    recommendation: 'Increase Z4+ session frequency',
    description: 'Total verified duration × intensity coefficient',
  },
  {
    id: 'consistency',
    name: SCORE_FACTOR_NAMES.consistency,
    weight: SCORE_FACTOR_WEIGHTS.consistency,
    value: 78,
    trend: 'stable',
    delta: 0,
    recommendation: 'Maintain 4+ sessions per week',
    description: 'Session regularity over rolling 30-day window',
  },
  {
    id: 'verification',
    name: SCORE_FACTOR_NAMES.verification,
    weight: SCORE_FACTOR_WEIGHTS.verification,
    value: 91,
    trend: 'up',
    delta: 2,
    recommendation: 'Status: Exceeds threshold for auto-verification',
    description: 'Average Session Confidence Score across sessions',
  },
  {
    id: 'trust',
    name: SCORE_FACTOR_NAMES.trust,
    weight: SCORE_FACTOR_WEIGHTS.trust,
    value: 88,
    trend: 'stable',
    delta: 0,
    recommendation: `Tier: GOLD | Next tier at ${TRUST_TIERS.platinum.min}`,
    description: 'Longitudinal verification reputation',
  },
];

// ============================================
// SCORE HISTORY
// ============================================

export const generateScoreHistory = (): ScoreHistoryEntry[] => {
  const history: ScoreHistoryEntry[] = [];
  let score = 855;
  const now = Date.now();

  for (let i = 120; i >= 0; i -= 5) {
    const delta = Math.floor(Math.random() * 10) - 3;
    score = Math.min(999, Math.max(0, score + delta));

    let tier: PESScore['tier'] = 'establishing';
    if (score >= 850) tier = 'exceptional';
    else if (score >= 700) tier = 'excellent';
    else if (score >= 500) tier = 'good';
    else if (score >= 300) tier = 'building';

    history.push({
      date: now - i * 24 * 60 * 60 * 1000,
      pes: score,
      tier,
      delta,
      event: score === 918 ? 'Personal Best' : undefined,
    });
  }

  return history;
};

// ============================================
// GAVL LAYERS
// ============================================

export const mockGAVLLayers: GAVLLayer[] = [
  {
    layer: 5,
    name: 'AUDIT & LIVENESS',
    shortName: 'AUDIT',
    status: 'active',
    statusLabel: 'LOGGING',
    details: {
      lastEntry: new Date().toISOString(),
      hash: generateMerkleRoot().slice(0, 12) + '...',
      zkProofs: 'enabled',
      microChallenges: 'ready',
    },
    lastCheck: Date.now(),
  },
  {
    layer: 4,
    name: 'TRUST INDEX',
    shortName: 'TRUST',
    status: 'nominal',
    statusLabel: 'GOLD',
    details: {
      score: 88,
      tier: 'gold',
      multiplier: 0.9,
      probationBand: 'none',
    },
    lastCheck: Date.now(),
  },
  {
    layer: 3,
    name: 'DEVICE ATTESTATION',
    shortName: 'DEV ATT',
    status: 'active',
    statusLabel: 'VERIFIED',
    details: {
      devicesAttested: 3,
      lastChallenge: '847ms ago',
      teeStatus: 'verified',
      antiReplay: 'active',
    },
    lastCheck: Date.now(),
  },
  {
    layer: 2,
    name: 'AI CONGRUENCY ENGINE',
    shortName: 'AI CONG',
    status: 'nominal',
    statusLabel: 'NOMINAL',
    details: {
      signals: 'HR HRV CAD GPS IMU BARO',
      anomalies30d: 0,
      confidence: 0.97,
      crossValidation: 'active',
    },
    lastCheck: Date.now(),
  },
  {
    layer: 1,
    name: 'GAVL SESSION ANCHORING',
    shortName: 'GAVL',
    status: 'ready',
    statusLabel: 'READY',
    details: {
      signalLadder: 'NFC → BLE → Wi-Fi → GNSS',
      preferredAnchor: "NFC (Gold's Gym Venice)",
      closedAnchors: 1,
      openAnchors: 3,
    },
    lastCheck: Date.now(),
  },
];

// ============================================
// CONGRUENCY RESULT
// ============================================

export const mockCongruencyResult: CongruencyResult = {
  score: 0.94,
  signals: ['HR', 'HRV', 'CAD', 'GPS', 'IMU', 'BARO', 'PWR'],
  correlationMatrix: [
    { signal1: 'HR', signal2: 'HRV', correlation: 0.92, status: 'congruent' },
    { signal1: 'HR', signal2: 'CAD', correlation: 0.87, status: 'congruent' },
    { signal1: 'HR', signal2: 'GPS', correlation: 0.84, status: 'congruent' },
    { signal1: 'HR', signal2: 'IMU', correlation: 0.91, status: 'congruent' },
    { signal1: 'HR', signal2: 'BARO', correlation: 0.78, status: 'congruent' },
    { signal1: 'HR', signal2: 'PWR', correlation: 0.89, status: 'congruent' },
    { signal1: 'CAD', signal2: 'GPS', correlation: 0.94, status: 'congruent' },
    { signal1: 'CAD', signal2: 'IMU', correlation: 0.96, status: 'congruent' },
    { signal1: 'GPS', signal2: 'IMU', correlation: 0.89, status: 'congruent' },
  ],
  attacks: [
    { type: 'shaker', name: 'Shaker Attack Detection', status: 'clear' },
    { type: 'gps_spoofing', name: 'GPS Spoofing Detection', status: 'clear' },
    { type: 'replay', name: 'Replay Attack Detection', status: 'clear' },
    { type: 'emulation', name: 'Device Emulation Detection', status: 'clear' },
    { type: 'injection', name: 'Signal Injection Detection', status: 'clear' },
  ],
  analysis: 'Heart rate progression consistent with reported Z3 effort. GPS path correlates with IMU accelerometer data. No anomalies detected.',
  timestamp: Date.now(),
};

// ============================================
// PHYSIOLOGICAL BASELINE
// ============================================

export const mockPhysiologicalBaseline: PhysiologicalBaseline = {
  restingHR: 58,
  maxHR: 186,
  hrvBaseline: 42,
  recoveryRate: 32,
  cadenceRange: [78, 92],
  sessionsAnalyzed: 127,
  profileConfidence: 0.96,
};

// ============================================
// TRAINING STATUS
// ============================================

export const mockTrainingStatus: TrainingStatus = {
  status: 'productive',
  statusLabel: TRAINING_STATUS_CONFIG.productive.label,
  description: TRAINING_STATUS_CONFIG.productive.description,
  load: 72,
  trend: 'optimal',
  recoveryHours: 18,
  readiness: 'moderate',
  lastUpdated: Date.now(),
};

// ============================================
// WEEKLY METRICS
// ============================================

export const mockWeeklyMetrics: WeeklyMetrics = {
  pesEarned: 47,
  pesGoal: 60,
  sessions: 4,
  sessionsGoal: 5,
  avgScs: 0.84,
  scsTarget: 0.80,
};

// ============================================
// DEVICES
// ============================================

export const mockDevices: Device[] = [
  {
    id: 'dev-001',
    name: 'Apple Watch Series 9',
    type: 'watch',
    brand: 'apple',
    isAttested: true,
    lastChallenge: Date.now() - 2300,
    teeVerified: true,
  },
  {
    id: 'dev-002',
    name: 'iPhone 15 Pro',
    type: 'phone',
    brand: 'apple',
    isAttested: true,
    lastChallenge: Date.now() - 15000,
    teeVerified: true,
  },
  {
    id: 'dev-003',
    name: 'WHOOP 4.0',
    type: 'watch',
    brand: 'whoop',
    isAttested: true,
    lastChallenge: Date.now() - 3600000,
    teeVerified: true,
  },
];

// ============================================
// VERIFIED TRANSACTIONS
// ============================================

export const mockTransactions: VerifiedTransaction[] = [
  {
    id: '4a7f2c',
    uid: 'demo-user-01',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    type: 'Resistance Training',
    duration: 88,
    zone: 'Z3',
    location: {
      name: "Gold's Gym Venice",
      coordinates: [33.9871, -118.4682],
      anchor: 'nfc',
    },
    scs: 0.94,
    gate: 'auto',
    pesDelta: 9.0,
    status: 'finalized',
    proofs: [
      { type: 'nfc', status: 'verified', timestamp: Date.now() - 2 * 60 * 60 * 1000, details: 'NFC anchor verified' },
      { type: 'gps', status: 'verified', timestamp: Date.now() - 2 * 60 * 60 * 1000, details: '33.9871, -118.4682 (within 12m)' },
      { type: 'wifi', status: 'verified', timestamp: Date.now() - 2 * 60 * 60 * 1000, details: 'BSSID match (GoldsGym_5G)' },
      { type: 'device', status: 'verified', timestamp: Date.now() - 2 * 60 * 60 * 1000, details: 'Apple Watch S9 (attested)' },
      { type: 'congruency', status: 'verified', timestamp: Date.now() - 60 * 1000, details: 'Score: 0.94' },
    ],
    chainOfCustody: [
      { timestamp: Date.now() - 2 * 60 * 60 * 1000, event: 'Session initiated', type: 'anchor_verified' },
      { timestamp: Date.now() - 2 * 60 * 60 * 1000 + 1000, event: 'Device attestation', type: 'challenge_passed' },
      { timestamp: Date.now() - 2 * 60 * 60 * 1000 + 38000, event: 'AI congruency start', type: 'signals_acquired' },
      { timestamp: Date.now() - 12 * 60 * 1000, event: 'Session terminated', type: 'user_action' },
      { timestamp: Date.now() - 12 * 60 * 1000 + 1000, event: 'Congruency complete', type: 'score_0.94' },
      { timestamp: Date.now() - 12 * 60 * 1000 + 2000, event: 'Gate determined', type: 'AUTO' },
      { timestamp: Date.now() - 12 * 60 * 1000 + 3000, event: 'PES calculated', type: '+9.0' },
      { timestamp: Date.now() - 12 * 60 * 1000 + 4000, event: 'Merkle commit', type: '0x7f3a8b2c...' },
    ],
    merkleRoot: generateMerkleRoot(),
  },
  {
    id: '3b8e1d',
    uid: 'demo-user-01',
    timestamp: Date.now() - 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000,
    type: 'Cardiovascular',
    duration: 30,
    zone: 'Z2',
    location: {
      name: 'Santa Monica Beach',
      coordinates: [34.0195, -118.4912],
      anchor: 'geo',
    },
    scs: 0.72,
    gate: 'confirm',
    pesDelta: 5.0,
    status: 'finalized',
    proofs: [
      { type: 'gps', status: 'verified', timestamp: Date.now() - 24 * 60 * 60 * 1000, details: '34.0195, -118.4912' },
      { type: 'device', status: 'verified', timestamp: Date.now() - 24 * 60 * 60 * 1000, details: 'Apple Watch S9 (attested)' },
      { type: 'liveness', status: 'verified', timestamp: Date.now() - 24 * 60 * 60 * 1000, details: 'Biometric verified' },
    ],
    chainOfCustody: [
      { timestamp: Date.now() - 24 * 60 * 60 * 1000, event: 'Session initiated', type: 'geo_anchor' },
      { timestamp: Date.now() - 24 * 60 * 60 * 1000 + 30 * 60 * 1000, event: 'Session terminated', type: 'user_action' },
      { timestamp: Date.now() - 24 * 60 * 60 * 1000 + 30 * 60 * 1000 + 23000, event: 'Liveness check', type: 'biometric_passed' },
    ],
    merkleRoot: generateMerkleRoot(),
  },
  {
    id: '2c9f0e',
    uid: 'demo-user-01',
    timestamp: Date.now() - 24 * 60 * 60 * 1000 - 10 * 60 * 60 * 1000,
    type: 'Combat Training',
    duration: 45,
    zone: 'Z4',
    location: {
      name: 'Home Gym',
      coordinates: [33.9950, -118.4600],
      anchor: 'wifi',
    },
    scs: 0.91,
    gate: 'auto',
    pesDelta: 7.0,
    status: 'finalized',
    proofs: [
      { type: 'wifi', status: 'verified', timestamp: Date.now() - 24 * 60 * 60 * 1000, details: 'Home network matched' },
      { type: 'device', status: 'verified', timestamp: Date.now() - 24 * 60 * 60 * 1000, details: 'WHOOP 4.0 (attested)' },
      { type: 'congruency', status: 'verified', timestamp: Date.now() - 24 * 60 * 60 * 1000, details: 'Score: 0.91' },
    ],
    chainOfCustody: [
      { timestamp: Date.now() - 24 * 60 * 60 * 1000, event: 'Session initiated', type: 'wifi_anchor' },
      { timestamp: Date.now() - 24 * 60 * 60 * 1000 + 45 * 60 * 1000, event: 'Session terminated', type: 'user_action' },
    ],
    merkleRoot: generateMerkleRoot(),
  },
  {
    id: '1d0a2b',
    uid: 'demo-user-01',
    timestamp: Date.now() - 24 * 60 * 60 * 1000 - 16 * 60 * 60 * 1000,
    type: 'Martial Arts',
    duration: 55,
    zone: 'Z3',
    location: {
      name: 'Unknown',
      anchor: 'geo',
    },
    scs: 0.38,
    gate: 'quarantine',
    pesDelta: 0,
    status: 'finalized',
    proofs: [
      { type: 'gps', status: 'failed', timestamp: Date.now() - 24 * 60 * 60 * 1000, details: 'Location not verified' },
      { type: 'device', status: 'verified', timestamp: Date.now() - 24 * 60 * 60 * 1000, details: 'Apple Watch S9' },
      { type: 'congruency', status: 'pending', timestamp: Date.now() - 24 * 60 * 60 * 1000, details: 'Insufficient data' },
    ],
    chainOfCustody: [
      { timestamp: Date.now() - 24 * 60 * 60 * 1000, event: 'Session initiated', type: 'no_anchor' },
      { timestamp: Date.now() - 24 * 60 * 60 * 1000 + 55 * 60 * 1000, event: 'Session terminated', type: 'user_action' },
      { timestamp: Date.now() - 24 * 60 * 60 * 1000 + 55 * 60 * 1000 + 5000, event: 'Gate determined', type: 'QUARANTINE' },
    ],
    merkleRoot: generateMerkleRoot(),
  },
];

// ============================================
// ACTIVITY CALENDAR
// ============================================

export const generateActivityCalendar = (days: number = 30): ActivityDay[] => {
  const calendar: ActivityDay[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const hasSessions = Math.random() > 0.3;
    const sessions = hasSessions ? Math.floor(Math.random() * 2) + 1 : 0;
    const intensity = hasSessions ? (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3 : 0;
    const minutes = sessions > 0 ? sessions * (30 + Math.floor(Math.random() * 60)) : 0;
    const pesEarned = sessions > 0 ? sessions * (3 + Math.floor(Math.random() * 7)) : 0;

    calendar.push({
      date: dateStr,
      sessions,
      minutes,
      intensity,
      pesEarned,
    });
  }

  return calendar;
};

// ============================================
// GATE DISTRIBUTION
// ============================================

export const mockGateDistribution: GateDistribution = {
  auto: 68,
  confirm: 24,
  quarantine: 8,
};

// ============================================
// SYSTEM HEALTH
// ============================================

export const mockSystemHealth: SystemHealth = {
  gavl: 'ready',
  aiCongruency: 'nominal',
  deviceAttestation: 'active',
  trustIndex: 'nominal',
  audit: 'active',
  overallStatus: 'online',
};

// ============================================
// DEMO USER
// ============================================

export const mockUser: User = {
  uid: 'demo-user-01',
  email: 'demo@performanceequity.com',
  displayName: 'Demo User',
  pes: mockPESScore,
  trust: mockTrustProfile,
  scoreFactors: mockScoreFactors,
  devices: mockDevices,
  trainingStatus: mockTrainingStatus,
  weeklyMetrics: mockWeeklyMetrics,
  createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
  lastActive: Date.now(),
};

// ============================================
// EQUITY STATEMENTS
// ============================================

export const mockEquityStatements: EquityStatement[] = [
  {
    id: 'stmt-2026-01',
    month: 1,
    year: 2026,
    totalSessions: 18,
    totalPesGenerated: 142,
    assetAppreciation: 4.7,
    consistencyScore: 94,
    volatilityIndex: 'Low',
    status: 'Pending',
    generatedAt: Date.now(),
  },
  {
    id: 'stmt-2025-12',
    month: 12,
    year: 2025,
    totalSessions: 22,
    totalPesGenerated: 168,
    assetAppreciation: 5.2,
    consistencyScore: 96,
    volatilityIndex: 'Low',
    status: 'Audited',
    generatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  },
  {
    id: 'stmt-2025-11',
    month: 11,
    year: 2025,
    totalSessions: 19,
    totalPesGenerated: 145,
    assetAppreciation: 3.8,
    consistencyScore: 91,
    volatilityIndex: 'Low',
    status: 'Audited',
    generatedAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
  },
];

// ============================================
// ZONE DISTRIBUTION
// ============================================

export const mockZoneDistribution = [
  { zone: 'Z1' as HRZone, percentage: 12, minutes: 156, color: '#4FC3F7' },
  { zone: 'Z2' as HRZone, percentage: 34, minutes: 442, color: '#81C784' },
  { zone: 'Z3' as HRZone, percentage: 38, minutes: 494, color: '#FFD54F' },
  { zone: 'Z4' as HRZone, percentage: 12, minutes: 156, color: '#FF8A65' },
  { zone: 'Z5' as HRZone, percentage: 4, minutes: 52, color: '#E57373' },
];

// ============================================
// WEEKLY TRENDS
// ============================================

export const generateWeeklyTrends = (weeks: number = 12) => {
  const trends = [];
  const now = Date.now();

  for (let i = weeks - 1; i >= 0; i--) {
    const weekNum = 52 - i;
    trends.push({
      week: `W${weekNum}`,
      weekStart: new Date(now - i * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      pesEarned: 30 + Math.floor(Math.random() * 40),
      sessions: 3 + Math.floor(Math.random() * 4),
      avgScs: 0.70 + Math.random() * 0.25,
    });
  }

  return trends;
};
