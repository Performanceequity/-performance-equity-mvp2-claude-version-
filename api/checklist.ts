/**
 * Mission Control Checklist + Urgent Items Sync
 *
 * GET /api/checklist  → returns checklist state + urgent items state
 * POST /api/checklist → saves checklist + urgent state to Redis
 *
 * Enables cross-device sync — check a box on phone, see it on Mac.
 * Stores both checklist (index → {done, priority}) and urgent items state.
 */

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const REDIS_KEY = 'mc:dashboard';

function isUpstashConfigured(): boolean {
  return !!(UPSTASH_URL && UPSTASH_TOKEN);
}

async function getFromRedis(): Promise<any | null> {
  if (!isUpstashConfigured()) return null;
  try {
    const res = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(REDIS_KEY)}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    });
    const data = await res.json();
    if (data.result) {
      return JSON.parse(data.result);
    }
    return null;
  } catch {
    return null;
  }
}

async function saveToRedis(payload: any): Promise<boolean> {
  if (!isUpstashConfigured()) return false;
  try {
    await fetch(`${UPSTASH_URL}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['SET', REDIS_KEY, JSON.stringify(payload)]),
    });
    return true;
  } catch {
    return false;
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!isUpstashConfigured()) {
    return res.status(500).json({ error: 'Redis not configured' });
  }

  if (req.method === 'GET') {
    const data = await getFromRedis();
    return res.status(200).json({
      success: true,
      data: data || { checklist: {}, urgent: {} },
    });
  }

  if (req.method === 'POST') {
    const { checklist, urgent } = req.body || {};
    // Merge with existing data so checklist and urgent can be saved independently
    const existing = await getFromRedis() || {};
    const merged = {
      checklist: checklist || existing.checklist || {},
      urgent: urgent || existing.urgent || {},
    };
    const saved = await saveToRedis(merged);
    return res.status(200).json({ success: saved });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
