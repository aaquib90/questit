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

export async function generateTool(prompt, endpoint = DEFAULT_ENDPOINT, previousCode) {
  const body = {
    system: SYSTEM_PROMPT,
    input: buildIterationInput(prompt, previousCode),
    options: {
      response_format: { type: 'json_object' },
      temperature: 0.2,
      model: 'gpt-4o-mini'
    }
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI proxy failed: ${res.status} ${text}`);
  }

  const raw = await res.text();
  if (!raw) {
    throw new Error('AI proxy returned an empty response.');
  }

  let parsed;
  try {
    parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (error) {
    throw new Error(`Failed to parse AI response as JSON: ${error.message}`);
  }

  const { html = '', css = '', js = '' } = parsed;
  if (!html && !css && !js) {
    throw new Error('AI response missing html/css/js fields.');
  }

  return { html, css, js };
}

export default { generateTool };
