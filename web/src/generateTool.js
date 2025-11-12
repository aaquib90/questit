const SYSTEM_PROMPT = `You are Questit, a UI micro-tool generator.
Always return a STRICT JSON object with exactly these top-level keys: html, css, js.
- Every value MUST be a double-quoted JSON string (never template literals, never raw objects).
- Escape all backslashes and double quotes as required by RFC 8259.
- Do not wrap strings in backticks or single quotes.
- html must be a snippet (no <html> wrapper), css raw CSS (no <style>), js raw JavaScript (no <script>).
- Keep everything self-contained (no external resources).
- Include basic UI (inputs/buttons) and client-side logic only.
- Match the Questit workbench styling by using questit-ui- classes or window.questit?.kit?.ui.templates helpers.
- All solutions must run entirely in the browser; avoid server APIs or heavy compute beyond browser-compatible libraries (e.g., pdf.js).`;

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
        .replace(/:\s*`([^`\\]*(?:\\.[^`\\]*)*)`/g, (_match, content) => {
          const normalized = content
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\r?\n/g, '\\n');
          return `: "${normalized}"`;
        })
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
