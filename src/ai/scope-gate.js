/**
 * Scope gate: decides if a prompt is within limits for a mini-app.
 * Returns: { decision: 'allow'|'refine'|'reject', reasons: string[], metrics }
 */

const DEFAULT_LIMITS = {
  maxFiles: 6,
  maxLoC: 2000,
  maxBytes: 350 * 1024
};

const HEAVY_KEYWORDS = ['pdf', 'ffmpeg', 'opencv', 'ocr', 'scrape', 'crawler', 'selenium', 'video transcode'];

const NETWORK_ALLOWLIST = [
  'api.github.com',
  'raw.githubusercontent.com'
];

export function estimateComplexitySignals(prompt) {
  const text = (prompt || '').toLowerCase();
  const heavyHits = HEAVY_KEYWORDS.filter(k => text.includes(k));
  const requiresNetwork = /\b(api|fetch|http|https|scrape)\b/.test(text);
  return {
    predictedFileCount: heavyHits.length > 0 ? 6 : 4,
    predictedLoC: heavyHits.length > 0 ? 1800 : 900,
    bundleBytes: heavyHits.length > 0 ? 320 * 1024 : 180 * 1024,
    requiresNetwork,
    heavyHits
  };
}

export function scopeGateRequest(prompt, limits = DEFAULT_LIMITS) {
  const metrics = estimateComplexitySignals(prompt);
  const reasons = [];

  if (metrics.predictedFileCount > limits.maxFiles) reasons.push('predicted file count too high');
  if (metrics.predictedLoC > limits.maxLoC) reasons.push('predicted lines of code too high');
  if (metrics.bundleBytes > limits.maxBytes) reasons.push('predicted bundle size too large');
  if (metrics.heavyHits.length > 0) reasons.push(`heavy compute signals: ${metrics.heavyHits.join(', ')}`);

  if (reasons.length === 0) {
    return { decision: 'allow', reasons, metrics };
  }

  // Marginal if only one soft reason
  if (reasons.length === 1 && metrics.bundleBytes < limits.maxBytes * 1.2) {
    return { decision: 'refine', reasons, metrics };
  }

  return { decision: 'reject', reasons, metrics };
}

export function isDomainAllowlisted(hostname) {
  return NETWORK_ALLOWLIST.includes(hostname);
}

export default { scopeGateRequest, estimateComplexitySignals };


