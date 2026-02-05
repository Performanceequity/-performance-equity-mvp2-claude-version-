/**
 * GAVL Gym Checkout API Endpoint
 *
 * Called by Apple Shortcuts when leaving a gym (geofence exit).
 * Finalizes the existing open SessionCandidate and records endTime.
 *
 * POST /api/gym-checkout
 * Body: { userId, gymId, timestamp? }
 */

// =============================================================================
// CONFIGURATION (must match gym-checkin.ts)
// =============================================================================

const GYMS: Record<string, { name: string }> = {
  'golds-venice': { name: "Gold's Gym Venice" },
  'jfm-boxing': { name: 'JFM Boxing Club' },
  'gracie-originals': { name: 'Gracie Originals' },
};

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

interface CheckoutRequest {
  userId?: string;
  gymId?: string;
  timestamp?: string;
}

// =============================================================================
// STORAGE LAYER (must match gym-checkin.ts)
// =============================================================================

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const memoryStore: Map<string, SessionCandidate> = new Map();

function isUpstashConfigured(): boolean {
  return !!(UPSTASH_URL && UPSTASH_TOKEN);
}

async function redisGet(key: string): Promise<SessionCandidate | null> {
  if (!isUpstashConfigured()) {
    return memoryStore.get(key) || null;
  }

  try {
    const res = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    });
    const data = await res.json();
    return data.result ? JSON.parse(data.result) : null;
  } catch (err) {
    console.error('[Storage] Redis GET error:', err);
    return memoryStore.get(key) || null;
  }
}

async function redisSet(key: string, value: SessionCandidate, ttlSeconds: number): Promise<void> {
  memoryStore.set(key, value);

  if (!isUpstashConfigured()) {
    return;
  }

  try {
    await fetch(`${UPSTASH_URL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['SET', key, JSON.stringify(value), 'EX', ttlSeconds.toString()]),
    });
  } catch (err) {
    console.error('[Storage] Redis SET error:', err);
  }
}

// Also store finalized sessions in a history list
async function appendToHistory(userId: string, session: SessionCandidate): Promise<void> {
  const historyKey = `history:${userId}`;

  // Get existing history
  let history: SessionCandidate[] = [];
  if (isUpstashConfigured()) {
    try {
      const res = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(historyKey)}`, {
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      });
      const data = await res.json();
      if (data.result) {
        history = JSON.parse(data.result);
      }
    } catch (err) {
      console.error('[Storage] Redis history GET error:', err);
    }
  } else {
    const existing = memoryStore.get(historyKey);
    if (existing) {
      history = existing as unknown as SessionCandidate[];
    }
  }

  // Append new session (keep last 50)
  history.push(session);
  if (history.length > 50) {
    history = history.slice(-50);
  }

  // Save history
  if (isUpstashConfigured()) {
    try {
      await fetch(`${UPSTASH_URL}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['SET', historyKey, JSON.stringify(history), 'EX', '2592000']), // 30 days
      });
    } catch (err) {
      console.error('[Storage] Redis history SET error:', err);
    }
  } else {
    memoryStore.set(historyKey, history as unknown as SessionCandidate);
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getSessionKey(userId: string, gymId: string): string {
  return `session:${userId}:${gymId}`;
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
    });
  }

  try {
    const body: CheckoutRequest = req.body || {};
    const { userId, gymId, timestamp } = body;

    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: userId',
      });
    }

    if (!gymId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: gymId',
      });
    }

    const gym = GYMS[gymId];
    if (!gym) {
      return res.status(400).json({
        success: false,
        error: `Unknown gymId: ${gymId}`,
      });
    }

    // Find existing session
    const sessionKey = getSessionKey(userId, gymId);
    const session = await redisGet(sessionKey);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: `No open session found for ${gym.name}. Did you check in first?`,
      });
    }

    if (session.status === 'finalized') {
      return res.status(400).json({
        success: false,
        error: 'Session already finalized.',
        sessionId: session.id,
      });
    }

    // Finalize the session
    const now = timestamp ? new Date(timestamp).getTime() : Date.now();
    session.status = 'finalized';
    session.endedAt = now;
    session.updatedAt = now;
    session.duration = Math.round((now - session.createdAt) / 1000 / 60); // minutes

    // Save finalized session (keep for 24h for history access)
    await redisSet(sessionKey, session, 24 * 60 * 60);

    // Append to user's history
    await appendToHistory(userId, session);

    console.log(`[GAVL] Session FINALIZED | ${gym.name} | Duration: ${session.duration}min | SCS: +${session.scsBoost} | Session: ${session.id}`);

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      gym: {
        id: gymId,
        name: gym.name,
      },
      anchors: session.anchors.map(a => ({ type: a.type, boost: a.boost })),
      scsBoost: session.scsBoost,
      status: 'finalized',
      startedAt: new Date(session.createdAt).toISOString(),
      endedAt: new Date(session.endedAt).toISOString(),
      duration: session.duration,
      message: `Session finalized at ${gym.name}. Duration: ${session.duration} minutes.`,
    });
  } catch (error) {
    console.error('[GAVL] Checkout error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
