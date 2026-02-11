/**
 * GAVL Sessions History API Endpoint
 *
 * Read-only endpoint to retrieve session history for a user.
 * Used for demo screenshots and audit trail.
 *
 * GET /api/sessions?userId=marc
 * GET /api/sessions?userId=marc&limit=10
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
// STORAGE LAYER (read-only, must match other endpoints)
// =============================================================================

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const memoryStore: Map<string, unknown> = new Map();

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
  } else {
    const existing = memoryStore.get(historyKey);
    if (existing) {
      return existing as SessionCandidate[];
    }
  }

  return [];
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET.',
    });
  }

  try {
    const userId = req.query?.userId as string;
    const limit = parseInt(req.query?.limit as string) || 20;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query parameter: userId',
      });
    }

    // Get history
    const history = await getHistory(userId);

    // Sort by most recent first, apply limit
    const sorted = history
      .sort((a, b) => (b.endedAt || b.createdAt) - (a.endedAt || a.createdAt))
      .slice(0, limit);

    // Format for display
    const sessions = sorted.map(s => ({
      sessionId: s.id,
      gym: {
        id: s.gymId,
        name: s.gymName,
      },
      anchors: s.anchors.map(a => ({
        type: a.type,
        boost: a.boost,
        timestamp: new Date(a.timestamp).toISOString(),
      })),
      scsBoost: s.scsBoost,
      status: s.status,
      startedAt: new Date(s.createdAt).toISOString(),
      endedAt: s.endedAt ? new Date(s.endedAt).toISOString() : null,
      duration: s.duration || null,
    }));

    return res.status(200).json({
      success: true,
      userId,
      count: sessions.length,
      sessions,
      storage: isUpstashConfigured() ? 'redis' : 'memory',
    });
  } catch (error) {
    console.error('[GAVL] Sessions error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
