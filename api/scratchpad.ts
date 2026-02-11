/**
 * Mission Control Scratchpad Sync
 *
 * GET /api/scratchpad  → returns saved scratchpad + questions data
 * POST /api/scratchpad → saves scratchpad + questions data to Redis
 *
 * Enables cross-device sync (Mac + phone share the same notes).
 */

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const REDIS_KEY = 'mc:scratchpad';

function isUpstashConfigured(): boolean {
  return !!(UPSTASH_URL && UPSTASH_TOKEN);
}

async function getFromRedis(): Promise<{ scratchpad: string; questions: string } | null> {
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

async function saveToRedis(payload: { scratchpad: string; questions: string }): Promise<boolean> {
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
  // CORS — Mission Control is on a different domain
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
      data: data || { scratchpad: '', questions: '' },
    });
  }

  if (req.method === 'POST') {
    const { scratchpad, questions } = req.body || {};
    const saved = await saveToRedis({
      scratchpad: scratchpad || '',
      questions: questions || '',
    });
    return res.status(200).json({ success: saved });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
