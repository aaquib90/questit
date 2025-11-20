import { rateLimit } from '../../lib/ratelimit.js';
import { logErrorToSentry, capturePosthogEvent } from '../../lib/telemetry.js';

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
    
    const jsonResponse = (body, init = {}) =>
      new Response(JSON.stringify(body), {
        ...init,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          ...(init.headers || {})
        }
      });

    const errorJson = (status, code, message, details) =>
      jsonResponse(
        {
          error: {
            code,
            message,
            details: details ?? null
          }
        },
        { status }
      );

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    if (request.method !== 'POST') {
      return errorJson(405, 'method_not_allowed', 'Method Not Allowed');
    }
    
    let parsedBody;
    try {
      parsedBody = await request.json();
    } catch {
      return errorJson(400, 'invalid_json', 'Invalid JSON payload');
    }

    const {
      system,
      input,
      options = {},
      provider: requestedProvider,
      model: requestedModel,
      metadata = null
    } = parsedBody;
    const provider = (requestedProvider || options.provider || 'openai').toLowerCase();
    const model = requestedModel || options.model;
    const expectJson =
      options?.response_format?.type === 'json_object' ||
      options?.response_format === 'json_object';

    // Rate limit per-IP and path (best-effort)
    try {
      const { allowed, remaining, reset } = await rateLimit(request, env, {
        limit: 60,
        windowSec: 60
      });
      if (!allowed) {
        return jsonResponse(
          {
            error: {
              code: 'rate_limited',
              message: 'Too many requests. Please slow down and try again shortly.',
              details: { remaining, reset }
            }
          },
          { status: 429 }
        );
      }
    } catch {
      // ignore RL failures (fail-open)
    }

    switch (provider) {
      case 'openai':
        return handleOpenAI({ system, input, options, corsHeaders, env, model, expectJson, metadata });
      case 'gemini':
      case 'google':
      case 'google-gemini':
        return handleGemini({ system, input, options, corsHeaders, env, model, expectJson, metadata });
      case 'anthropic':
      case 'claude':
        return handleAnthropic({ system, input, options, corsHeaders, env, model, expectJson, metadata });
      default:
        return errorJson(400, 'unsupported_provider', `Unsupported provider: ${provider}`);
    }
  }
};

