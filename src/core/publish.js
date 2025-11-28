function buildEndpoint(base, path) {
  const trimmed = (base || '').replace(/\/+$/, '');
  const fullPath = path.startsWith('/') ? path : `/${path}`;
  if (!trimmed) {
    return fullPath;
  }
  if (trimmed.endsWith(fullPath) || trimmed.endsWith(`${fullPath}/`)) {
    return trimmed;
  }
  if (fullPath === '/tools/publish') {
    if (trimmed.endsWith('/tools')) {
      return `${trimmed}/publish`;
    }
    if (trimmed.endsWith('/tools/')) {
      return `${trimmed}publish`;
    }
  }
  if (fullPath === '/selftest/report') {
    if (trimmed.endsWith('/selftest')) {
      return `${trimmed}/report`;
    }
    if (trimmed.endsWith('/selftest/')) {
      return `${trimmed}report`;
    }
  }
  return `${trimmed}${fullPath}`;
}

export async function publishTool(tool, apiBase = 'https://questit.cc/api', options = {}) {
  const url = buildEndpoint(apiBase, '/tools/publish');
  const { authToken, getAuthToken } = options;
  let resolvedAuthToken = authToken || null;
  if (!resolvedAuthToken && typeof getAuthToken === 'function') {
    try {
      resolvedAuthToken = await getAuthToken();
    } catch {
      resolvedAuthToken = null;
    }
  }
  const headers = { 'Content-Type': 'application/json' };
  if (resolvedAuthToken) {
    headers.Authorization = `Bearer ${resolvedAuthToken}`;
  }
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(tool)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Publish failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function reportSelfTest(instanceId, result, apiBase = 'https://questit.cc/api') {
  const url = buildEndpoint(apiBase, '/selftest/report');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instance_id: instanceId, pass: !!result?.pass, details: result?.details || {} })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Self-test report failed: ${res.status} ${text}`);
  }
  return res.json();
}

export default { publishTool, reportSelfTest };
