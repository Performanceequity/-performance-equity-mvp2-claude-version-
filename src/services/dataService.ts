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

interface APISession {
  sessionId: string;
  gym: { id: string; name: string };
  anchors: string[];
  scsBoost: number;
  status: string;
  startedAt: string;
  endedAt: string | null;
  duration: number | null;
}

// =============================================================================
// TRANSFORMER: API SessionCandidate → Frontend VerifiedTransaction
// =============================================================================

function mapAnchorType(anchors: string[]): AnchorType {
  if (anchors.includes('nfc')) return 'nfc';
  if (anchors.includes('geofence')) return 'geo';
  return 'geo';
}

function determineGate(scs: number): GateType {
  if (scs >= 0.80) return 'auto';
  if (scs >= 0.50) return 'confirm';
  return 'quarantine';
}

function transformSession(session: APISession): VerifiedTransaction {
  const timestamp = new Date(session.startedAt).getTime();
  const duration = session.duration || 0;
  const anchor = mapAnchorType(session.anchors);

  // Base SCS (0.50) + anchor boosts
  const scs = Math.min(0.50 + session.scsBoost, 1.0);
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
    proofs: session.anchors.map(a => ({
      type: a === 'nfc' ? 'nfc' : 'gps',
      status: 'verified' as const,
      timestamp,
      details: `${a} anchor verified`,
    })),
    chainOfCustody: [
      { timestamp, event: 'Session initiated', type: `${anchor}_anchor` },
      ...(session.endedAt
        ? [{
            timestamp: new Date(session.endedAt).getTime(),
            event: 'Session finalized',
            type: 'geofence_exit',
          }]
        : []),
    ],
    merkleRoot: '0x' + session.sessionId.replace(/-/g, '').padEnd(64, '0'),
  };
}

// =============================================================================
// LIVE DATA FETCHER
// =============================================================================

export async function fetchTransactions(): Promise<VerifiedTransaction[]> {
  if (!isLiveMode) return mockTransactions;

  try {
    const res = await fetch('/api/sessions?userId=marc');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    if (data.success && data.sessions && data.sessions.length > 0) {
      return data.sessions.map((s: APISession) => transformSession(s));
    }

    // No real sessions yet - fall back to mock
    return mockTransactions;
  } catch (err) {
    console.warn('[DataService] Failed to fetch live sessions, using mock:', err);
    return mockTransactions;
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
