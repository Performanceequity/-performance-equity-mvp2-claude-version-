/**
 * GAVL Smart NFC Tap Endpoint
 *
 * Single endpoint for NFC tag taps. The server decides check-in vs checkout
 * based on session state:
 *
 *   - No active session → CHECK IN (create session with NFC anchor, +0.25)
 *   - Active session without NFC → UPGRADE (add NFC anchor, +0.25)
 *   - Active session with NFC already → CHECK OUT (finalize with NFC exit, +0.15)
 *
 * One tag. One shortcut. One URL. Tap in, tap out.
 *
 * POST /api/gym-tap
 * Body: { userId, gymId }
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const GYMS: Record<string, { name: string; address: string; coords: [number, number] }> = {
  'golds-venice': {
    name: "Gold's Gym Venice",
    address: '360 Hampton Dr, Venice, CA 90291',
    coords: [33.9925, -118.4695],
  },
  'jfm-boxing': {
    name: 'JFM Boxing Club',
    address: '3127 Washington Blvd Unit 1, Venice, CA 90292',
    coords: [33.9983, -118.4518],
  },
  'gracie-originals': {
    name: 'Gracie Originals',
    address: '1934 14th St, Santa Monica, CA 90404',
    coords: [34.0195, -118.4695],
  },
};

const SESSION_TTL_HOURS = 4;
const SESSION_TTL_MS = SESSION_TTL_HOURS * 60 * 60 * 1000;

// =============================================================================
// TYPES
// =============================================================================

interface Anchor {
  type: 'geofence' | 'nfc' | 'nfc_exit' | 'geofence_exit';
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
// STORAGE LAYER (Upstash Redis with in-memory fallback)
// =============================================================================

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const memoryStore: Map<string, unknown> = new Map();

function isUpstashConfigured(): boolean {
  return !!(UPSTASH_URL && UPSTASH_TOKEN);
}

async function redisGet(key: string): Promise<SessionCandidate | null> {
  if (!isUpstashConfigured()) {
    return (memoryStore.get(key) as SessionCandidate) || null;
  }
  try {
    const res = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    });
    const data = await res.json();
    return data.result ? JSON.parse(data.result) : null;
  } catch (err) {
    console.error('[Storage] Redis GET error:', err);
    return (memoryStore.get(key) as SessionCandidate) || null;
  }
}

async function redisSet(key: string, value: SessionCandidate, ttlSeconds: number): Promise<void> {
  memoryStore.set(key, value);
  if (!isUpstashConfigured()) return;
  try {
    await fetch(`${UPSTASH_URL}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['SET', key, JSON.stringify(value), 'EX', ttlSeconds.toString()]),
    });
  } catch (err) {
    console.error('[Storage] Redis SET error:', err);
  }
}

async function appendToHistory(userId: string, session: SessionCandidate): Promise<void> {
  const historyKey = `history:${userId}`;
  let history: SessionCandidate[] = [];

  if (isUpstashConfigured()) {
    try {
      const res = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(historyKey)}`, {
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      });
      const data = await res.json();
      if (data.result) history = JSON.parse(data.result);
    } catch (err) {
      console.error('[Storage] Redis history GET error:', err);
    }
  }

  history.push(session);
  if (history.length > 50) history = history.slice(-50);

  if (isUpstashConfigured()) {
    try {
      await fetch(`${UPSTASH_URL}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(['SET', historyKey, JSON.stringify(history), 'EX', '2592000']),
      });
    } catch (err) {
      console.error('[Storage] Redis history SET error:', err);
    }
  }
}

// =============================================================================
// HELPERS
// =============================================================================

function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `SC-${timestamp}-${random}`.toUpperCase();
}

function getSessionKey(userId: string, gymId: string): string {
  return `session:${userId}:${gymId}`;
}

function hasAnchorType(session: SessionCandidate, type: string): boolean {
  return session.anchors.some(a => a.type === type);
}

function calculateBoost(anchors: Anchor[]): number {
  return anchors.reduce((sum, a) => sum + a.boost, 0);
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const { userId, gymId } = req.body || {};

    if (!userId) return res.status(400).json({ success: false, error: 'Missing: userId' });
    if (!gymId) return res.status(400).json({ success: false, error: 'Missing: gymId' });

    const gym = GYMS[gymId];
    if (!gym) {
      return res.status(400).json({
        success: false,
        error: `Unknown gymId: ${gymId}. Valid: ${Object.keys(GYMS).join(', ')}`,
      });
    }

    const now = Date.now();
    const sessionKey = getSessionKey(userId, gymId);
    const session = await redisGet(sessionKey);

    // =========================================================================
    // DECISION: What does this tap mean?
    // =========================================================================

    // CASE 1: No active session → NFC CHECK-IN (create new session)
    if (!session || session.status === 'finalized' || now > session.expiresAt) {
      const newSession: SessionCandidate = {
        id: generateSessionId(),
        userId,
        gymId,
        gymName: gym.name,
        anchors: [{ type: 'nfc', boost: 0.25, timestamp: now }],
        scsBoost: 0.25,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        expiresAt: now + SESSION_TTL_MS,
      };

      await redisSet(sessionKey, newSession, SESSION_TTL_HOURS * 60 * 60);
      console.log(`[GAVL-TAP] NFC CHECK-IN | ${gym.name} | Session: ${newSession.id}`);

      return res.status(200).json({
        success: true,
        action: 'nfc_checkin',
        sessionId: newSession.id,
        anchors: newSession.anchors.map(a => ({ type: a.type, boost: a.boost })),
        scsBoost: newSession.scsBoost,
        gym: { id: gymId, name: gym.name },
        message: `NFC check-in at ${gym.name}. Session created with +0.25 SCS boost.`,
        storage: isUpstashConfigured() ? 'redis' : 'memory',
      });
    }

    // CASE 2: Active session WITHOUT NFC → NFC UPGRADE (add NFC anchor)
    if (session.status === 'pending' && !hasAnchorType(session, 'nfc')) {
      session.anchors.push({ type: 'nfc', boost: 0.25, timestamp: now });
      session.scsBoost = Math.min(calculateBoost(session.anchors), 0.65);
      session.updatedAt = now;

      const ttlSeconds = Math.ceil((session.expiresAt - now) / 1000);
      await redisSet(sessionKey, session, ttlSeconds);
      console.log(`[GAVL-TAP] NFC UPGRADE | ${gym.name} | SCS: +${session.scsBoost} | Session: ${session.id}`);

      return res.status(200).json({
        success: true,
        action: 'nfc_upgrade',
        sessionId: session.id,
        anchors: session.anchors.map(a => ({ type: a.type, boost: a.boost })),
        scsBoost: session.scsBoost,
        gym: { id: gymId, name: gym.name },
        message: `NFC upgrade at ${gym.name}. Session now +${session.scsBoost} SCS boost.`,
        storage: isUpstashConfigured() ? 'redis' : 'memory',
      });
    }

    // CASE 3: Active session WITH NFC already → NFC CHECKOUT (finalize)
    if (session.status === 'pending' && hasAnchorType(session, 'nfc')) {
      session.anchors.push({ type: 'nfc_exit', boost: 0.15, timestamp: now });
      session.scsBoost = Math.min(calculateBoost(session.anchors), 0.65);
      session.status = 'finalized';
      session.endedAt = now;
      session.updatedAt = now;
      session.duration = Math.round((now - session.createdAt) / 1000 / 60);

      await redisSet(sessionKey, session, 24 * 60 * 60);
      await appendToHistory(userId, session);
      console.log(`[GAVL-TAP] NFC CHECKOUT | ${gym.name} | Duration: ${session.duration}min | SCS: +${session.scsBoost} | Session: ${session.id}`);

      return res.status(200).json({
        success: true,
        action: 'nfc_checkout',
        sessionId: session.id,
        anchors: session.anchors.map(a => ({ type: a.type, boost: a.boost })),
        scsBoost: session.scsBoost,
        gym: { id: gymId, name: gym.name },
        status: 'finalized',
        startedAt: new Date(session.createdAt).toISOString(),
        endedAt: new Date(session.endedAt).toISOString(),
        duration: session.duration,
        message: `NFC checkout at ${gym.name}. Session finalized. Duration: ${session.duration} minutes.`,
        storage: isUpstashConfigured() ? 'redis' : 'memory',
      });
    }

    // Fallback (shouldn't reach here)
    return res.status(400).json({ success: false, error: 'Unexpected session state.' });

  } catch (error) {
    console.error('[GAVL-TAP] Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
