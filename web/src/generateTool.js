const SYSTEM_PROMPT = `You are Questit, a UI micro-tool generator.
Return ONLY valid JSON with keys: html, css, js.
- html must be a full snippet (no <html> wrapper needed, we'll embed it).
- css must be raw CSS (omit <style> tags).
- js must be raw JavaScript (omit <script> tags).
- Keep everything self-contained (no external resources).
- Include basic UI (inputs/buttons) and client-side logic only.
- Match the Questit workbench styling by using the provided classes (questit-ui-button, questit-ui-card, questit-ui-input, questit-ui-form-control, questit-ui-badge) or calling window.questit?.kit?.ui.templates helpers.
- Entire solution must execute in the browser; do not rely on Node.js APIs, server helpers, or remote conversion services. Prefer browser-compatible libraries (e.g. WebAssembly modules like pdf.js) when heavy processing is required.`;

const DEFAULT_ENDPOINT = 'https://questit.cc/api/ai/proxy';

function buildIterationInput(prompt, previousCode) {
  if (!previousCode) return prompt;

  const { html = '', css = '', js = '' } = previousCode;
  return `You previously generated this tool. Update it while keeping the structure self-contained.

Existing HTML:
${html || '// no html'}

Existing CSS:
${css || '// no css'}

Existing JavaScript:
${js || '// no js'}

Apply the following update instructions:
${prompt}

Return the complete updated tool (html, css, js) as JSON.`;
}

export async function generateTool(
  prompt,
  endpoint = DEFAULT_ENDPOINT,
  previousCode,
  modelConfig = {}
) {
  const provider = (modelConfig.provider || 'openai').toLowerCase();
  const defaultModel = provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini';
  const model = modelConfig.model || defaultModel;

  const body = {
    system: SYSTEM_PROMPT,
    input: buildIterationInput(prompt, previousCode),
    provider,
    model,
    options: {
      response_format: { type: 'json_object' },
      temperature: 0.2,
      model
    }
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const fallbackText = await res.text().catch(() => '');
    let parsedError = null;
    try {
      parsedError = fallbackText ? JSON.parse(fallbackText) : null;
    } catch {
      parsedError = null;
    }

    const upstreamMessage =
      parsedError?.error?.message ||
      parsedError?.message ||
      fallbackText ||
      '';

    let friendlyMessage = '';
    if (res.status === 503 && upstreamMessage.toLowerCase().includes('overloaded')) {
      friendlyMessage =
        'The selected model is temporarily overloaded. Please try again in a few seconds or pick a different model.';
    } else if (res.status === 429) {
      friendlyMessage =
        'We are sending requests too quickly. Wait a moment and try again.';
    } else if (res.status >= 500) {
      friendlyMessage =
        'The AI service returned an unexpected error. Please retry shortly.';
    }

    const error = new Error(
      friendlyMessage ||
        `The AI service returned an error (status ${res.status}).`
    );
    error.name = 'AiProxyError';
    error.status = res.status;
    error.details = parsedError || upstreamMessage || null;
    throw error;
  }

  const raw = await res.text();
  if (!raw) {
    throw new Error('AI proxy returned an empty response.');
  }

  const parseResponse = (payload) => {
    if (typeof payload !== 'string') {
      return payload;
    }
    const trimmed = payload.trim();

    const stripCodeFence = (text) => {
      const fence = text.match(/```(?:json)?\s*([\s\S]+?)```/i);
      if (fence) {
        return fence[1].trim();
      }
      return text;
    };

    const attemptParse = (text) => {
      const cleaned = stripCodeFence(text);
      try {
        return JSON.parse(cleaned);
      } catch {
        const fallbackMatch = cleaned.match(/\{[\s\S]*\}/);
        if (fallbackMatch) {
          return JSON.parse(fallbackMatch[0]);
        }
        throw new Error('Response did not contain valid JSON.');
      }
    };

    try {
      return attemptParse(trimmed);
    } catch {
      const simplified = trimmed
        .replace(/,\s*([}\]])/g, '$1') // drop trailing commas
        .replace(/:\s*'([^']*)'/g, ': "$1"') // convert single quotes to double
        .replace(/\\(?!["\\/bfnrtu])/g, '\\\\'); // escape stray backslashes
      return attemptParse(simplified);
    }
  };

  let parsed;
  try {
    parsed = parseResponse(raw);
  } catch (error) {
    throw new Error(
      error?.message
        ? `Failed to parse AI response as JSON: ${error.message}`
        : 'Failed to parse AI response as JSON.'
    );
  }

  const { html = '', css = '', js = '' } = parsed;
  if (!html && !css && !js) {
    throw new Error('AI response missing html/css/js fields.');
  }

  return { html, css, js };
}

export default { generateTool };
