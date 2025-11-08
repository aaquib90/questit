function getCorsHeaders(origin) {
  const allowedOrigins = [
    'http://localhost:8000',
    'http://localhost:5173',
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

    const payload = await request.json();
    const { instance_id, pass, details } = payload || {};
    if (!instance_id) {
      return new Response('Missing instance_id', {
        status: 400,
        headers: corsHeaders
      });
    }

    const url = `${env.SUPABASE_URL}/rest/v1/tool_selftest_results`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_SERVICE_ROLE,
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ instance_id, pass: !!pass, details: details || {} })
    });
    const text = await res.text();
    if (!res.ok) {
      return new Response(text, {
        status: res.status,
        headers: corsHeaders
      });
    }
    return new Response(text, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
};

