/**
 * PERFORMANCE EQUITY - TYPE DEFINITIONS
 * Bank-Grade Verification Protocol for Human Performance
 */

// ============================================
// CORE SCORE TYPES
// ============================================

export type ScoreTier = 'exceptional' | 'excellent' | 'good' | 'building' | 'establishing';

export interface PESScore {
  value: number;              // 0-999
  tier: ScoreTier;
  percentile: number;         // 0-100
  delta30d: number;           // Change over 30 days
  personalBest: number;
  lastUpdated: number;
}

export type ScoreFactorId = 'effort' | 'consistency' | 'verification' | 'trust';

export interface ScoreFactor {
  id: ScoreFactorId;
  name: string;
  weight: number;             // Percentage (e.g., 35)
  value: number;              // 0-100
  trend: 'up' | 'down' | 'stable';
  delta: number;              // Recent change
  recommendation: string;
  description: string;
}

export interface ScoreHistoryEntry {
  date: number;               // Unix timestamp
  pes: number;
  tier: ScoreTier;
  delta: number;
  event?: string;             // e.g., "Reached Gold tier"
}

// ============================================
// TRUST TYPES
// ============================================

export type TrustTier = 'platinum' | 'gold' | 'silver' | 'grey' | 'red';

export interface TrustProfile {
  score: number;              // 0-100
  tier: TrustTier;
  multiplier: number;         // 0.0 - 1.0
  nextTierAt: number;         // Score needed for next tier
  history: TrustHistoryEntry[];
}

export interface TrustHistoryEntry {
  date: number;
  score: number;
  tier: TrustTier;
  event?: string;
}

// ============================================
// VERIFICATION PROTOCOL TYPES
// ============================================

export type LayerNumber = 1 | 2 | 3 | 4 | 5;

export type LayerStatus = 'active' | 'nominal' | 'ready' | 'warning' | 'error' | 'offline';

export interface GAVLLayer {
  layer: LayerNumber;
  name: string;
  shortName: string;
  status: LayerStatus;
  statusLabel: string;
  details: Record<string, string | number | boolean>;
  lastCheck: number;
}

export type AnchorType = 'nfc' | 'ble' | 'wifi' | 'geo';

export interface AnchorSignal {
  type: AnchorType;
  name: string;
  confidence: number;         // 0-1
  isOpen: boolean;            // Open vs Closed anchor
  signalStrength?: 'strong' | 'medium' | 'weak';
  details?: string;
}

export interface SignalCorrelation {
  signal1: string;
  signal2: string;
  correlation: number;        // 0-1
  status: 'congruent' | 'anomaly';
}

export type SignalType = 'HR' | 'HRV' | 'CAD' | 'GPS' | 'IMU' | 'BARO' | 'PWR';

export interface CongruencyResult {
  score: number;              // 0-1
  signals: SignalType[];
  correlationMatrix: SignalCorrelation[];
  attacks: AttackDetectionResult[];
  analysis: string;
  timestamp: number;
}

export type AttackType =
  | 'shaker'
  | 'gps_spoofing'
  | 'replay'
  | 'emulation'
  | 'injection';

export interface AttackDetectionResult {
  type: AttackType;
  name: string;
  status: 'clear' | 'detected' | 'suspicious';
  confidence?: number;
}

export interface PhysiologicalBaseline {
  restingHR: number;
  maxHR: number;
  hrvBaseline: number;
  recoveryRate: number;
  cadenceRange: [number, number];
  sessionsAnalyzed: number;
  profileConfidence: number;
}

// ============================================
// SESSION / TRANSACTION TYPES
// ============================================

export type HRZone = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5';

export type GateType = 'auto' | 'confirm' | 'quarantine';

export type SessionStatus = 'active' | 'candidate' | 'finalized';

export type ProofStatus = 'verified' | 'failed' | 'pending';

export interface SessionProof {
  type: string;               // 'gps', 'wifi', 'device', 'liveness', 'nfc', 'congruency'
  status: ProofStatus;
  timestamp: number;
  details: string;
  value?: string | number;
}

export interface CustodyEvent {
  timestamp: number;
  event: string;
  type: string;
  hash?: string;
}

export interface VerifiedTransaction {
  id: string;
  uid: string;
  timestamp: number;
  type: string;               // Activity type name
  duration: number;           // Minutes
  zone: HRZone;
  location: {
    name: string;
    coordinates?: [number, number];
    anchor: AnchorType;
  };
  scs: number;                // Session Confidence Score 0-1
  gate: GateType;
  pesDelta: number;
  status: SessionStatus;
  proofs: SessionProof[];
  chainOfCustody: CustodyEvent[];
  merkleRoot: string;
  // Live session data (when active)
  liveSignals?: {
    heartRate?: number;
    cadence?: number;
    congruency?: number;
  };
}

