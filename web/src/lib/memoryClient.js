import { useCallback, useEffect, useMemo, useState } from 'react';
import { createMemoryAdapter } from '@questit/core/delivery/memory-adapter.js';

function createAuthResolver(supabase) {
  if (!supabase) {
    return null;
  }
  return async () => {
    try {
      const { data } = await supabase.auth.getSession();
      return data?.session?.access_token || null;
    } catch {
      return null;
    }
  };
}

export function createMemoryClient({ apiBase = '/api', supabase } = {}) {
  const adapter = createMemoryAdapter({
    apiBase,
    getAuthToken: createAuthResolver(supabase)
  });

  return {
    ensureSessionId: adapter.ensureSessionId,
    async list(toolId, options) {
      return adapter.fetchAll(toolId, options);
    },
    async set(toolId, key, value) {
      return adapter.upsert(toolId, key, value);
    },
    async remove(toolId, key) {
      return adapter.remove(toolId, key);
    },
    setAuthTokenResolver: adapter.setAuthTokenResolver
  };
}

export function useToolMemory(toolId, { apiBase = '/api', supabase, enabled = true } = {}) {
  const client = useMemo(
    () => createMemoryClient({ apiBase, supabase }),
    [apiBase, supabase]
  );

  const [state, setState] = useState({
    status: 'idle',
    entries: [],
    error: null
  });

  const refresh = useCallback(
    async (opts = {}) => {
      if (!enabled || !toolId) return;
      const { silent = false } = opts;
      if (!silent) {
        setState((prev) => ({ ...prev, status: 'loading', error: null }));
      }
      try {
        const entries = await client.list(toolId);
        setState({ status: 'success', entries, error: null });
      } catch (error) {
        setState({ status: 'error', entries: [], error });
      }
    },
    [client, enabled, toolId]
  );

  useEffect(() => {
    client.ensureSessionId();
  }, [client]);

  useEffect(() => {
    if (!enabled || !toolId) return;
    refresh();
  }, [enabled, toolId, refresh]);

  const setMemory = useCallback(
    async (key, value) => {
      if (!toolId) {
        throw new Error('toolId is required to set memory');
      }
      const record = await client.set(toolId, key, value);
      setState((prev) => {
        const entries = prev.entries.filter((entry) => entry.memory_key !== key);
        if (record) {
          entries.push(record);
        }
        return { ...prev, status: 'success', entries };
      });
      return record;
    },
    [client, toolId]
  );

  const removeMemory = useCallback(
    async (key) => {
      if (!toolId) {
        throw new Error('toolId is required to remove memory');
      }
      await client.remove(toolId, key);
      setState((prev) => ({
        ...prev,
        status: 'success',
        entries: prev.entries.filter((entry) => entry.memory_key !== key)
      }));
    },
    [client, toolId]
  );

  const memoryMap = useMemo(() => {
    return state.entries.reduce((acc, entry) => {
      acc[entry.memory_key] = entry.memory_value;
      return acc;
    }, {});
  }, [state.entries]);

  return {
    status: state.status,
    entries: state.entries,
    error: state.error,
    memory: memoryMap,
    refresh,
    setMemory,
    removeMemory,
    ensureSessionId: client.ensureSessionId
  };
}

export default {
  createMemoryClient,
  useToolMemory
};
