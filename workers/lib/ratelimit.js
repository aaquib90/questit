export async function rateLimit(
  request,
  env,
  { limit = 60, windowSec = 60, identifier = null } = {}
) {
  try {
    const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
    const path = new URL(request.url).pathname;
    const keyBase = identifier || `${ip}:${path}`;
    const key = `rl:${keyBase}`;
    if (!env.RATELIMIT_KV) return { allowed: true, remaining: limit, reset: windowSec };
    const now = Math.floor(Date.now() / 1000);
    const bucket = await env.RATELIMIT_KV.get(key, { type: 'json' });
    if (!bucket) {
      await env.RATELIMIT_KV.put(key, JSON.stringify({ count: 1, reset: now + windowSec }), { expirationTtl: windowSec });
      return { allowed: true, remaining: limit - 1, reset: windowSec };
    }
    const count = bucket.count || 0;
    if (count >= limit) {
      return { allowed: false, remaining: 0, reset: Math.max(0, bucket.reset - now) };
    }
    await env.RATELIMIT_KV.put(key, JSON.stringify({ count: count + 1, reset: bucket.reset }), { expiration: bucket.reset });
    return { allowed: true, remaining: limit - (count + 1), reset: Math.max(0, bucket.reset - now) };
  } catch {
    return { allowed: true, remaining: limit, reset: windowSec };
  }
}


