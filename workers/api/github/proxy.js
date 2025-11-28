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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
    
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api\/github\//, '');
    if (!path) {
      return new Response('Bad Request', { 
        status: 400,
        headers: corsHeaders
      });
    }

    const token = env.GITHUB_TOKEN;
    const upstream = `https://raw.githubusercontent.com/${path}`;
    const res = await fetch(upstream, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    
    // Merge CORS headers with upstream response headers
    const responseHeaders = new Headers(res.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });
    
    return new Response(res.body, { 
      status: res.status, 
      headers: responseHeaders
    });
  }
};


