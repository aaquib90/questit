import { createToolError } from '../utils/helper-functions.js';

const GITHUB_PROXY_BASE = 'https://questit.cc/api/github';

export async function fetchRepoCode(repoUrl, filePaths = []) {
  try {
    const url = repoUrl.replace(/\/$/, '');
    const parts = url.split('/');
    const owner = parts[parts.length - 2];
    const repo = parts[parts.length - 1];
    const files = {};
    const missing = [];

    if (filePaths.length > 0) {
      for (const path of filePaths) {
        const proxyUrl = `${GITHUB_PROXY_BASE}/${owner}/${repo}/main/${path}`;
        const res = await fetch(proxyUrl);
        if (res.ok) {
          files[path] = await res.text();
        } else {
          missing.push(path);
        }
      }
    }

    if (filePaths.length > 0 && Object.keys(files).length === 0) {
      throw createToolError(
        `Unable to fetch referenced files from ${owner}/${repo}. The repository or paths may be incorrect.`,
        {
          severity: 'error',
          context: { repoUrl, requestedFiles: filePaths }
        }
      );
    }

    if (missing.length > 0) {
      console.warn('Some repository files could not be fetched', { repoUrl, missing });
    }

    return { repoUrl, owner, repo, files };
  } catch (error) {
    if (error?.normalized) {
      throw error;
    }
    throw createToolError('Failed to fetch code from GitHub', {
      severity: 'error',
      cause: error,
      context: { repoUrl, filePaths }
    });
  }
}

export default { fetchRepoCode };

