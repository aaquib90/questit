import { detectIntent } from './ai/intent-parser.js';
import { findRelevantRepos } from './ai/repo-finder.js';
import { fetchRepoCode } from './core/repo-fetcher.js';
import { analyzeCode } from './core/code-analyzer.js';
import { adaptCode } from './ai/code-adapter.js';
import { assembleTool } from './core/tool-assembler.js';
import { renderTool } from './delivery/render-handler.js';
import { createEmbedCode } from './delivery/embed-handler.js';
import { prepareDownload } from './delivery/download-handler.js';
import { scopeGateRequest } from './ai/scope-gate.js';
import { generateUniqueId } from './utils/helper-functions.js';

class Questit {
  constructor(apiConfig = {}) {
    this.apiConfig = apiConfig;
    this.currentTool = null;
  }

  async process(userPrompt, context = {}, deliveryMethod = 'render') {
    // Scope gate first
    const gate = scopeGateRequest(userPrompt);
    if (gate.decision === 'reject') {
      const error = new Error(`Out of scope: ${gate.reasons.join(', ')}`);
      error.details = gate;
      throw error;
    }

    try {
      const intent = await detectIntent(userPrompt, context, this.apiConfig);
      const repoSuggestions = await findRelevantRepos(intent, this.apiConfig);
      const fetchErrors = [];
      let selectedRepo = null;
      let repoCode = { repoUrl: null, owner: null, repo: null, files: {} };

      for (const candidate of repoSuggestions) {
        try {
          const fetched = await fetchRepoCode(candidate.url, candidate.files);
          selectedRepo = candidate;
          repoCode = fetched;
          break;
        } catch (error) {
          fetchErrors.push({
            url: candidate.url,
            message: error?.message || 'Unknown repo fetch error'
          });
        }
      }

      const effectiveContext = {
        ...context,
        repoFallback: !selectedRepo,
        repoFetchErrors: fetchErrors,
        repoSuggestions
      };

      const codeAnalysis = await analyzeCode(repoCode);
      const adaptedCode = await adaptCode(
        userPrompt,
        intent,
        repoCode,
        codeAnalysis,
        effectiveContext,
        this.apiConfig
      );
      const tool = assembleTool(adaptedCode, intent, selectedRepo || {});

      tool.id = tool.id || generateUniqueId('tool');
      tool.createdAt = new Date();
      tool.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      tool.sourceRepo = selectedRepo?.url || null;
      tool.license = selectedRepo?.license || tool.license || 'Unknown';
      tool.metadata = {
        repo: selectedRepo,
        repoFallback: !selectedRepo,
        repoFetchErrors: fetchErrors,
        repoSuggestions
      };

      this.currentTool = tool;

      switch (deliveryMethod) {
        case 'render':
          return renderTool(tool);
        case 'embed':
          return createEmbedCode(tool);
        case 'download':
          return prepareDownload(tool);
        default:
          return tool;
      }
    } catch (error) {
      console.error('Error processing request:', error);
      throw error;
    }
  }
}

export default Questit;

