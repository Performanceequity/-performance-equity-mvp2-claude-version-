/**
 * GAVL Gym Check-in API Endpoint
 *
 * Called by Apple Shortcuts when arriving at a gym via geofence or NFC tap.
 * Creates or UPGRADES a SessionCandidate with appropriate SCS boost.
 *
 * UPGRADE LOGIC:
 * - If an open session exists for this user+gym (within 4hr window), add anchor to it
 * - Anchors STACK: geofence (+0.15) + NFC (+0.25) + WiFi BSSID (+0.10) = +0.50 total
 * - Cap at 0.65 max SCS boost per session (full chain with exit anchors)
 *
 * POST /api/gym-checkin
 * Body: { userId, gymId, anchorType, timestamp }
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

// SCS boost values per anchor type (from GAVL Signal Ladder)
const SCS_BOOSTS: Record<string, number> = {
  geofence: 0.15,    // Open anchor - medium trust
  nfc: 0.25,         // Closed anchor - high trust
  wifi_bssid: 0.10,  // Open anchor - environmental signal, auto-connect
};

const MAX_SCS_BOOST = 0.65; // Cap for stacked anchors (full chain max)
const SESSION_TTL_HOURS = 4;
const SESSION_TTL_MS = SESSION_TTL_HOURS * 60 * 60 * 1000;

// =============================================================================
// TYPES
// =============================================================================

interface Anchor {
  type: 'geofence' | 'nfc' | 'wifi_bssid';
  boost: number;
  timestamp: number;
}

interface SessionCandidate {
  id: string;
  userId: string;
  gymId: string;
  gymName: string;
  anchors: Anchor[];
  scsBoost: number;        // Aggregated, capped at MAX_SCS_BOOST
  status: 'pending' | 'active' | 'finalized';
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
}

interface CheckinRequest {
  userId?: string;
  gymId?: string;
  anchorType?: string;
  timestamp?: string;
}

// =============================================================================
// STORAGE LAYER (Upstash Redis with in-memory fallback)
// =============================================================================

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// In-memory fallback (for local dev or if Upstash not configured)
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
  // Always update memory store as backup
  memoryStore.set(key, value);

  if (!isUpstashConfigured()) {
    console.log('[Storage] Using in-memory store (Upstash not configured)');
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

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `SC-${timestamp}-${random}`.toUpperCase();
}

// Session key: unique per user + gym (only one open session per location)
function getSessionKey(userId: string, gymId: string): string {
  return `session:${userId}:${gymId}`;
}

function calculateStackedBoost(anchors: Anchor[]): number {
  const total = anchors.reduce((sum, a) => sum + a.boost, 0);
  return Math.min(total, MAX_SCS_BOOST);
}

function isSessionExpired(session: SessionCandidate): boolean {
  return Date.now() > session.expiresAt;
}

function hasAnchorType(session: SessionCandidate, type: 'geofence' | 'nfc' | 'wifi_bssid'): boolean {
  return session.anchors.some(a => a.type === type);
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  // CORS headers for Apple Shortcuts
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle CORS preflight
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
    const body: CheckinRequest = req.body || {};
    const { userId, gymId, anchorType, timestamp } = body;

    // -------------------------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------------------------

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

    if (!anchorType || !['geofence', 'nfc', 'wifi_bssid'].includes(anchorType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid anchorType. Must be "geofence", "nfc", or "wifi_bssid".',
      });
    }

    const gym = GYMS[gymId];
    if (!gym) {
      return res.status(400).json({
        success: false,
        error: `Unknown gymId: ${gymId}. Valid gyms: ${Object.keys(GYMS).join(', ')}`,
      });
    }

    // -------------------------------------------------------------------------
    // CHECK FOR EXISTING SESSION
    // -------------------------------------------------------------------------

    // INVARIANT: Multiple anchors may increase confidence on an existing
    // SessionCandidate but must never create additional sessions for the
    // same visit window. This is the Guardian contract.

    const now = timestamp ? new Date(timestamp).getTime() : Date.now();
    const sessionKey = getSessionKey(userId, gymId);
    const existingSession = await redisGet(sessionKey);

    const anchorBoost = SCS_BOOSTS[anchorType];
    const newAnchor: Anchor = {
      type: anchorType as 'geofence' | 'nfc' | 'wifi_bssid',
      boost: anchorBoost,
      timestamp: now,
    };

    let session: SessionCandidate;
    let action: 'created' | 'upgraded' | 'duplicate';

    if (existingSession && !isSessionExpired(existingSession) && existingSession.status === 'pending') {
      // -----------------------------------------------------------------------
      // UPGRADE EXISTING SESSION
      // -----------------------------------------------------------------------

      // Check if this anchor type already exists
      if (hasAnchorType(existingSession, anchorType as 'geofence' | 'nfc' | 'wifi_bssid')) {
        // Duplicate anchor - don't add again, but return success
        action = 'duplicate';
        session = existingSession;
        console.log(`[GAVL] Duplicate ${anchorType} anchor ignored | Session: ${session.id}`);
      } else {
        // Add new anchor type, recalculate boost
        existingSession.anchors.push(newAnchor);
        existingSession.scsBoost = calculateStackedBoost(existingSession.anchors);
        existingSession.updatedAt = now;

        session = existingSession;
        action = 'upgraded';

        // Save updated session
        const ttlSeconds = Math.ceil((session.expiresAt - now) / 1000);
        await redisSet(sessionKey, session, ttlSeconds);

        console.log(`[GAVL] Session UPGRADED | ${gym.name} | +${anchorType} | Total SCS: +${session.scsBoost} | Session: ${session.id}`);
      }
    } else {
      // -----------------------------------------------------------------------
      // CREATE NEW SESSION
      // -----------------------------------------------------------------------

      session = {
        id: generateSessionId(),
        userId,
        gymId,
        gymName: gym.name,
        anchors: [newAnchor],
        scsBoost: anchorBoost,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        expiresAt: now + SESSION_TTL_MS,
      };

      action = 'created';

      // Save new session
      const ttlSeconds = SESSION_TTL_HOURS * 60 * 60;
      await redisSet(sessionKey, session, ttlSeconds);

      console.log(`[GAVL] Session CREATED | ${gym.name} | ${anchorType} | SCS: +${session.scsBoost} | Session: ${session.id}`);
    }

    // -------------------------------------------------------------------------
    // RESPONSE
    // -------------------------------------------------------------------------

    const anchorSummary = session.anchors.map(a => a.type).join(' + ');

    return res.status(200).json({
      success: true,
      action,
      sessionId: session.id,
      anchors: session.anchors.map(a => ({ type: a.type, boost: a.boost })),
      scsBoost: session.scsBoost,
      gym: {
        id: gymId,
        name: gym.name,
      },
      message: action === 'created'
        ? `Checked in at ${gym.name}. Session created with +${session.scsBoost} SCS boost (${anchorType}).`
        : action === 'upgraded'
        ? `Session upgraded at ${gym.name}. Now +${session.scsBoost} SCS boost (${anchorSummary}).`
        : `Already checked in with ${anchorType} at ${gym.name}. Session unchanged.`,
      expiresAt: new Date(session.expiresAt).toISOString(),
      storage: isUpstashConfigured() ? 'redis' : 'memory',
    });
  } catch (error) {
    console.error('[GAVL] Check-in error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
