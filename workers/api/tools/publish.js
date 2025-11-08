// Publishes a User Worker into a dispatch namespace (Workers for Platforms)
// Requires env: CLOUDFLARE_ACCOUNT_ID, WFP_NAMESPACE_ID, CLOUDFLARE_API_TOKEN

function buildUserWorkerScript(tool) {
  const html = `<!doctype html><html><head><meta charset=\"utf-8\"><title>${(tool.title || 'Questit Tool').replace(/"/g,'&quot;')}</title><style>${(tool.css || '').replace(/<\//g,'<\\/')}</style></head><body>${(tool.html || '').replace(/<\//g,'<\\/')}<script type=\"module\">${(tool.js || '').replace(/<\//g,'<\\/')}</script></body></html>`;
  const responseInit = JSON.stringify({
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
  return `addEventListener('fetch', event => {
  event.respondWith(handleRequest());
});

async function handleRequest() {
  return new Response(${JSON.stringify(html)}, ${responseInit});
}
`;
}

function getCorsHeaders(origin) {
  const allowedOrigins = [
    'http://localhost:8000',
    'http://localhost:3000',
    'http://127.0.0.1:8000',
    'https://questit.cc',
    'https://www.questit.cc'
  ];
  const isAllowed = origin && allowedOrigins.some(allowed => origin === allowed || origin.endsWith('.questit.cc'));
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const corsHeaders = getCorsHeaders(origin);
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { 
        status: 405,
        headers: corsHeaders
      });
    }
    
    const tool = await request.json();

    const accountId = env.CLOUDFLARE_ACCOUNT_ID;
    const namespaceSlug = env.WFP_NAMESPACE_NAME || env.WFP_NAMESPACE_ID;
    const token = env.CLOUDFLARE_API_TOKEN;
    if (!accountId || !namespaceSlug || !token) {
      return new Response('Workers for Platforms not configured', { 
        status: 500,
        headers: corsHeaders
      });
    }

    const rawName = (tool.id || `tool-${Math.random().toString(36).slice(2)}`).toLowerCase();
    const scriptName = rawName.replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '') || `tool-${Date.now()}`;
    const source = buildUserWorkerScript(tool);

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/dispatch/namespaces/${namespaceSlug}/scripts/${scriptName}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/javascript' },
      body: source
    });
    const body = await res.text();
    if (!res.ok) {
      return new Response(body, { 
        status: res.status,
        headers: corsHeaders
      });
    }

    return new Response(JSON.stringify({ name: scriptName, namespace: namespaceSlug }), { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
};
