import { rateLimit } from '../lib/ratelimit.js';
import { logErrorToSentry, capturePosthogEvent } from '../lib/telemetry.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostParts = (url.hostname || '').split('.').filter(Boolean);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const hasSubdomain = hostParts.length > 2;

    let slug = hasSubdomain ? hostParts[0] : null;
    let derivedFromPath = false;

    if (!slug && pathSegments.length >= 2 && pathSegments[0] === 'tools') {
      const decoded = decodeURIComponent(pathSegments[1] || '').trim();
      if (decoded) {
        slug = decoded.toLowerCase();
        derivedFromPath = true;
      }
    } else if (slug) {
      slug = slug.toLowerCase();
    }

    if (!slug) {
      return new Response('Route not configured', { status: 404 });
    }

    const baseHost = hasSubdomain ? hostParts.slice(1).join('.') : url.hostname;
    const shouldRedirectToPath =
      hasSubdomain &&
      !derivedFromPath &&
      baseHost &&
      !baseHost.endsWith('.workers.dev');

    if (shouldRedirectToPath) {
      const redirectUrl = new URL(request.url);
      redirectUrl.hostname = baseHost;
      redirectUrl.pathname = `/tools/${encodeURIComponent(slug)}${
        url.pathname === '/' ? '' : url.pathname
      }`;
      return Response.redirect(redirectUrl.toString(), 302);
    }

    const rl = await rateLimit(request, env, { limit: 120, windowSec: 60 });
    if (!rl.allowed) {
      return new Response('Too Many Requests', { status: 429, headers: { 'Retry-After': String(rl.reset || 60) } });
    }

    try {
      const dispatcher = env.DISPATCH;
      if (!dispatcher) return new Response('Dispatcher not configured', { status: 500 });

      let forwardRequest = request;

      if (derivedFromPath) {
        const restSegments = pathSegments.slice(2);
        const rewrittenUrl = new URL(request.url);
        rewrittenUrl.pathname = restSegments.length ? `/${restSegments.join('/')}` : '/';
        forwardRequest = new Request(rewrittenUrl.toString(), request);
      }

      const enhancedHeaders = new Headers(forwardRequest.headers);
      enhancedHeaders.set('x-questit-share-slug', slug);
      enhancedHeaders.set('x-questit-original-host', url.hostname);
      enhancedHeaders.set('x-questit-original-path', url.pathname || '/');
      forwardRequest = new Request(forwardRequest, { headers: enhancedHeaders });

      const worker = typeof dispatcher.get === 'function' ? await dispatcher.get(slug) : null;
      if (!worker) {
        return new Response('Worker not found', { status: 404 });
      }

      const res = await worker.fetch(forwardRequest);
      ctx.waitUntil(
        capturePosthogEvent(env, 'dispatch_request', {
          slug,
          path: url.pathname,
          origin: derivedFromPath ? 'path' : 'subdomain'
        })
      );
      return res;
    } catch (error) {
      console.error('Dispatch failure', {
        slug,
        derivedFromPath,
        message: error?.message,
        stack: error?.stack
      });
      ctx.waitUntil(
        logErrorToSentry(env, error, {
          tags: { area: 'dispatch' },
          extra: { slug, derivedFromPath, originalPath: url.pathname, host: url.hostname }
        })
      );
      return new Response('Dispatch error', { status: 500 });
    }
  }
};
