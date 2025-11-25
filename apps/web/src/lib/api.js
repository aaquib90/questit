export function resolveApiBase(endpoint) {
  if (!endpoint) return 'https://questit.cc/api';
  try {
    const url = new URL(endpoint);
    const segments = url.pathname.split('/').filter(Boolean);
    const apiIndex = segments.indexOf('api');
    const basePath = apiIndex >= 0 ? segments.slice(0, apiIndex + 1).join('/') : 'api';
    return `${url.origin}/${basePath}`;
  } catch {
    return 'https://questit.cc/api';
  }
}

export default {
  resolveApiBase
};
