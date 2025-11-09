import { clearErrorFromContainer, displayErrorInContainer, isBrowser, normalizeError } from '../utils/helper-functions.js';
import { attachSelfTest, triggerSelfTest } from '../core/self-test/harness.js';
import { getBrowserKit } from './browser-kit.js';
import { QUESTIT_UI_STYLES } from './ui-kit.js';

const RUNTIME_VERSION = '2025.11.09';

function createBaseContainer(tool) {
  const container = document.createElement('section');
  container.className = 'questit-tool-container';
  container.dataset.toolId = tool.id;

  const header = document.createElement('header');
  header.className = 'questit-tool-header';
  header.innerHTML = `
    <div class="questit-tool-meta">
      <h2>${tool.title}</h2>
      ${tool.description ? `<p>${tool.description}</p>` : ''}
    </div>
    <div class="questit-tool-actions"></div>
  `;

  const body = document.createElement('div');
  body.className = 'questit-tool-body';
  body.innerHTML = tool.html;

  const errorBanner = document.createElement('div');
  errorBanner.className = 'questit-tool-error';
  errorBanner.style.display = 'none';

  container.appendChild(errorBanner);
  container.appendChild(header);
  container.appendChild(body);

  return { container, body };
}

function attachStyles(container, css) {
  if (!css) return;
  const style = document.createElement('style');
  style.className = 'questit-tool-style';
  style.textContent = `
    .questit-tool-container { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; background: #fff; color: #111827; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.1); }
    .questit-tool-header { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
    .questit-tool-header h2 { font-size: 1.25rem; margin: 0; }
    .questit-tool-header p { margin: 0; color: #4b5563; }
    .questit-tool-body { display: flex; flex-direction: column; gap: 12px; }
    .questit-tool-error { border: 1px solid #fda4af; background: #fef2f2; color: #7f1d1d; padding: 12px; border-radius: 8px; margin-bottom: 12px; font-size: 0.9rem; }
    .questit-tool-error details { margin-top: 8px; }
    .questit-tool-error summary { cursor: pointer; }
    .questit-tool-error pre { white-space: pre-wrap; background: rgba(255,255,255,0.6); padding: 8px; border-radius: 6px; }
    .questit-tool-actions { display: flex; gap: 8px; align-items: center; }
    .questit-tool-actions button { border: 1px solid #d1d5db; background: #f9fafb; padding: 6px 10px; border-radius: 8px; cursor: pointer; }
    .questit-tool-actions button:hover { background: #f3f4f6; }
    .questit-debug-panel { border: 1px dashed #cbd5e1; background: #f8fafc; padding: 12px; border-radius: 8px; margin-top: 12px; }
    .questit-debug-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .questit-debug-header .questit-debug-close { border: none; background: transparent; cursor: pointer; font-size: 18px; line-height: 1; }
  `;
  style.textContent += `\n${QUESTIT_UI_STYLES}`;
  style.textContent += `\n${css}`;
  container.prepend(style);
}

function bindErrorListeners(tool, container) {
  const errorHandler = (event) => {
    const rawError = event.detail || event;
    const payload = normalizeError(rawError, { stage: 'runtime', toolId: tool.id });
    tool.errorState.hasError = true;
    tool.errorState.lastError = payload;
    tool.errorState.history.push(payload);
    displayErrorInContainer(container, payload);
  };

  const resetHandler = () => {
    tool.errorState.hasError = false;
    tool.errorState.lastError = null;
    clearErrorFromContainer(container);
  };

  window.addEventListener('questit:tool-error', errorHandler);
  container.addEventListener('questit:tool-error', errorHandler);
  container.addEventListener('questit:tool-reset', resetHandler);

  return () => {
    window.removeEventListener('questit:tool-error', errorHandler);
    container.removeEventListener('questit:tool-error', errorHandler);
    container.removeEventListener('questit:tool-reset', resetHandler);
  };
}

function executeTool(tool, container) {
  clearErrorFromContainer(container);

  Array.from(container.querySelectorAll('script[data-tool-id]')).forEach((script) => {
    try {
      const parent = script?.parentNode;
      if (parent && typeof parent.removeChild === 'function' && parent.contains(script)) {
        parent.removeChild(script);
      }
    } catch (removeError) {
      console.warn('Questit preview cleanup skipped a script removal', removeError);
    }
  });

  const script = document.createElement('script');
  script.type = 'module';
  script.dataset.toolId = tool.id;
  script.textContent = tool.executionBundle || tool.js;
  container.appendChild(script);
}

