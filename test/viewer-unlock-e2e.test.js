/**
 * Tool Viewer unlock flow smoke test (manual, prints steps)
 *
 * Run:
 *   API_BASE="https://questit.cc/api" SLUG="<published-slug>" node test/viewer-unlock-e2e.test.js
 *
 * Steps:
 * - GET /api/tools/:slug should return 200 for public tools, 403 for passphrase/private.
 * - If 403 and requires_passphrase, POST /api/tools/:slug/passphrase with { passphrase } and cookies should return 200.
 */

const API_BASE = process.env.API_BASE;
const SLUG = process.env.SLUG;
const PASSPHRASE = process.env.PASSPHRASE || '';

async function main() {
  if (!API_BASE || !SLUG) {
    console.log('SKIP viewer tests: set API_BASE and SLUG env vars.');
    return;
  }
  const base = API_BASE.replace(/\/$/, '');
  let res = await fetch(`${base}/tools/${encodeURIComponent(SLUG)}`, { headers: { Accept: 'application/json' } });
  console.log('GET /tools/:slug ->', res.status);
  if (res.status === 403) {
    const data = await res.json().catch(() => ({}));
    const requiresPass = data?.requires_passphrase;
    console.log('Forbidden reason:', data?.error || 'unknown', 'requires_passphrase:', !!requiresPass);
    if (requiresPass && PASSPHRASE) {
      res = await fetch(`${base}/tools/${encodeURIComponent(SLUG)}/passphrase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase: PASSPHRASE })
      });
      console.log('POST /tools/:slug/passphrase ->', res.status);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}


