/**
 * GAVL Workout Ingest Endpoint
 *
 * Ingests workout data from Garmin .FIT files or manual JSON entry.
 * Extracts session summary (sport, duration, HR, distance, calories, HR zones)
 * and stores as a WorkoutRecord in Redis.
 *
 * Two modes:
 *   1. FIT file: POST with { userId, fitFile: "<base64>" }
 *   2. Manual/JSON: POST with { userId, source: "manual", activityType, ... }
 *
 * POST /api/workout-ingest
 */

import { Decoder, Stream } from '@garmin/fitsdk';

// =============================================================================
// TYPES
// =============================================================================

interface WorkoutRecord {
  id: string;
  userId: string;
  source: 'garmin-fit' | 'apple-health' | 'manual' | 'coros' | 'whoop' | 'oura';
  activityType: string;
  subActivity?: string;
  startTime: number;
  endTime: number;
  duration: number;             // seconds
  distance?: number;            // meters
  calories?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  minHeartRate?: number;
  avgSpeed?: number;            // m/s
  maxSpeed?: number;
  avgCadence?: number;
  totalAscent?: number;         // meters
  totalDescent?: number;
  hrZones?: number[];           // time in each zone (seconds)
  trainingEffect?: number;
  deviceManufacturer?: string;
  deviceProduct?: number;
  recordCount?: number;         // number of per-second data points
  laps?: LapSummary[];
  createdAt: number;            // when ingested
}

