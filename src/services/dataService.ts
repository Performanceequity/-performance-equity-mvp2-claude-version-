/**
 * DATA SERVICE LAYER
 *
 * Demo mode: returns mock data (always polished, investor-ready)
 * Live mode: fetches real API data where available, falls back to mock
 */

import { isLiveMode } from '../config';
import type { VerifiedTransaction, AnchorType, GateType, SessionStatus } from '../types';
import {
  mockUser,
  mockGAVLLayers,
  mockTransactions,
  mockSystemHealth,
  mockGateDistribution,
  mockCongruencyResult,
  mockPhysiologicalBaseline,
  mockTrainingStatus,
  mockWeeklyMetrics,
  mockZoneDistribution,
  generateScoreHistory,
  generateActivityCalendar,
  generateWeeklyTrends,
  mockEquityStatements,
  mockPEBalance,
  mockRecentPETransactions,
} from './mockData';

// =============================================================================
// API RESPONSE TYPES (matches GET /api/sessions response)
// =============================================================================

interface APIAnchor {
  type: string;
  boost: number;
  timestamp: string;
}

interface APISession {
  sessionId: string;
  gym: { id: string; name: string };
  anchors: APIAnchor[] | string[];  // Support both old (string[]) and new (object[]) format
  scsBoost: number;
  status: string;
  startedAt: string;
  endedAt: string | null;
  duration: number | null;
}

// =============================================================================
// TRANSFORMER: API SessionCandidate → Frontend VerifiedTransaction
// =============================================================================

// Normalize anchors from API (handles both old string[] and new object[] format)
function parseAnchors(anchors: APIAnchor[] | string[], sessionStart: string): APIAnchor[] {
  if (anchors.length === 0) return [];
  if (typeof anchors[0] === 'string') {
    // Old format: string array — convert to objects
    return (anchors as string[]).map(a => ({
      type: a,
      boost: a === 'nfc' ? 0.25 : 0.15,
      timestamp: sessionStart,
    }));
  }
  return anchors as APIAnchor[];
}

function mapAnchorType(anchors: APIAnchor[]): AnchorType {
  // Return highest-confidence anchor for main display
  if (anchors.some(a => a.type === 'nfc')) return 'nfc';
  if (anchors.some(a => a.type === 'geofence')) return 'geo';
  return 'geo';
}

function determineGate(scs: number): GateType {
  if (scs >= 0.80) return 'auto';
  if (scs >= 0.50) return 'confirm';
  return 'quarantine';
}

// Map API anchor types to display names for chain of custody
function anchorEventName(type: string): string {
  switch (type) {
    case 'geofence': return 'Geofence anchor (arrive)';
    case 'nfc': return 'NFC anchor (tap verified)';
    case 'geofence_exit': return 'Geofence anchor (exit)';
    default: return `${type} anchor`;
  }
}

function anchorProofType(type: string): string {
  switch (type) {
    case 'nfc': return 'nfc';
    case 'geofence': return 'gps';
    case 'geofence_exit': return 'gps';
    default: return 'gps';
  }
}

function transformSession(session: APISession): VerifiedTransaction {
  const timestamp = new Date(session.startedAt).getTime();
  const duration = session.duration || 0;
  const anchors = parseAnchors(session.anchors, session.startedAt);
  const anchor = mapAnchorType(anchors);

  // Base SCS (0.50) + anchor boosts, cap at 0.95
  const scs = Math.min(0.50 + session.scsBoost, 0.95);
  const gate = determineGate(scs);

  const status: SessionStatus =
    session.status === 'finalized' ? 'finalized' : 'candidate';

  return {
    id: session.sessionId.replace('SC-', '').slice(0, 8).toLowerCase(),
    uid: 'marc',
    timestamp,
    type: 'Gym Session',
    duration,
    zone: 'Z3', // Default until wearable data connected
    location: {
      name: session.gym.name,
      anchor,
    },
    scs,
    gate,
    pesDelta: gate === 'quarantine' ? 0 : Math.round(duration * 0.08 * 10) / 10,
    status,
    // Build proofs from EVERY anchor in the session
    proofs: anchors.map(a => ({
      type: anchorProofType(a.type),
      status: 'verified' as const,
      timestamp: new Date(a.timestamp).getTime(),
      details: anchorEventName(a.type),
    })),
    // Build chain of custody from EVERY anchor with its real timestamp
    chainOfCustody: anchors.map(a => ({
      timestamp: new Date(a.timestamp).getTime(),
      event: anchorEventName(a.type),
      type: a.type === 'nfc' ? 'nfc_anchor' : a.type === 'geofence_exit' ? 'geofence_exit' : 'geo_anchor',
    })),
    merkleRoot: '0x' + session.sessionId.replace(/-/g, '').padEnd(64, '0'),
  };
}

// =============================================================================
// LIVE DATA FETCHER
// =============================================================================

export type DataSource = 'live' | 'mock';

export interface TransactionResult {
  transactions: VerifiedTransaction[];
  source: DataSource;
}

export async function fetchTransactions(): Promise<TransactionResult> {
  if (!isLiveMode) return { transactions: mockTransactions, source: 'mock' };

  try {
    const res = await fetch('/api/sessions?userId=marc');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    if (data.success && data.sessions && data.sessions.length > 0) {
      return {
        transactions: data.sessions.map((s: APISession) => transformSession(s)),
        source: 'live',
      };
    }

    // No real sessions yet - fall back to mock
    return { transactions: mockTransactions, source: 'mock' };
  } catch (err) {
    console.warn('[DataService] Failed to fetch live sessions, using mock:', err);
    return { transactions: mockTransactions, source: 'mock' };
  }
}

// =============================================================================
// MOCK PASSTHROUGHS (replace these as more APIs come online)
// =============================================================================

export function getUser() { return mockUser; }
export function getGAVLLayers() { return mockGAVLLayers; }
export function getSystemHealth() { return mockSystemHealth; }
export function getGateDistribution() { return mockGateDistribution; }
export function getCongruencyResult() { return mockCongruencyResult; }
export function getPhysiologicalBaseline() { return mockPhysiologicalBaseline; }
export function getTrainingStatus() { return mockTrainingStatus; }
export function getWeeklyMetrics() { return mockWeeklyMetrics; }
export function getZoneDistribution() { return mockZoneDistribution; }
export function getScoreHistory() { return generateScoreHistory(); }
export function getActivityCalendar() { return generateActivityCalendar(); }
export function getWeeklyTrends() { return generateWeeklyTrends(); }
export function getEquityStatements() { return mockEquityStatements; }
export function getPEBalance() { return mockPEBalance; }
export function getRecentPETransactions() { return mockRecentPETransactions; }
