/**
 * Memory endpoints smoke tests (skipped unless API_BASE and TOOL_ID provided)
 *
 * Run with:
 *   API_BASE="https://questit.cc/api" TOOL_ID="<uuid>" node test/memory-endpoints.test.js
 *
 * Notes:
 * - If testing account-scoped memory, also set AUTH_BEARER="eyJhbGciOi..." to include Authorization.
 * - These tests are non-destructive and will set/delete a temporary key.
 */

const API_BASE = process.env.API_BASE;
const TOOL_ID = process.env.TOOL_ID;
const AUTH_BEARER = process.env.AUTH_BEARER;

async function main() {
  if (!API_BASE || !TOOL_ID) {
    console.log('SKIP memory tests: set API_BASE and TOOL_ID env vars.');
    return;
  }
  const base = API_BASE.replace(/\/$/, '');
  const url = `${base}/tools/${encodeURIComponent(TOOL_ID)}/memory`;
  const headers = { 'Content-Type': 'application/json' };
  if (AUTH_BEARER) {
    headers.Authorization = `Bearer ${AUTH_BEARER}`;
  } else {
    headers['X-Questit-Session-Id'] = `test-${Date.now().toString(36)}`;
  }
  const testKey = `__test_${Date.now().toString(36)}`;
  const value = { hello: 'world' };

  // Set
  let res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ key: testKey, value }) });
  console.log('POST /memory ->', res.status);
  if (res.status >= 400) {
    console.log('Body:', await res.text());
    return;
  }

  // Get
  res = await fetch(url, { method: 'GET', headers });
  console.log('GET /memory ->', res.status);
  try {
    const json = await res.json();
    const hasEntry = Array.isArray(json.memories) && json.memories.some((e) => e.memory_key === testKey);
    console.log('Contains key:', hasEntry ? '✅' : '❌');
  } catch (e) {
    console.log('Failed to parse memories:', e.message);
  }

  // Delete
  res = await fetch(`${url}/${encodeURIComponent(testKey)}`, { method: 'DELETE', headers });
  console.log('DELETE /memory/:key ->', res.status);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}


