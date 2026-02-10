/**
 * GAVL Sessions Cleanup API Endpoint
 *
 * Deletes specific sessions by ID from user history.
 * Used for clearing test data.
 *
 * POST /api/sessions-cleanup
 * { "userId": "marc", "keepSessionIds": ["SC-XXX", "SC-YYY"] }
 */

// =============================================================================
// TYPES
// =============================================================================

interface Anchor {
  type: 'geofence' | 'nfc';
  boost: number;
  timestamp: number;
}

interface SessionCandidate {
  id: string;
  userId: string;
  gymId: string;
  gymName: string;
  anchors: Anchor[];
  scsBoost: number;
  status: 'pending' | 'active' | 'finalized';
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  endedAt?: number;
  duration?: number;
}

// =============================================================================
// STORAGE LAYER
// =============================================================================

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

function isUpstashConfigured(): boolean {
  return !!(UPSTASH_URL && UPSTASH_TOKEN);
}

async function getHistory(userId: string): Promise<SessionCandidate[]> {
  const historyKey = `history:${userId}`;
  if (isUpstashConfigured()) {
    try {
      const res = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(historyKey)}`, {
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      });
      const data = await res.json();
      if (data.result) {
        return JSON.parse(data.result);
      }
    } catch (err) {
      console.error('[Storage] Redis history GET error:', err);
    }
  }
  return [];
}

async function setHistory(userId: string, sessions: SessionCandidate[]): Promise<boolean> {
  const historyKey = `history:${userId}`;
  if (isUpstashConfigured()) {
    try {
      const res = await fetch(`${UPSTASH_URL}/set/${encodeURIComponent(historyKey)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
        body: JSON.stringify(sessions),
      });
      const data = await res.json();
      return data.result === 'OK';
    } catch (err) {
      console.error('[Storage] Redis history SET error:', err);
      return false;
    }
  }
  return false;
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const { userId, keepSessionIds } = req.body || {};

    if (!userId || !Array.isArray(keepSessionIds)) {
      return res.status(400).json({
        success: false,
        error: 'Required: userId (string), keepSessionIds (array of session IDs to keep)',
      });
    }

    const history = await getHistory(userId);
    const before = history.length;

    const filtered = history.filter(s => keepSessionIds.includes(s.id));
    const removed = before - filtered.length;

    const saved = await setHistory(userId, filtered);

    return res.status(200).json({
      success: saved,
      before,
      after: filtered.length,
      removed,
      kept: filtered.map(s => ({ id: s.id, gym: s.gymName, duration: s.duration })),
    });
  } catch (error) {
    console.error('[GAVL] Cleanup error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
