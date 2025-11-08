const CI_MODEL = 'o4-mini';

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

async function runCodeInterpreter(env, body) {
  const apiKey = env.CI_OPENAI_API_KEY || env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { message: 'CI key not configured' } })
    };
  }

  const payload = {
    model: body?.model || CI_MODEL,
    tools: [{ type: 'code_interpreter' }],
    input: body?.messages || [],
    reasoning: body?.reasoning,
    max_output_tokens: body?.max_output_tokens,
    metadata: body?.metadata
  };

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  if (!res.ok) {
    return {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
      body: text
    };
  }

  try {
    const data = JSON.parse(text);
    const content = data?.output?.[0]?.content || data?.content || [];
    const combined = Array.isArray(content) ? content : [content];
    const jsonChunk = combined.find((item) => item?.type === 'output_text' || item?.type === 'text');
    let parsed;
    if (jsonChunk?.text) {
      const trimmed = jsonChunk.text.trim();
      if (trimmed.startsWith('{')) {
        parsed = JSON.parse(trimmed);
      } else {
        parsed = { message: trimmed };
      }
    }
    if (!parsed && combined.length) {
      parsed = { message: combined.map((c) => c?.text || '').join('\n').trim() };
    }
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed || {})
    };
  } catch (error) {
    return {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { message: error.message, raw: text } })
    };
  }
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

    const body = await request.json().catch(() => ({}));
    const result = await runCodeInterpreter(env, body);
    const responseHeaders = new Headers(result.headers || { 'Content-Type': 'application/json' });
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });
    return new Response(result.body || '', {
      status: result.status || 500,
      headers: responseHeaders
    });
  }
};
