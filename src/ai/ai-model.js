/**
 * Thin client wrapper to call the platform's AI proxy (Cloudflare Worker).
 * Keys remain server-side; client sends structured prompts.
 */

export async function queryAIModel(systemPrompt, userContent, options = {}, apiConfig = {}) {
  const endpoint = apiConfig.endpoint || 'https://questit.cc/api/ai/proxy';
  const provider = (options?.provider || apiConfig.provider || 'openai').toLowerCase();
  const mergedOptions = { ...options };
  delete mergedOptions.provider;

  const selectedModel = mergedOptions.model || apiConfig.model;
  if (selectedModel && !mergedOptions.model) {
    mergedOptions.model = selectedModel;
  }

  const body = {
    system: systemPrompt,
    input: userContent,
    provider,
    options: mergedOptions
  };

  if (selectedModel) {
    body.model = selectedModel;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`AI proxy failed: ${response.status} ${text}`);
  }

  // Expecting JSON response (can be string JSON from model)
  const data = await response.text();
  return data;
}

export default { queryAIModel };

