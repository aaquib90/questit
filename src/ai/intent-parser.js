import { queryAIModel } from './ai-model.js';
import { createToolError } from '../utils/helper-functions.js';
import { getArchetypePreset } from './prompts/presets.js';

const DEFAULT_INTENT = {
  action: 'generate',
  category: 'general',
  confidence: 0.5,
  errorHandlingRequired: true,
  originalPrompt: ''
};

function buildSystemPrompt() {
  return `You are Questit's intent parser.\n\nAnalyse the user prompt and respond with a JSON object containing:\n- action: verb that describes the main task (e.g. "calculate", "convert").\n- category: noun describing tool domain (e.g. "finance", "productivity", "data").\n- successCriteria: array of acceptance criteria.\n- testingHints: array of quick sanity checks the generated tool must run.\n- errorHandlingNotes: guidance on what errors must be caught and how to describe them to the user.\n- dataNeeds: list of any required input data or context.\n- confidence: float between 0 and 1.\n\nEmphasise that the downstream code must:\n- Validate inputs before processing.\n- Surface failures with descriptive messages.\n- Avoid external services unless explicitly requested.\n`;
}

export async function detectIntent(userPrompt, context = {}, apiConfig = {}) {
  if (!userPrompt) {
    throw createToolError('A user prompt is required to detect intent.');
  }

  const systemPrompt = buildSystemPrompt();
  const completion = await queryAIModel(systemPrompt, userPrompt, {
    response_format: { type: 'json_object' }
  }, apiConfig);

  try {
    const parsed = typeof completion === 'string' ? JSON.parse(completion) : completion;
    const archetype = parsed?.archetype || null;
    const preset = archetype ? getArchetypePreset(archetype) : null;
    return {
      ...DEFAULT_INTENT,
      ...parsed,
      originalPrompt: userPrompt,
      context,
      preset
    };
  } catch (error) {
    throw createToolError('Failed to understand your request', { cause: error });
  }
}

export default {
  detectIntent
};

