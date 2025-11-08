import { displayErrorInContainer, normalizeError, isBrowser } from '../../utils/helper-functions.js';
import { reportSelfTest } from '../publish.js';

const SELFTEST_EVENT = 'questit:selftest-result';

function ensureDebugPanel(container) {
  let panel = container.querySelector('.questit-debug-panel');
  if (panel) return panel;
  panel = document.createElement('aside');
  panel.className = 'questit-debug-panel';
  panel.style.display = 'none';
  panel.innerHTML = `
    <div class="questit-debug-header">
      <strong>Debug</strong>
      <button type="button" class="questit-debug-close">×</button>
    </div>
    <div class="questit-debug-body">
      <div class="questit-selftest-status">No self-test run yet.</div>
      <pre class="questit-selftest-details"></pre>
    </div>
  `;
  container.appendChild(panel);
  panel.querySelector('.questit-debug-close').addEventListener('click', () => {
    panel.style.display = 'none';
  });
  return panel;
}

function updatePanel(panel, result) {
  const status = panel.querySelector('.questit-selftest-status');
  const details = panel.querySelector('.questit-selftest-details');
  if (!status || !details) return;
  status.textContent = result?.pass ? 'Self-test: PASS' : 'Self-test: FAIL';
  details.textContent = typeof result?.details === 'string' ? result.details : JSON.stringify(result?.details || {}, null, 2);
}

export function attachSelfTest(tool, container) {
  if (!isBrowser) return () => {};
  const panel = ensureDebugPanel(container);

  const onResult = async (event) => {
    const result = event.detail || {};
    try {
      updatePanel(panel, result);
      panel.style.display = 'block';
      // Persist locally
      try {
        const key = `questit-selftest-${tool.id}`;
        localStorage.setItem(key, JSON.stringify({ ...result, at: new Date().toISOString() }));
      } catch (_) {}
      // Report to Supabase via API (non-blocking)
      if (tool.id) {
        reportSelfTest(tool.id, result).catch(err => {
          console.warn('Failed to report self-test to Supabase:', err);
        });
      }
    } catch (error) {
      displayErrorInContainer(container, normalizeError(error, { stage: 'selftest-update' }));
    }
  };

  window.addEventListener(SELFTEST_EVENT, onResult);
  container.addEventListener(SELFTEST_EVENT, onResult);

  // Return cleanup
  return () => {
    window.removeEventListener(SELFTEST_EVENT, onResult);
    container.removeEventListener(SELFTEST_EVENT, onResult);
  };
}

export function triggerSelfTest(tool, container) {
  if (!isBrowser) return;
  const script = document.createElement('script');
  script.type = 'module';
  script.textContent = `(() => {
    const dispatch = (detail) => window.dispatchEvent(new CustomEvent('${SELFTEST_EVENT}', { detail }));
    try {
      if (typeof window.runSelfCheck === 'function') {
        Promise.resolve(window.runSelfCheck()).then((result) => {
          const ok = !!(result && (result.pass === true || result.success === true));
          dispatch({ pass: ok, details: result });
        }).catch((err) => {
          dispatch({ pass: false, details: { message: err?.message || 'Self-test failed', stack: err?.stack || null } });
        });
      } else {
        dispatch({ pass: false, details: { message: 'runSelfCheck() not found in tool code' } });
      }
    } catch (error) {
      dispatch({ pass: false, details: { message: error?.message || 'Self-test crashed', stack: error?.stack || null } });
    }
  })();`;
  container.appendChild(script);
}

export default {
  attachSelfTest,
  triggerSelfTest
};


