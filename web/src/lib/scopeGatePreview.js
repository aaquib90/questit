const DEFAULT_LIMITS = {
  maxFiles: 6,
  maxLoC: 2000,
  maxBytes: 350 * 1024
};

const HEAVY_KEYWORDS = ['pdf', 'ffmpeg', 'opencv', 'ocr', 'scrape', 'crawler', 'selenium', 'video transcode'];

export function estimateComplexitySignals(prompt) {
  const text = (prompt || '').toLowerCase();
  const heavyHits = HEAVY_KEYWORDS.filter((keyword) => text.includes(keyword));
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

  if (metrics.predictedFileCount > limits.maxFiles) reasons.push('Too many files expected');
  if (metrics.predictedLoC > limits.maxLoC) reasons.push('Lines of code estimate too high');
  if (metrics.bundleBytes > limits.maxBytes) reasons.push('Bundle size estimate too large');
  if (metrics.heavyHits.length > 0) {
    reasons.push(`Heavy requirements detected: ${metrics.heavyHits.join(', ')}`);
  }

  if (reasons.length === 0) {
    return { decision: 'allow', reasons, metrics };
  }

  if (reasons.length === 1 && metrics.bundleBytes < limits.maxBytes * 1.2) {
    return { decision: 'refine', reasons, metrics };
  }

  return { decision: 'reject', reasons, metrics };
}