interface LapSummary {
  lapNumber: number;
  startTime: number;
  duration: number;             // seconds
  distance?: number;            // meters
  avgHeartRate?: number;
  maxHeartRate?: number;
  avgSpeed?: number;
  calories?: number;
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

async function redisGet(key: string): Promise<unknown | null> {
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

async function redisSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
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

// 30-day TTL for workout history
const WORKOUT_HISTORY_TTL = 30 * 24 * 60 * 60;

async function appendToWorkoutHistory(userId: string, workout: WorkoutRecord): Promise<void> {
  const historyKey = `workouts:${userId}`;
  let history: WorkoutRecord[] = [];

  const existing = await redisGet(historyKey);
  if (existing && Array.isArray(existing)) {
    history = existing as WorkoutRecord[];
  }

  history.push(workout);
  if (history.length > 100) history = history.slice(-100);

  await redisSet(historyKey, history, WORKOUT_HISTORY_TTL);
}

// =============================================================================
// HELPERS
// =============================================================================

function generateWorkoutId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `WR-${timestamp}-${random}`.toUpperCase();
}

// =============================================================================
// FIT FILE PARSER
// =============================================================================

function parseFitFile(base64Data: string): WorkoutRecord | { error: string } {
  try {
    const buffer = Buffer.from(base64Data, 'base64');
    const bytes = Array.from(new Uint8Array(buffer));

    const stream = Stream.fromByteArray(bytes);
    const decoder = new Decoder(stream);

    if (!decoder.isFIT()) {
      return { error: 'Invalid FIT file: not a valid FIT format' };
    }

    const { messages, errors } = decoder.read({
      applyScaleAndOffset: true,
      expandSubFields: true,
      expandComponents: true,
      convertTypesToStrings: true,
      convertDateTimesToDates: true,
      mergeHeartRates: true,
      includeUnknownData: false,
    });

    if (errors.length > 0) {
      console.warn('[WORKOUT] FIT decode warnings:', errors);
    }

    // Extract session summary (primary data source)
    const session = messages.sessionMesgs?.[0];
    if (!session) {
      return { error: 'FIT file contains no session data' };
    }

    // Extract device info
    const deviceInfo = messages.deviceInfoMesgs?.[0];

    // Extract lap summaries
    const laps: LapSummary[] = (messages.lapMesgs || []).map((lap: Record<string, unknown>, i: number) => ({
      lapNumber: i + 1,
      startTime: lap.startTime instanceof Date ? lap.startTime.getTime() : Number(lap.startTime) || 0,
      duration: Math.round(Number(lap.totalTimerTime) || Number(lap.totalElapsedTime) || 0),
      distance: Number(lap.totalDistance) || undefined,
      avgHeartRate: Number(lap.avgHeartRate) || undefined,
      maxHeartRate: Number(lap.maxHeartRate) || undefined,
      avgSpeed: Number(lap.avgSpeed) || undefined,
      calories: Number(lap.totalCalories) || undefined,
    }));

    const startTime = session.startTime instanceof Date
      ? session.startTime.getTime()
      : Number(session.startTime) || Date.now();

    const endTime = session.timestamp instanceof Date
      ? session.timestamp.getTime()
      : Number(session.timestamp) || Date.now();

    const workout: WorkoutRecord = {
      id: generateWorkoutId(),
      userId: '', // filled by caller
      source: 'garmin-fit',
      activityType: String(session.sport || 'unknown'),
      subActivity: session.subSport ? String(session.subSport) : undefined,
      startTime,
      endTime,
      duration: Math.round(Number(session.totalTimerTime) || Number(session.totalElapsedTime) || 0),
      distance: Number(session.totalDistance) || undefined,
      calories: Number(session.totalCalories) || undefined,
      avgHeartRate: Number(session.avgHeartRate) || undefined,
      maxHeartRate: Number(session.maxHeartRate) || undefined,
      minHeartRate: Number(session.minHeartRate) || undefined,
      avgSpeed: Number(session.avgSpeed) || Number(session.enhancedAvgSpeed) || undefined,
      maxSpeed: Number(session.maxSpeed) || Number(session.enhancedMaxSpeed) || undefined,
      avgCadence: Number(session.avgCadence) || undefined,
      totalAscent: Number(session.totalAscent) || undefined,
      totalDescent: Number(session.totalDescent) || undefined,
      hrZones: Array.isArray(session.timeInHrZone)
        ? session.timeInHrZone.map((t: unknown) => Math.round(Number(t) || 0))
        : undefined,
      trainingEffect: Number(session.totalTrainingEffect) || undefined,
      deviceManufacturer: deviceInfo?.manufacturer ? String(deviceInfo.manufacturer) : undefined,
      deviceProduct: Number(deviceInfo?.product) || undefined,
      recordCount: messages.recordMesgs?.length || 0,
      laps: laps.length > 0 ? laps : undefined,
      createdAt: Date.now(),
    };

    return workout;
  } catch (err) {
    console.error('[WORKOUT] FIT parse error:', err);
    return { error: `FIT parse failed: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// =============================================================================
// MANUAL ENTRY BUILDER
// =============================================================================

function buildManualWorkout(body: Record<string, unknown>): WorkoutRecord | { error: string } {
  const activityType = body.activityType as string;
  if (!activityType) {
    return { error: 'Missing: activityType (e.g., "running", "cycling", "resistance_training")' };
  }

  const startTime = body.startTime
    ? new Date(body.startTime as string).getTime()
    : Date.now() - ((Number(body.duration) || 3600) * 1000);

  const duration = Number(body.duration) || 0;
  if (duration <= 0) {
    return { error: 'Missing or invalid: duration (seconds)' };
  }

  const endTime = body.endTime
    ? new Date(body.endTime as string).getTime()
    : startTime + (duration * 1000);

  const workout: WorkoutRecord = {
    id: generateWorkoutId(),
    userId: '', // filled by caller
    source: (body.source as WorkoutRecord['source']) || 'manual',
    activityType,
    subActivity: body.subActivity as string || undefined,
    startTime,
    endTime,
    duration,
    distance: Number(body.distance) || undefined,
    calories: Number(body.calories) || undefined,
    avgHeartRate: Number(body.avgHeartRate) || undefined,
    maxHeartRate: Number(body.maxHeartRate) || undefined,
    minHeartRate: Number(body.minHeartRate) || undefined,
    avgSpeed: Number(body.avgSpeed) || undefined,
    maxSpeed: Number(body.maxSpeed) || undefined,
    avgCadence: Number(body.avgCadence) || undefined,
    totalAscent: Number(body.totalAscent) || undefined,
    totalDescent: Number(body.totalDescent) || undefined,
    hrZones: Array.isArray(body.hrZones)
      ? (body.hrZones as number[]).map(t => Math.round(Number(t) || 0))
      : undefined,
    createdAt: Date.now(),
  };

  return workout;
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
    const body = req.body || {};
    const { userId, fitFile } = body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'Missing: userId' });
    }

    let workout: WorkoutRecord | { error: string };

    // Route: FIT file upload (base64)
    if (fitFile) {
      console.log(`[WORKOUT] Parsing FIT file for user: ${userId}`);
      workout = parseFitFile(fitFile);
    }
    // Route: Manual/JSON entry
    else {
      console.log(`[WORKOUT] Manual entry for user: ${userId}`);
      workout = buildManualWorkout(body);
    }

    // Check for parse errors
    if ('error' in workout) {
      return res.status(400).json({ success: false, error: workout.error });
    }

    // Set userId
    workout.userId = userId;

    // Store individual workout (7-day TTL for quick access)
    const workoutKey = `workout:${userId}:${workout.id}`;
    await redisSet(workoutKey, workout, 7 * 24 * 60 * 60);

    // Append to history
    await appendToWorkoutHistory(userId, workout);

    console.log(`[WORKOUT] Ingested | ${workout.source} | ${workout.activityType} | ${Math.round(workout.duration / 60)}min | HR avg:${workout.avgHeartRate || 'N/A'} | ${workout.id}`);

    return res.status(200).json({
      success: true,
      workoutId: workout.id,
      source: workout.source,
      activityType: workout.activityType,
      subActivity: workout.subActivity || null,
      startTime: new Date(workout.startTime).toISOString(),
      endTime: new Date(workout.endTime).toISOString(),
      duration: workout.duration,
      durationMinutes: Math.round(workout.duration / 60),
      distance: workout.distance || null,
      distanceKm: workout.distance ? Math.round(workout.distance / 100) / 10 : null,
      calories: workout.calories || null,
      avgHeartRate: workout.avgHeartRate || null,
      maxHeartRate: workout.maxHeartRate || null,
      hrZones: workout.hrZones || null,
      trainingEffect: workout.trainingEffect || null,
      deviceManufacturer: workout.deviceManufacturer || null,
      recordCount: workout.recordCount || null,
      lapCount: workout.laps?.length || 0,
      storage: isUpstashConfigured() ? 'redis' : 'memory',
    });

  } catch (error) {
    console.error('[WORKOUT] Ingest error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