function ensureRuntimeRegistration(tool, container, body, controls) {
  if (!isBrowser) return null;

  const kit = getBrowserKit();
  const global = window.questit = window.questit || {};

  if (!global.runtime) {
    const toolRegistry = new Map();
    const runtime = {
      version: RUNTIME_VERSION,
      kit,
      listTools: () => Array.from(toolRegistry.keys()),
      getToolState: (id) => {
        const entry = toolRegistry.get(id);
        if (!entry) return null;
        const { tool: state } = entry;
        return {
          id,
          title: state.title,
          description: state.description,
          container: entry.container,
          errorState: state.errorState,
          metadata: state.metadata || null,
          createdAt: state.createdAt || null
        };
      },
      runSelfTest: (id) => {
        const entry = toolRegistry.get(id);
        if (entry) {
          entry.runSelfTest();
        }
      },
      resetTool: (id) => {
        const entry = toolRegistry.get(id);
        if (entry) {
          entry.reset();
        }
      },
      disposeTool: (id) => {
        const entry = toolRegistry.get(id);
        if (!entry) return false;
        entry.dispose();
        toolRegistry.delete(id);
        return true;
      },
      kitHistory: () => kit.history()
    };

    Object.defineProperty(runtime, '__register', {
      value: (id, entry) => {
        toolRegistry.set(id, entry);
        return () => {
          if (toolRegistry.get(id) === entry) {
            toolRegistry.delete(id);
          }
        };
      },
      enumerable: false
    });

    global.runtime = runtime;
  }

  if (typeof global.runtime.__register !== 'function') {
    return null;
  }

  return global.runtime.__register(tool.id, {
    tool,
    container,
    body,
    reset: controls.reset,
    runSelfTest: controls.runSelfTest,
    dispose: controls.dispose
  });
}

export function renderTool(tool, options = {}) {
  if (!isBrowser) {
    throw new Error('renderTool can only be executed in a browser-like environment');
  }

  const { container, body } = createBaseContainer(tool);
  attachStyles(container, tool.css);

  let cleanupListeners = null;
  let cleanupSelfTest = attachSelfTest(tool, container);

  const runTool = ({ dispatchReset = false } = {}) => {
    if (cleanupListeners) {
      cleanupListeners();
    }
    cleanupListeners = bindErrorListeners(tool, container);
    executeTool(tool, body);
    if (dispatchReset) {
      container.dispatchEvent(new CustomEvent('questit:tool-reset'));
    }
    triggerSelfTest(tool, body);
  };

  const runtimeDisposer = ensureRuntimeRegistration(tool, container, body, {
    reset: () => runTool({ dispatchReset: true }),
    runSelfTest: () => triggerSelfTest(tool, body),
    dispose: () => {
      if (cleanupListeners) {
        cleanupListeners();
        cleanupListeners = null;
      }
      if (cleanupSelfTest) {
        cleanupSelfTest();
        cleanupSelfTest = null;
      }
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  });

  const actions = container.querySelector('.questit-tool-actions');
  if (actions) {
    const retryButton = document.createElement('button');
    retryButton.type = 'button';
    retryButton.className = 'questit-tool-retry';
    retryButton.textContent = 'Retry';
    retryButton.addEventListener('click', () => {
      runTool({ dispatchReset: true });
    });
    actions.appendChild(retryButton);

    const debugButton = document.createElement('button');
    debugButton.type = 'button';
    debugButton.className = 'questit-tool-debug';
    debugButton.textContent = 'Debug';
    debugButton.addEventListener('click', () => {
      const panel = container.querySelector('.questit-debug-panel');
      if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      }
      triggerSelfTest(tool, body);
    });
    actions.appendChild(debugButton);
  }

  try {
    runTool();
  } catch (error) {
    displayErrorInContainer(container, error);
  }

  if (options.mountPoint) {
    options.mountPoint.appendChild(container);
  }

  if (typeof options.onRendered === 'function') {
    options.onRendered(container);
  }

  // Return container; caller may choose to unmount; ensure cleanup when needed
  Object.defineProperty(container, 'questitUnmount', {
    value: () => {
      if (runtimeDisposer) {
        runtimeDisposer();
      }
      if (cleanupListeners) {
        cleanupListeners();
        cleanupListeners = null;
      }
      if (cleanupSelfTest) {
        cleanupSelfTest();
        cleanupSelfTest = null;
      }
    },
    enumerable: false
  });

  return container;
}

export default {
  renderTool
};
