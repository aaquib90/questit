import { isBrowser } from '../utils/helper-functions.js';

function generateSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function normaliseBase(base) {
  if (base) {
    return base.replace(/\/$/, '');
  }
  if (isBrowser && window?.location) {
    return `${window.location.origin.replace(/\/$/, '')}/api`;
  }
  return '/api';
}

export function createMemoryAdapter(config = {}) {
  const storageKey = 'questit-session-id';
  const normalisedBase = normaliseBase(config.apiBase);
  let authTokenResolver = config.getAuthToken;
  let cachedSessionId = null;

  const ensureSessionId = () => {
    if (cachedSessionId) return cachedSessionId;
    if (!isBrowser) return null;

    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        cachedSessionId = stored;
      }
    } catch {
      // ignore localStorage errors
    }

    if (!cachedSessionId) {
      cachedSessionId = generateSessionId();
      try {
        window.localStorage.setItem(storageKey, cachedSessionId);
      } catch {
        // noop
      }
    }

    try {
      if (typeof document !== 'undefined') {
        document.cookie = `questit_session_id=${cachedSessionId}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {
      // ignore cookie issues
    }

    return cachedSessionId;
  };

  const buildHeaders = async ({ hasBody = false } = {}) => {
    const headers = {};
    const sessionId = ensureSessionId();
    if (sessionId) {
      headers['X-Questit-Session-Id'] = sessionId;
    }
    if (hasBody) {
      headers['Content-Type'] = 'application/json';
    }
    if (typeof authTokenResolver === 'function') {
      try {
        const token = await authTokenResolver();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // ignore auth resolution errors
      }
    }
    return headers;
  };

  const buildUrl = (path) => `${normalisedBase}${path}`;

  const request = async (path, options = {}) => {
    const { method = 'GET', body } = options;
    const headers = await buildHeaders({ hasBody: body != null });
    const response = await fetch(buildUrl(path), {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined
    });
    return response;
  };

  const fetchAll = async (toolId) => {
    const res = await request(`/tools/${encodeURIComponent(toolId)}/memory`);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Failed to fetch memory for tool ${toolId}`);
    }
    const data = await res.json();
    return Array.isArray(data?.memories) ? data.memories : [];
  };

  const upsert = async (toolId, key, value) => {
    const res = await request(`/tools/${encodeURIComponent(toolId)}/memory`, {
      method: 'POST',
      body: { key, value }
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Failed to save memory entry for ${toolId}`);
    }
    const data = await res.json();
    return Array.isArray(data?.memory) ? data.memory[0] : data?.memory || null;
  };

  const remove = async (toolId, key) => {
    const res = await request(
      `/tools/${encodeURIComponent(toolId)}/memory/${encodeURIComponent(key)}`,
      { method: 'DELETE' }
    );
    if (!res.ok && res.status !== 404) {
      const text = await res.text();
      throw new Error(text || `Failed to delete memory entry for ${toolId}`);
    }
    return true;
  };

  return {
    ensureSessionId,
    fetchAll,
    upsert,
    remove,
    setAuthTokenResolver(resolver) {
      authTokenResolver = resolver;
    }
  };
}

export default {
  createMemoryAdapter
};
