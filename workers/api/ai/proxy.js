function getCorsHeaders(origin) {
  // Allow localhost and questit.cc origins
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
    
    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { 
        status: 405,
        headers: corsHeaders
      });
    }
    
    const { system, input, options } = await request.json();

    // Example: forward to OpenAI; ensure OPENAI_API_KEY in env
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response('AI key not configured', { 
        status: 500,
        headers: corsHeaders
      });
    }

    const payload = {
      model: options?.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system || '' },
        { role: 'user', content: input || '' }
      ],
      temperature: options?.temperature ?? 0.2
    };
    
    // Forward response_format if provided (needed for JSON mode)
    if (options?.response_format) {
      payload.response_format = options.response_format;
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(text, { 
        status: res.status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/plain'
        }
      });
    }

    let data;
    try {
      data = await res.json();
    } catch (parseError) {
      const fallbackText = await res.text().catch(() => '');
      return new Response(fallbackText || 'Invalid response from upstream model', {
        status: 502,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/plain'
        }
      });
    }

    const content = data.choices?.[0]?.message?.content || '';
    if (!content) {
      return new Response(JSON.stringify(data), {
        status: 502,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    return new Response(content, { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
};

