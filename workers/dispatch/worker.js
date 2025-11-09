import { rateLimit } from '../lib/ratelimit.js';
import { logErrorToSentry, capturePosthogEvent } from '../lib/telemetry.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostParts = (url.hostname || '').split('.');
    const sub = hostParts.length > 2 ? hostParts[0] : null;

    if (!sub) return new Response('Missing subdomain', { status: 400 });

    const rl = await rateLimit(request, env, { limit: 120, windowSec: 60 });
    if (!rl.allowed) {
      return new Response('Too Many Requests', { status: 429, headers: { 'Retry-After': String(rl.reset || 60) } });
    }

    try {
      const dispatcher = env.DISPATCH;
      if (!dispatcher) return new Response('Dispatcher not configured', { status: 500 });

      const worker = typeof dispatcher.get === 'function' ? await dispatcher.get(sub) : null;
      if (!worker) {
        return new Response('Worker not found', { status: 404 });
      }

      const res = await worker.fetch(request);
      ctx.waitUntil(capturePosthogEvent(env, 'dispatch_request', { sub, path: url.pathname }));
      return res;
    } catch (error) {
      console.error('Dispatch failure', { subdomain: sub, message: error?.message, stack: error?.stack });
      ctx.waitUntil(logErrorToSentry(env, error, { tags: { area: 'dispatch' }, extra: { sub } }));
      return new Response('Dispatch error', { status: 500 });
    }
  }
};

