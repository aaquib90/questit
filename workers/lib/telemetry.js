async function postJson(url, payload, headers = {}) {
  return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(payload) });
}

export async function logErrorToSentry(env, error, context = {}) {
  if (!env.SENTRY_DSN) return;
  try {
    const dsn = new URL(env.SENTRY_DSN);
    const projectId = dsn.pathname.split('/').filter(Boolean).pop();
    const host = dsn.host;
    const key = dsn.username; // public key in DSN
    const url = `https://${host}/api/${projectId}/envelope/`;
    const now = Date.now();
    const header = { sent_at: new Date(now).toISOString(), sdk: { name: 'questit-edge', version: '1.0.0' } };
    const event = { level: 'error', timestamp: now / 1000, message: error?.message || 'Edge error', exception: { values: [{ type: error?.name || 'Error', value: error?.message || 'Error', stacktrace: { frames: [] } }] }, tags: context.tags || {}, extra: context.extra || {} };
    const envelope = `${JSON.stringify(header)}\n${JSON.stringify({ type: 'event', sample_rates: [] })}\n${JSON.stringify(event)}\n`;
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-sentry-envelope', 'X-Sentry-Auth': `Sentry sentry_key=${key}, sentry_version=7` }, body: envelope });
  } catch {}
}

export async function capturePosthogEvent(env, event, properties = {}) {
  if (!env.POSTHOG_API_KEY || !env.POSTHOG_HOST) return;
  try {
    const url = `${env.POSTHOG_HOST.replace(/\/$/, '')}/capture/`;
    const payload = { api_key: env.POSTHOG_API_KEY, event, properties };
    await postJson(url, payload);
  } catch {}
}

export default { logErrorToSentry, capturePosthogEvent };


