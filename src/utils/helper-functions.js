/**
 * Questit helper utilities.
 *
 * The goal of this module is to expose consistent helpers that can be reused
 * across the runtime while also providing a shared error-handling toolkit.
 */

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

/**
 * Generates a reasonably unique identifier for tools, UI nodes, etc.
 * The prefix is kept short so the ID can be used in DOM attributes.
 */
export function generateUniqueId(prefix = 'questit') {
  const random = Math.random().toString(36).slice(2, 10);
  const timestamp = Date.now().toString(36);
  return `${prefix}-${timestamp}-${random}`;
}

export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Safely parses JSON and returns either the parsed data or null.
 */
export function safeJsonParse(payload, fallback = null) {
  try {
    return payload ? JSON.parse(payload) : fallback;
  } catch (error) {
    return fallback;
  }
}

/**
 * Normalises unknown error inputs into a consistent shape.
 */
export function normalizeError(error, context = {}) {
  if (!error) {
    return {
      id: generateUniqueId('error'),
      name: 'UnknownError',
      message: DEFAULT_ERROR_MESSAGE,
      stack: null,
      severity: 'error',
      context,
      timestamp: new Date().toISOString()
    };
  }

  if (error.normalized) {
    return error;
  }

  let message = DEFAULT_ERROR_MESSAGE;
  let stack = null;
  let name = 'Error';

  if (error instanceof Error) {
    message = error.message || message;
    stack = error.stack || stack;
    name = error.name || name;
  } else if (typeof error === 'string') {
    message = error;
  } else if (typeof error === 'object') {
    message = error.message || message;
    stack = error.stack || stack;
    name = error.name || name;
  }

  return {
    id: generateUniqueId('error'),
    name,
    message,
    stack,
    severity: context.severity || 'error',
    context,
    timestamp: new Date().toISOString(),
    normalized: true
  };
}

/**
 * Builds the default error state object attached to tools.
 */
export function createToolErrorState() {
  return {
    hasError: false,
    lastError: null,
    history: []
  };
}

/**
 * Standard factory used when we intentionally create an error for users.
 */
export function createToolError(message, { severity = 'error', cause, context = {} } = {}) {
  const baseError = cause instanceof Error ? cause : new Error(message);
  baseError.name = baseError.name || 'QuestitToolError';

  const normalized = normalizeError(baseError, { ...context, severity });
  normalized.message = message || normalized.message;
  return normalized;
}

/**
 * Wraps an async function ensuring any thrown error is normalised and passed to
 * the provided handler without interrupting the caller. Returns an object with
 * either a `data` or `error` property to keep consumers consistent.
 */
export function withAsyncErrorHandling(fn, { onError } = {}) {
  if (typeof fn !== 'function') {
    throw new TypeError('withAsyncErrorHandling expects a function');
  }

  return async (...args) => {
    try {
      const data = await fn(...args);
      return { data, error: null };
    } catch (error) {
      const normalised = normalizeError(error, { stage: 'asyncFunction' });
      if (typeof onError === 'function') {
        onError(normalised);
      }
      return { data: null, error: normalised };
    }
  };
}

/**
 * Utility helper that wraps fetch-like calls to ensure helpful error messages
 * when the network request fails.
 */
export async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return response;
  } catch (error) {
    throw createToolError('Network request failed', {
      cause: error,
      context: { url, options }
    });
  }
}

/**
 * Creates a simple React error boundary class when React is available. The
 * React dependency is optional – if React is not present, we return null so
 * callers can gracefully skip binding.
 */
export function createReactErrorBoundary({
  FallbackComponent,
  onError
} = {}) {
  if (!isBrowser) return null;

  try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const React = window.React || (typeof require === 'function' ? require('react') : null);
    if (!React) return null;

    class QuestitErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }

      static getDerivedStateFromError(error) {
        return { hasError: true, error: normalizeError(error, { stage: 'react-render' }) };
      }

      componentDidCatch(error, info) {
        const normalized = normalizeError(error, { stage: 'react-render', info });
        if (typeof onError === 'function') {
          onError(normalized);
        }
      }

      render() {
        if (this.state.hasError) {
          if (FallbackComponent) {
            return React.createElement(FallbackComponent, { error: this.state.error });
          }
          return React.createElement('div', { className: 'questit-error-boundary' }, this.state.error.message);
        }
        return this.props.children;
      }
    }

    return QuestitErrorBoundary;
  } catch (error) {
    console.warn('Unable to set up React error boundary', error);
    return null;
  }
}

/**
 * Pipes a normalised error into the provided DOM error display.
 */
export function displayErrorInContainer(container, error) {
  if (!isBrowser || !container) return;

  const normalised = normalizeError(error);
  // Best-effort Sentry correlation if present
  try {
    if (typeof window !== 'undefined' && window.Sentry && typeof window.Sentry.captureException === 'function') {
      const err = new Error(normalised.message);
      err.name = normalised.name || 'QuestitError';
      if (normalised.stack) err.stack = normalised.stack;
      window.Sentry.withScope(scope => {
        scope.setTag('questit.error_id', normalised.id);
        scope.setTag('questit.severity', normalised.severity || 'error');
        if (normalised.context) scope.setContext('questit.context', normalised.context);
        scope.setExtra('questit.timestamp', normalised.timestamp);
        window.Sentry.captureException(err);
      });
    }
  } catch (_) {
    // ignore Sentry failures
  }
  let errorBanner = container.querySelector('.questit-tool-error');

  if (!errorBanner) {
    errorBanner = document.createElement('div');
    errorBanner.className = 'questit-tool-error';
    container.prepend(errorBanner);
  }

  errorBanner.innerHTML = `
    <strong>${normalised.message}</strong>
    <details>
      <summary>Show details</summary>
      <pre>${normalised.stack || 'No stack trace available.'}</pre>
    </details>
  `;

  errorBanner.setAttribute('role', 'alert');
  errorBanner.style.display = 'block';
}

/**
 * Hides the error banner if present.
 */
export function clearErrorFromContainer(container) {
  if (!isBrowser || !container) return;
  const errorBanner = container.querySelector('.questit-tool-error');
  if (errorBanner) {
    errorBanner.style.display = 'none';
    errorBanner.innerHTML = '';
  }
}

export function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default {
  generateUniqueId,
  safeJsonParse,
  normalizeError,
  createToolErrorState,
  createToolError,
  withAsyncErrorHandling,
  safeFetch,
  createReactErrorBoundary,
  displayErrorInContainer,
  clearErrorFromContainer,
  createDeferred,
  delay,
  isBrowser
};