export interface ActiveSession extends VerifiedTransaction {
  status: 'active';
  startTime: number;
  anchorLockDuration: number;
  gpsDrift: number;
  wifiBssidCount: number;
  estimatedPES: number;
  projectedGate: GateType;
}

// ============================================
// TRAINING / PERFORMANCE TYPES
// ============================================

export type TrainingStatusType =
  | 'peaking'
  | 'productive'
  | 'maintaining'
  | 'recovery'
  | 'unproductive'
  | 'strained'
  | 'detraining';

export interface TrainingStatus {
  status: TrainingStatusType;
  statusLabel: string;
  description: string;
  load: number;               // 0-100
  trend: 'optimal' | 'high' | 'low';
  recoveryHours: number;
  readiness: 'high' | 'moderate' | 'low';
  lastUpdated: number;
}

export interface WeeklyMetrics {
  pesEarned: number;
  pesGoal: number;
  sessions: number;
  sessionsGoal: number;
  avgScs: number;
  scsTarget: number;
}

export interface ActivityDay {
  date: string;               // ISO date string YYYY-MM-DD
  sessions: number;
  minutes: number;
  intensity: 0 | 1 | 2 | 3;   // none, light, moderate, intense
  pesEarned: number;
  zones?: Record<HRZone, number>; // Minutes per zone
}

export interface ZoneDistribution {
  zone: HRZone;
  percentage: number;
  minutes: number;
  color: string;
}

export interface WeeklyTrend {
  week: string;               // e.g., "W1", "W52"
  weekStart: string;          // ISO date
  pesEarned: number;
  sessions: number;
  avgScs: number;
}

// ============================================
// USER & DEVICE TYPES
// ============================================

export interface Device {
  id: string;
  name: string;
  type: 'watch' | 'phone' | 'other';
  brand: 'apple' | 'garmin' | 'whoop' | 'oura' | 'fitbit' | 'generic';
  isAttested: boolean;
  lastChallenge: number;
  teeVerified: boolean;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  pes: PESScore;
  trust: TrustProfile;
  scoreFactors: ScoreFactor[];
  devices: Device[];
  trainingStatus: TrainingStatus;
  weeklyMetrics: WeeklyMetrics;
  createdAt: number;
  lastActive: number;
}

// ============================================
// GATE DISTRIBUTION & ANALYTICS
// ============================================

export interface GateDistribution {
  auto: number;
  confirm: number;
  quarantine: number;
}

export interface ProofSourceAnalysis {
  nfc: number;
  ble: number;
  wifi: number;
  geo: number;
}

export interface SystemHealth {
  gavl: LayerStatus;
  aiCongruency: LayerStatus;
  deviceAttestation: LayerStatus;
  trustIndex: LayerStatus;
  audit: LayerStatus;
  overallStatus: 'online' | 'degraded' | 'offline';
}

// ============================================
// UI STATE TYPES
// ============================================

export type ViewType =
  | 'overview'
  | 'score'
  | 'protocol'
  | 'congruency'
  | 'metrics'
  | 'ledger'
  | 'session-init'
  | 'session-active'
  | 'initiate'
  | 'active'
  | 'trust'
  | 'login';

export interface AppState {
  currentView: ViewType;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ============================================
// EQUITY STATEMENT TYPES
// ============================================

export interface EquityStatement {
  id: string;
  month: number;
  year: number;
  totalSessions: number;
  totalPesGenerated: number;
  assetAppreciation: number;
  consistencyScore: number;
  volatilityIndex: 'Low' | 'Medium' | 'High';
  status: 'Audited' | 'Pending';
  generatedAt: number;
}

// ============================================
// SYNDICATE TYPES
// ============================================

export interface Syndicate {
  id: string;
  name: string;
  description: string;
  minTier: TrustTier;
  minPes: number;
  members: number;
  avgYield: number;
  isMember: boolean;
  locked: boolean;
}

// ============================================
// UTILITY TYPES
// ============================================

export interface TimeRange {
  start: number;
  end: number;
  label: string;
}

export type TimeRangePreset = '7d' | '30d' | '90d' | '1y' | 'all';

export interface FilterOptions {
  gates?: GateType[];
  activityTypes?: string[];
  dateRange?: TimeRange;
  minScs?: number;
  maxScs?: number;
}
