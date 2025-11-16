import { logErrorToSentry, capturePosthogEvent } from '../../lib/telemetry.js';

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: { code: 'method_not_allowed', message: 'Method Not Allowed' } }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    let tool;
    try {
      tool = await request.json();
    } catch {
      await logErrorToSentry(env, new Error('package_invalid_json'));
      return new Response(JSON.stringify({ error: { code: 'invalid_json', message: 'Invalid JSON payload' } }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const safeTitle = (tool.title || 'Questit Tool').toString();
    const doc = `<!doctype html><html><head><meta charset="utf-8"><title>${safeTitle}</title><style>${tool.css || ''}</style></head><body>${tool.html || ''}<script type="module">${tool.js || ''}</script></body></html>`;
    try {
      await capturePosthogEvent(env, 'package_created', { title_len: safeTitle.length });
    } catch {}
    return new Response(doc, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${(safeTitle || 'questit-tool').toLowerCase().replace(/[^a-z0-9-]+/g,'-')}.html"`
      }
    });
  }
};


