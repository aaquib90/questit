import { queryAIModel } from './ai-model.js';

const PLACEHOLDER_PATTERNS = [
  /your[-_]?(repo|repository|username)/i,
  /example[-_]?repo/i,
  /^https?:\/\/github\.com\/(example|sample)\/?/i
];

function sanitizeSuggestions(rawSuggestions = []) {
  return rawSuggestions
    .filter((repo) => repo && typeof repo.url === 'string')
    .filter((repo) => !PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(repo.url)))
    .map((repo) => ({
      url: repo.url.trim(),
      description: repo.description,
      files: Array.isArray(repo.files) ? repo.files : [],
      license: repo.license || 'Unknown',
      complexity: repo.complexity || 'medium'
    }));
}

export async function findRelevantRepos(intent, apiConfig = {}) {
  const systemPrompt = `You help pick small, permissive-licensed repos to adapt into micro-tools. Return a JSON array of up to 3 repos with: url, description, files (array), license, complexity (small|medium|large). Prefer maintained, MIT/Apache, simple codebases. Avoid placeholder names like "yourusername" or example repositories.`;

  const user = JSON.stringify({ intent });
  const response = await queryAIModel(
    systemPrompt,
    user,
    { response_format: { type: 'json_object' } },
    apiConfig
  );

  let suggestions;
  try {
    suggestions = JSON.parse(response);
  } catch (error) {
    throw new Error('Failed to parse repository suggestions');
  }

  const list = Array.isArray(suggestions) ? suggestions : suggestions?.repos || [];
  return sanitizeSuggestions(list);
}

export default { findRelevantRepos };

