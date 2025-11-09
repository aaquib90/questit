import { generateUniqueId, isBrowser, safeJsonParse } from '../utils/helper-functions.js';
import { createUiTemplates } from './ui-kit.js';

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_RETRY_DELAY_MS = 500;
const MAX_PUBLISH_QUEUE = 64;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createEventBus() {
  const listeners = new Map();

  const on = (event, handler) => {
    if (typeof handler !== 'function') {
      throw new TypeError('questit.events.on expects a function handler');
    }
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event).add(handler);
    return () => off(event, handler);
  };

  const once = (event, handler) => {
    const disposer = on(event, (...args) => {
      try {
        handler(...args);
      } finally {
        disposer();
      }
    });
    return disposer;
  };

  const off = (event, handler) => {
    const set = listeners.get(event);
    if (!set) return;
    if (handler) {
      set.delete(handler);
    } else {
      set.clear();
    }
  };

  const emit = (event, payload) => {
    const set = listeners.get(event);
    if (!set || set.size === 0) return;
    for (const handler of Array.from(set)) {
      try {
        handler(payload);
      } catch (error) {
        console.warn('questit.events handler threw', { event, error });
      }
    }
  };

  return { on, once, off, emit };
}

async function questitSafeFetch(url, options = {}, config = {}) {
  if (!isBrowser) {
    throw new Error('questitSafeFetch is only available in browser environments');
  }

  const { timeoutMs = DEFAULT_TIMEOUT_MS, retries = 0, retryDelayMs = DEFAULT_RETRY_DELAY_MS, retryOn = [] } = config;
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const mergedOptions = { ...options };
  if (controller) {
    mergedOptions.signal = controller.signal;
  }

  const startTimer = () => {
    if (!controller || timeoutMs <= 0) return () => {};
    const timer = setTimeout(() => {
      try {
        controller.abort(`questitSafeFetch timeout (${timeoutMs}ms)`);
      } catch (error) {
        console.warn('questitSafeFetch abort failed', error);
      }
    }, timeoutMs);
    return () => clearTimeout(timer);
  };

  const attemptFetch = async () => {
    const stopTimer = startTimer();
    try {
      const response = await fetch(url, mergedOptions);
      if (retryOn.includes(response.status) && retries > 0) {
        throw Object.assign(new Error(`Retryable status: ${response.status}`), { retryable: true, status: response.status });
      }
      return response;
    } catch (error) {
      if (retries > 0 || error?.retryable) {
        throw error;
      }
      throw error;
    } finally {
      stopTimer();
    }
  };

  let remaining = retries;
  while (true) {
    try {
      return await attemptFetch();
    } catch (error) {
      if (remaining <= 0) {
        throw error;
      }
      remaining -= 1;
      if (retryDelayMs > 0) {
        await delay(retryDelayMs);
      }
    }
  }
}

function createStorageAdapter(scope) {
  if (!isBrowser) {
    return {
      get() {
        return null;
      },
      set() {
        return false;
      },
      remove() {
        return false;
      },
      clear() {
        return false;
      }
    };
  }

  const storage = scope === 'session' ? window.sessionStorage : window.localStorage;

  const get = (key, fallback = null) => {
    try {
      const value = storage.getItem(key);
      if (value == null) return fallback;
      return safeJsonParse(value, value);
    } catch (error) {
      console.warn('questit.storage.get failed', { key, error });
      return fallback;
    }
  };

  const set = (key, value) => {
    try {
      const serialised = typeof value === 'string' ? value : JSON.stringify(value);
      storage.setItem(key, serialised);
      return true;
    } catch (error) {
      console.warn('questit.storage.set failed', { key, error });
      return false;
    }
  };

  const remove = (key) => {
    try {
      storage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('questit.storage.remove failed', { key, error });
      return false;
    }
  };

  const clear = () => {
    try {
      storage.clear();
      return true;
    } catch (error) {
      console.warn('questit.storage.clear failed', error);
      return false;
    }
  };

  return { get, set, remove, clear };
}

function createPublishQueue(events) {
  const queue = [];
  return {
    enqueue(event, payload) {
      const entry = { id: generateUniqueId('runtime-event'), event, payload, createdAt: Date.now() };
      queue.push(entry);
      if (queue.length > MAX_PUBLISH_QUEUE) {
        queue.shift();
      }
      events.emit(event, payload);
      events.emit('questit:event', entry);
      return entry.id;
    },
    history() {
      return [...queue];
    }
  };
}

function createBrowserKit() {
  const events = createEventBus();
  const storage = {
    local: createStorageAdapter('local'),
    session: createStorageAdapter('session')
  };
  const queue = createPublishQueue(events);
  const ui = createUiTemplates();

  return {
    version: '2025.11.09',
    events,
    safeFetch: questitSafeFetch,
    storage,
    publish: queue.enqueue,
    history: queue.history,
    ui
  };
}

let sharedKit = null;

export function getBrowserKit() {
  if (sharedKit) return sharedKit;
  sharedKit = createBrowserKit();
  if (isBrowser) {
    window.questit = window.questit || {};
    if (!window.questit.kit) {
      window.questit.kit = sharedKit;
    }
  }
  return sharedKit;
}

export default {
  getBrowserKit
};
