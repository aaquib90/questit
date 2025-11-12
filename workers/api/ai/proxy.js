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
    
    let parsedBody;
    try {
      parsedBody = await request.json();
    } catch {
      return new Response('Invalid JSON payload', {
        status: 400,
        headers: corsHeaders
      });
    }

    const { system, input, options = {}, provider: requestedProvider, model: requestedModel } = parsedBody;
    const provider = (requestedProvider || options.provider || 'openai').toLowerCase();
    const model = requestedModel || options.model;

    switch (provider) {
      case 'openai':
        return handleOpenAI({ system, input, options, corsHeaders, env, model });
      case 'gemini':
      case 'google':
      case 'google-gemini':
        return handleGemini({ system, input, options, corsHeaders, env, model });
      case 'anthropic':
      case 'claude':
        return handleAnthropic({ system, input, options, corsHeaders, env, model });
      default:
        return new Response(`Unsupported provider: ${provider}`, {
          status: 400,
          headers: corsHeaders
        });
    }
  }
};

async function handleOpenAI({ system, input, options, corsHeaders, env, model }) {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response('OPENAI_API_KEY not configured', {
      status: 500,
      headers: corsHeaders
    });
  }

  const payload = {
    model: model || options?.model || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system || '' },
      { role: 'user', content: input || '' }
    ],
    temperature: options?.temperature ?? 0.2
  };

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

async function handleGemini({ system, input, options, corsHeaders, env, model }) {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response('GEMINI_API_KEY not configured', {
      status: 500,
      headers: corsHeaders
    });
  }

  const selectedModel = model || options?.model || 'gemini-2.5-flash';
  const promptText = [system ? `System: ${system}` : null, input || '']
    .filter(Boolean)
    .join('\n\n');

  const generationConfig = {};
  if (typeof options?.temperature === 'number') {
    generationConfig.temperature = options.temperature;
  }
  if (options?.response_format?.type === 'json_object') {
    generationConfig.responseMimeType = 'application/json';
  }

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: promptText }]
      }
    ]
  };

  if (Object.keys(generationConfig).length > 0) {
    payload.generationConfig = generationConfig;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
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
  } catch (error) {
    const fallbackText = await res.text().catch(() => '');
    return new Response(fallbackText || 'Invalid response from Gemini', {
      status: 502,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain'
      }
    });
  }

  const textParts = data.candidates?.[0]?.content?.parts || [];
  const content = textParts
    .map((part) => part?.text || '')
    .join('')
    .trim();

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

async function handleAnthropic({ system, input, options, corsHeaders, env, model }) {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response('ANTHROPIC_API_KEY not configured', {
      status: 500,
      headers: corsHeaders
    });
  }

  const selectedModel = model || options?.model || 'claude-4.5-haiku';
  const userContent = input || '';
  if (!userContent.trim()) {
    return new Response('Prompt content required for Anthropic request', {
      status: 400,
      headers: corsHeaders
    });
  }

  const payload = {
    model: selectedModel,
    max_tokens: options?.max_tokens ?? 4096,
    temperature: typeof options?.temperature === 'number' ? options.temperature : 0.2,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: userContent
          }
        ]
      }
    ]
  };

  if (system) {
    payload.system = system;
  }

  if (options?.response_format?.type === 'json_object') {
    payload.response_format = { type: 'json_object' };
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
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
    return new Response(fallbackText || 'Invalid response from Anthropic', {
      status: 502,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain'
      }
    });
  }

  let aggregatedText = '';
  if (Array.isArray(data?.content)) {
    aggregatedText = data.content
      .filter((part) => part && part.type === 'text' && typeof part.text === 'string')
      .map((part) => part.text)
      .join('\n')
      .trim();
  }

  const responseBody = aggregatedText || JSON.stringify(data);

  return new Response(responseBody, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
