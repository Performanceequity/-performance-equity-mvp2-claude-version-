/**
 * GAVL Gym Check-in API Endpoint
 *
 * Called by Apple Shortcuts when arriving at a gym via geofence or NFC tap.
 * Creates a SessionCandidate with appropriate SCS boost based on anchor type.
 *
 * POST /api/gym-checkin
 * Body: { userId, gymId, anchorType, timestamp }
 */

// Gym definitions with coordinates for future validation
const GYMS: Record<string, { name: string; address: string; coords?: [number, number] }> = {
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
  geofence: 0.15, // Open anchor - medium trust
  nfc: 0.25,      // Closed anchor - high trust
};

// Session candidate storage (in-memory for demo; replace with DB later)
interface SessionCandidate {
  id: string;
  userId: string;
  gymId: string;
  gymName: string;
  anchorType: 'geofence' | 'nfc';
  scsBoost: number;
  status: 'pending' | 'active' | 'finalized';
  createdAt: number;
  expiresAt: number;
}

// In-memory store (will reset on cold start - fine for demo)
const sessionCandidates: Map<string, SessionCandidate> = new Map();

// Generate a simple session ID
function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `SC-${timestamp}-${random}`.toUpperCase();
}

// Request body interface
interface CheckinRequest {
  userId?: string;
  gymId?: string;
  anchorType?: string;
  timestamp?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function handler(req: any, res: any) {
  // CORS headers for Apple Shortcuts
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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

    // Validate required fields
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

    if (!anchorType || !['geofence', 'nfc'].includes(anchorType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid anchorType. Must be "geofence" or "nfc".',
      });
    }

    // Validate gym exists
    const gym = GYMS[gymId];
    if (!gym) {
      return res.status(400).json({
        success: false,
        error: `Unknown gymId: ${gymId}. Valid gyms: ${Object.keys(GYMS).join(', ')}`,
      });
    }

    // Calculate SCS boost
    const scsBoost = SCS_BOOSTS[anchorType];

    // Create session candidate
    const sessionId = generateSessionId();
    const now = timestamp ? new Date(timestamp).getTime() : Date.now();
    const expiresAt = now + 4 * 60 * 60 * 1000; // 4 hours from check-in

    const candidate: SessionCandidate = {
      id: sessionId,
      userId,
      gymId,
      gymName: gym.name,
      anchorType: anchorType as 'geofence' | 'nfc',
      scsBoost,
      status: 'pending',
      createdAt: now,
      expiresAt,
    };

    // Store the candidate
    sessionCandidates.set(sessionId, candidate);

    // Log for debugging (visible in Vercel logs)
    console.log(`[GAVL] Check-in: ${gym.name} | Anchor: ${anchorType} | SCS Boost: +${scsBoost} | Session: ${sessionId}`);

    return res.status(200).json({
      success: true,
      sessionId,
      anchorType,
      scsBoost,
      gym: {
        id: gymId,
        name: gym.name,
      },
      message: `Checked in at ${gym.name}. Session candidate created with +${scsBoost} SCS boost.`,
      expiresAt: new Date(expiresAt).toISOString(),
    });
  } catch (error) {
    console.error('[GAVL] Check-in error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