async function handleOpenAI({
  system,
  input,
  options,
  corsHeaders,
  env,
  model,
  expectJson,
  metadata
}) {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: { code: 'config_missing', message: 'OPENAI_API_KEY not configured' }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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
    let details = null;
    try {
      details = await res.json();
    } catch {
      details = await res.text().catch(() => null);
    }
    await logErrorToSentry(env, new Error('OpenAI upstream_error'), {
      extra: { provider: 'openai', status: res.status, details }
    });
    return new Response(
      JSON.stringify({
        error: {
          code: 'upstream_error',
          message: 'The upstream provider returned an error.',
          details
        }
      }),
      { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let data;
  try {
    data = await res.json();
  } catch (parseError) {
    const fallbackText = await res.text().catch(() => '');
    await logErrorToSentry(env, new Error('OpenAI invalid_upstream_json'), {
      extra: { provider: 'openai' }
    });
    return new Response(
      JSON.stringify({
        error: {
          code: 'invalid_upstream_json',
          message: 'Invalid response from upstream model',
          details: fallbackText || null
        }
      }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const content = data.choices?.[0]?.message?.content || '';
  if (!content) {
    await logErrorToSentry(env, new Error('OpenAI empty_content'), {
      extra: { provider: 'openai', data }
    });
    return new Response(
      JSON.stringify({
        error: {
          code: 'empty_content',
          message: 'No content returned by upstream model.',
          details: data
        }
      }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  await recordUsageEvent(env, {
    provider: 'openai',
    model: payload.model,
    usage: data?.usage,
    metadata
  });

  if (expectJson) {
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      await capturePosthogEvent(env, 'ai_proxy_request', {
        provider: 'openai',
        model: payload.model || null,
        json_ok: true
      });
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch {
      await logErrorToSentry(env, new Error('OpenAI non_json_content'), {
        extra: { provider: 'openai' }
      });
      return new Response(
        JSON.stringify({
          error: {
            code: 'non_json_content',
            message:
              'Upstream model did not honor the requested JSON response_format. Expected JSON object.'
          }
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Fallback: return raw content string
  await capturePosthogEvent(env, 'ai_proxy_request', {
    provider: 'openai',
    model: payload.model || null,
    json_ok: false
  });
  return new Response(JSON.stringify({ content }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleGemini({
  system,
  input,
  options,
  corsHeaders,
  env,
  model,
  expectJson,
  metadata
}) {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: { code: 'config_missing', message: 'GEMINI_API_KEY not configured' }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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
    let details = null;
    try {
      details = await res.json();
    } catch {
      details = await res.text().catch(() => null);
    }
    await logErrorToSentry(env, new Error('Gemini upstream_error'), {
      extra: { provider: 'gemini', status: res.status, details }
    });
    return new Response(
      JSON.stringify({
        error: {
          code: 'upstream_error',
          message: 'The upstream provider returned an error.',
          details
        }
      }),
      { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let data;
  try {
    data = await res.json();
  } catch (error) {
    const fallbackText = await res.text().catch(() => '');
    await logErrorToSentry(env, new Error('Gemini invalid_upstream_json'), {
      extra: { provider: 'gemini' }
    });
    return new Response(
      JSON.stringify({
        error: {
          code: 'invalid_upstream_json',
          message: 'Invalid response from Gemini',
          details: fallbackText || null
        }
      }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const textParts = data.candidates?.[0]?.content?.parts || [];
  const content = textParts
    .map((part) => part?.text || '')
    .join('')
    .trim();

  if (!content) {
    await logErrorToSentry(env, new Error('Gemini empty_content'), {
      extra: { provider: 'gemini', data }
    });
    return new Response(
      JSON.stringify({
        error: {
          code: 'empty_content',
          message: 'No content returned by upstream model.',
          details: data
        }
      }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  await recordUsageEvent(env, {
    provider: 'gemini',
    model: selectedModel,
    usage: data?.usageMetadata,
    metadata
  });

  if (expectJson) {
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      await capturePosthogEvent(env, 'ai_proxy_request', {
        provider: 'gemini',
        model: selectedModel || null,
        json_ok: true
      });
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch {
      await logErrorToSentry(env, new Error('Gemini non_json_content'), {
        extra: { provider: 'gemini' }
      });
      return new Response(
        JSON.stringify({
          error: {
            code: 'non_json_content',
            message:
              'Upstream model did not honor the requested JSON response_format. Expected JSON object.'
          }
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  await capturePosthogEvent(env, 'ai_proxy_request', {
    provider: 'gemini',
    model: selectedModel || null,
    json_ok: false
  });
  return new Response(JSON.stringify({ content }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleAnthropic({
  system,
  input,
  options,
  corsHeaders,
  env,
  model,
  expectJson,
  metadata
}) {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: { code: 'config_missing', message: 'ANTHROPIC_API_KEY not configured' }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const selectedModel = model || options?.model || 'claude-3-5-haiku-20241022';
  const userContent = input || '';
  if (!userContent.trim()) {
    return new Response(
      JSON.stringify({
        error: {
          code: 'invalid_request',
          message: 'Prompt content required for Anthropic request'
        }
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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
    let details = null;
    try {
      details = await res.json();
    } catch {
      details = await res.text().catch(() => null);
    }
    await logErrorToSentry(env, new Error('Anthropic upstream_error'), {
      extra: { provider: 'anthropic', status: res.status, details }
    });
    return new Response(
      JSON.stringify({
        error: {
          code: 'upstream_error',
          message: 'The upstream provider returned an error.',
          details
        }
      }),
      { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let data;
  try {
    data = await res.json();
  } catch (parseError) {
    const fallbackText = await res.text().catch(() => '');
    await logErrorToSentry(env, new Error('Anthropic invalid_upstream_json'), {
      extra: { provider: 'anthropic' }
    });
    return new Response(
      JSON.stringify({
        error: {
          code: 'invalid_upstream_json',
          message: 'Invalid response from Anthropic',
          details: fallbackText || null
        }
      }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let aggregatedText = '';
  if (Array.isArray(data?.content)) {
    aggregatedText = data.content
      .filter((part) => part && part.type === 'text' && typeof part.text === 'string')
      .map((part) => part.text)
      .join('\n')
      .trim();
  }

  const responseBody = aggregatedText || '';
  await recordUsageEvent(env, {
    provider: 'anthropic',
    model: selectedModel,
    usage: data?.usage,
    metadata
  });

  if (expectJson) {
    try {
      const parsed = responseBody ? JSON.parse(responseBody) : data;
      await capturePosthogEvent(env, 'ai_proxy_request', {
        provider: 'anthropic',
        model: selectedModel || null,
        json_ok: true
      });
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch {
      await logErrorToSentry(env, new Error('Anthropic non_json_content'), {
        extra: { provider: 'anthropic' }
      });
      return new Response(
        JSON.stringify({
          error: {
            code: 'non_json_content',
            message:
              'Upstream model did not honor the requested JSON response_format. Expected JSON object.'
          }
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Fallback: return raw text wrapped in JSON for consistency
  await capturePosthogEvent(env, 'ai_proxy_request', {
    provider: 'anthropic',
    model: selectedModel || null,
    json_ok: false
  });
  return new Response(JSON.stringify({ content: responseBody || data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

const numberOrNull = (value) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const stringOrNull = (value) =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

const sumNumbers = (a, b) => {
  const first = numberOrNull(a);
  const second = numberOrNull(b);
  if (first !== null && second !== null) {
    return first + second;
  }
  if (first !== null) return first;
  if (second !== null) return second;
  return null;
};

function normalizeUsageTokens(provider, usage) {
  if (!usage || typeof usage !== 'object') {
    return null;
  }
  const lowerProvider = (provider || '').toLowerCase();
  if (lowerProvider === 'openai') {
    return {
      inputTokens: numberOrNull(usage.prompt_tokens),
      outputTokens: numberOrNull(usage.completion_tokens),
      totalTokens:
        numberOrNull(usage.total_tokens) ??
        sumNumbers(usage.prompt_tokens, usage.completion_tokens)
    };
  }
  if (lowerProvider === 'gemini' || lowerProvider === 'google' || lowerProvider === 'google-gemini') {
    return {
      inputTokens: numberOrNull(usage.promptTokenCount),
      outputTokens: numberOrNull(usage.candidatesTokenCount),
      totalTokens:
        numberOrNull(usage.totalTokenCount) ??
        sumNumbers(usage.promptTokenCount, usage.candidatesTokenCount)
    };
  }
  if (lowerProvider === 'anthropic' || lowerProvider === 'claude') {
    return {
      inputTokens: numberOrNull(usage.input_tokens),
      outputTokens: numberOrNull(usage.output_tokens),
      totalTokens:
        numberOrNull(usage.total_tokens) ??
        sumNumbers(usage.input_tokens, usage.output_tokens)
    };
  }
  return null;
}

function buildSupabaseHeaders(serviceRole, extra = {}) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${serviceRole}`,
    apikey: serviceRole,
    ...extra
  };
}

async function recordUsageEvent(env, details) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE) {
    return;
  }
  const normalized = normalizeUsageTokens(details?.provider, details?.usage);
  if (!normalized) {
    return;
  }
  const metadata = details?.metadata && typeof details.metadata === 'object' ? details.metadata : {};
  const payload = {
    provider: (details?.provider || '').toLowerCase(),
    model: stringOrNull(details?.model),
    input_tokens: normalized.inputTokens,
    output_tokens: normalized.outputTokens,
    total_tokens:
      normalized.totalTokens ?? sumNumbers(normalized.inputTokens, normalized.outputTokens),
    prompt_length: numberOrNull(metadata.promptLength),
    prompt_index: numberOrNull(metadata.promptIndex),
    session_entry_id: stringOrNull(metadata.sessionEntryId),
    user_id: stringOrNull(metadata.userId),
    user_plan: stringOrNull(metadata.plan),
    request_kind: stringOrNull(metadata.requestKind),
    is_retry: typeof metadata.isRetry === 'boolean' ? metadata.isRetry : false
  };
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/ai_usage_events`, {
      method: 'POST',
      headers: buildSupabaseHeaders(env.SUPABASE_SERVICE_ROLE, { Prefer: 'return=minimal' }),
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.warn('Failed to record AI usage event', error);
  }
}
