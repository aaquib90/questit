import { createToolError } from '../utils/helper-functions.js';
import { queryAIModel } from './ai-model.js';

const DEFAULT_CI_ENDPOINT = 'https://questit.cc/api/ci/proxy';

function buildCiPrompt({ userPrompt, intent, repoContext, lastIssues, currentCode }) {
  const issueList = (lastIssues || [])
    .map((issue) => `- [${issue.severity}] ${issue.file}: ${issue.message} (${issue.id})`)
    .join('\n');

  return [
    {
      role: 'system',
      content: [
        {
          type: 'text',
          text: `You are Questit's secure code-repair assistant. Use the Code Interpreter runtime to refactor the provided micro-tool bundle.

STRICT rules:
- Never use eval(), new Function(), Function constructor, or dynamic code execution.
- Produce plain HTML, CSS, and JavaScript only.
- Ensure window.runSelfCheck exists and passes.
- Surface runtime errors via window.dispatchEvent(new CustomEvent('questit:tool-error', { detail: { message, stack }})).

Return JSON with keys: html, css, js, description, instructions.`
        }
      ]
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Original prompt: ${userPrompt}`
        },
        {
          type: 'text',
          text: `Intent summary: ${JSON.stringify(intent || {}, null, 2)}`
        },
        {
          type: 'text',
          text: `Security issues to resolve:\n${issueList || '- none'}`
        },
        {
          type: 'input_text',
          text: `Current bundle:\nHTML:\n${currentCode?.html || ''}\n\nCSS:\n${currentCode?.css || ''}\n\nJS:\n${currentCode?.js || ''}`
        },
        ...(repoContext ? [{ type: 'input_text', text: `Reference context:\n${repoContext}` }] : [])
      ]
    }
  ];
}

async function callCiProxy(payload, apiConfig = {}) {
  const endpoint = apiConfig.ciEndpoint || DEFAULT_CI_ENDPOINT;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`CI proxy failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function attemptCIRepair(params = {}, apiConfig = {}) {
  const {
    userPrompt,
    intent,
    repoContext,
    lastIssues,
    currentCode,
    timeoutMs = 60_000
  } = params;

  try {
    const body = {
      messages: buildCiPrompt({ userPrompt, intent, repoContext, lastIssues, currentCode }),
      timeout_ms: timeoutMs
    };
    const response = await callCiProxy(body, apiConfig);
    if (!response || typeof response !== 'object') {
      throw new Error('CI proxy returned invalid payload');
    }
    if (response.error) {
      throw new Error(response.error.message || 'CI proxy reported an error');
    }
    if (!response.html && !response.js) {
      throw new Error('CI proxy response missing html/js');
    }
    return {
      html: response.html || '',
      css: response.css || '',
      js: response.js || '',
      description: response.description || '',
      instructions: response.instructions || ''
    };
  } catch (error) {
    return { error: createToolError('Code Interpreter repair failed', { cause: error }) };
  }
}

export async function runCiIntentExtraction(userPrompt, context = {}, apiConfig = {}) {
  const endpoint = apiConfig.ciEndpoint || DEFAULT_CI_ENDPOINT;
  try {
    const completion = await queryAIModel(
      `You are Questit's safety intent classifier.`,
      JSON.stringify({ prompt: userPrompt, context }),
      { model: 'gpt-4o-mini' },
      { ...apiConfig, endpoint }
    );
    return typeof completion === 'string' ? JSON.parse(completion) : completion;
  } catch (error) {
    return { error: createToolError('CI intent extraction failed', { cause: error }) };
  }
}

export default {
  attemptCIRepair,
  runCiIntentExtraction
};
