/**
 * GAVL Workout History API Endpoint
 *
 * Read-only endpoint to retrieve ingested workout history for a user.
 * Companion to /api/workout-ingest.
 *
 * GET /api/workouts?userId=marc
 * GET /api/workouts?userId=marc&limit=20
 * GET /api/workouts?userId=marc&activityType=running
 */

// =============================================================================
// TYPES
// =============================================================================

interface WorkoutRecord {
  id: string;
  userId: string;
  source: string;
  activityType: string;
  subActivity?: string;
  startTime: number;
  endTime: number;
  duration: number;
  distance?: number;
  calories?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  minHeartRate?: number;
  avgSpeed?: number;
  maxSpeed?: number;
  avgCadence?: number;
  totalAscent?: number;
  totalDescent?: number;
  hrZones?: number[];
  trainingEffect?: number;
  deviceManufacturer?: string;
  recordCount?: number;
  laps?: { lapNumber: number; startTime: number; duration: number; distance?: number; avgHeartRate?: number; maxHeartRate?: number; avgSpeed?: number; calories?: number }[];
  createdAt: number;
}

// =============================================================================
// STORAGE LAYER (read-only, must match workout-ingest)
// =============================================================================

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const memoryStore: Map<string, unknown> = new Map();

function isUpstashConfigured(): boolean {
  return !!(UPSTASH_URL && UPSTASH_TOKEN);
}

async function getWorkoutHistory(userId: string): Promise<WorkoutRecord[]> {
  const historyKey = `workouts:${userId}`;

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
      console.error('[Storage] Redis workout history GET error:', err);
    }
  } else {
    const existing = memoryStore.get(historyKey);
    if (existing) {
      return existing as WorkoutRecord[];
    }
  }

  return [];
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use GET.' });
  }

  try {
    const userId = req.query?.userId as string;
    const limit = parseInt(req.query?.limit as string) || 20;
    const activityType = req.query?.activityType as string;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query parameter: userId',
      });
    }

    let history = await getWorkoutHistory(userId);

    // Filter by activity type if specified
    if (activityType) {
      history = history.filter(w =>
        w.activityType.toLowerCase() === activityType.toLowerCase()
      );
    }

    // Sort by most recent first, apply limit
    const sorted = history
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit);

    // Compute aggregate stats
    const totalWorkouts = history.length;
    const totalDuration = history.reduce((sum, w) => sum + w.duration, 0);
    const totalCalories = history.reduce((sum, w) => sum + (w.calories || 0), 0);
    const totalDistance = history.reduce((sum, w) => sum + (w.distance || 0), 0);
    const avgHeartRate = history.length > 0
      ? Math.round(history.reduce((sum, w) => sum + (w.avgHeartRate || 0), 0) / history.filter(w => w.avgHeartRate).length) || null
      : null;

    // Activity type breakdown
    const activityBreakdown: Record<string, number> = {};
    history.forEach(w => {
      activityBreakdown[w.activityType] = (activityBreakdown[w.activityType] || 0) + 1;
    });

    // Format workouts for display
    const workouts = sorted.map(w => ({
      workoutId: w.id,
      source: w.source,
      activityType: w.activityType,
      subActivity: w.subActivity || null,
      startTime: new Date(w.startTime).toISOString(),
      endTime: new Date(w.endTime).toISOString(),
      durationMinutes: Math.round(w.duration / 60),
      distanceKm: w.distance ? Math.round(w.distance / 100) / 10 : null,
      calories: w.calories || null,
      avgHeartRate: w.avgHeartRate || null,
      maxHeartRate: w.maxHeartRate || null,
      hrZones: w.hrZones || null,
      trainingEffect: w.trainingEffect || null,
      deviceManufacturer: w.deviceManufacturer || null,
      lapCount: w.laps?.length || 0,
    }));

    return res.status(200).json({
      success: true,
      userId,
      count: workouts.length,
      totalWorkouts,
      aggregates: {
        totalDurationMinutes: Math.round(totalDuration / 60),
        totalCalories,
        totalDistanceKm: Math.round(totalDistance / 100) / 10,
        avgHeartRate,
        activityBreakdown,
      },
      workouts,
      storage: isUpstashConfigured() ? 'redis' : 'memory',
    });

  } catch (error) {
    console.error('[WORKOUT] History error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
