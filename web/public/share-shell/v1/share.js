(() => {
  const DATA_ELEMENT_ID = 'questit-share-data';
  const ROOT_ELEMENT_ID = 'questit-share-root';
  const TOOL_ROOT_ID = 'questit-tool-root';
  const THEME_STYLE_ID = 'questit-theme-style';
  const TOOL_STYLE_ID = 'questit-tool-style';
  const TOOL_SCRIPT_ATTR = 'data-questit-tool-script';
  const SHELL_VERSION = 'v1';
  const SESSION_STORAGE_KEY = 'questit-session-id';

  const HEADER_NAV_LINKS = [
    { label: 'Workbench', href: 'https://questit.cc/#workbench' },
    { label: 'Templates', href: 'https://questit.cc/#templates' },
    { label: 'My tools', href: 'https://questit.cc/#my-tools' },
    { label: 'Docs', href: 'https://questit.cc/docs' }
  ];

  const BASE_THEME_VARS = {
    '--background': '0 0% 100%',
    '--foreground': '222.2 47.4% 11.2%',
    '--card': '0 0% 100%',
    '--card-foreground': '222.2 47.4% 11.2%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '222.2 47.4% 11.2%',
    '--primary': '160 84% 39.4%',
    '--primary-foreground': '152 81% 96%',
    '--secondary': '151 81% 92%',
    '--secondary-foreground': '164 86% 22%',
    '--muted': '210 40% 96.1%',
    '--muted-foreground': '215.4 16.3% 46.9%',
    '--accent': '151 81% 92%',
    '--accent-foreground': '164 86% 22%',
    '--destructive': '0 84.2% 60.2%',
    '--destructive-foreground': '0 0% 98%',
    '--border': '214 31.8% 91.4%',
    '--input': '214 31.8% 91.4%',
    '--ring': '160 84% 39.4%',
    '--radius': '0.75rem',
    '--font-sans':
      "'Manrope', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    '--surface': '0 0% 100%',
    '--surface-muted': '210 40% 98%',
    '--surface-subtle': '210 40% 96%',
    '--line-soft': '214 31% 91%',
    '--shadow-soft': '0 28px 64px -28px hsl(222 47% 11% / 0.22)'
  };

  const BASE_DARK_THEME_VARS = {
    '--background': '222.2 47.4% 11.2%',
    '--foreground': '210 40% 98%',
    '--card': '217.2 32.6% 17.5%',
    '--card-foreground': '210 40% 98%',
    '--popover': '217.2 32.6% 17.5%',
    '--popover-foreground': '210 40% 98%',
    '--primary': '152 90% 44%',
    '--primary-foreground': '160 84% 12%',
    '--secondary': '217.2 32.6% 17.5%',
    '--secondary-foreground': '210 40% 98%',
    '--muted': '217.2 32.6% 17.5%',
    '--muted-foreground': '215 20.2% 65.1%',
    '--accent': '217.2 32.6% 17.5%',
    '--accent-foreground': '210 40% 98%',
    '--destructive': '0 62.8% 30.6%',
    '--destructive-foreground': '0 85.7% 97.3%',
    '--border': '217.2 32.6% 17.5%',
    '--input': '217.2 32.6% 17.5%',
    '--ring': '152 90% 44%',
    '--surface': '222 47% 15%',
    '--surface-muted': '217 33% 18%',
    '--surface-subtle': '217 24% 22%',
    '--line-soft': '222 28% 28%',
    '--shadow-soft': '0 28px 60px -24px hsl(210 40% 2% / 0.54)',
    '--font-sans':
      "'Manrope', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  };

  const THEME_PRESETS = {
    emerald: {
      overrides: {},
      darkOverrides: {
        '--primary': '152 90% 44%',
        '--primary-foreground': '210 40% 98%',
        '--accent': '152 90% 44%',
        '--accent-foreground': '210 40% 98%',
        '--ring': '152 90% 44%'
      }
    },
    sky: {
      overrides: {
        '--primary': '199 89% 55%',
        '--primary-foreground': '198 100% 97%',
        '--secondary': '199 94% 90%',
        '--secondary-foreground': '200 84% 24%',
        '--accent': '199 94% 90%',
        '--accent-foreground': '200 84% 24%',
        '--ring': '199 89% 55%',
        '--muted': '199 85% 94%',
        '--muted-foreground': '204 16% 38%',
        '--border': '198 58% 88%',
        '--input': '198 58% 88%'
      },
      darkOverrides: {
        '--primary': '199 89% 55%',
        '--primary-foreground': '210 40% 98%',
        '--accent': '199 89% 55%',
        '--accent-foreground': '210 40% 98%',
        '--ring': '199 89% 55%'
      }
    },
    violet: {
      overrides: {
        '--primary': '262 84% 60%',
        '--primary-foreground': '270 100% 97%',
        '--secondary': '261 89% 94%',
        '--secondary-foreground': '264 70% 24%',
        '--accent': '261 89% 94%',
        '--accent-foreground': '264 70% 24%',
        '--ring': '262 84% 60%',
        '--muted': '261 89% 95%',
        '--muted-foreground': '265 20% 42%',
        '--border': '263 46% 88%',
        '--input': '263 46% 88%'
      },
      darkOverrides: {
        '--primary': '262 84% 60%',
        '--primary-foreground': '210 40% 98%',
        '--accent': '262 84% 60%',
        '--accent-foreground': '210 40% 98%',
        '--ring': '262 84% 60%'
      }
    },
    amber: {
      overrides: {
        '--primary': '37 92% 55%',
        '--primary-foreground': '48 96% 90%',
        '--secondary': '37 100% 88%',
        '--secondary-foreground': '32 75% 25%',
        '--accent': '37 100% 88%',
        '--accent-foreground': '32 75% 25%',
        '--ring': '37 92% 55%',
        '--muted': '42 100% 94%',
        '--muted-foreground': '30 15% 35%',
        '--border': '37 68% 85%',
        '--input': '37 68% 85%'
      },
      darkOverrides: {
        '--primary': '37 92% 55%',
        '--primary-foreground': '210 40% 98%',
        '--accent': '37 92% 55%',
        '--accent-foreground': '210 40% 98%',
        '--ring': '37 92% 55%'
      }
    },
    rose: {
      overrides: {
        '--primary': '349.7 89.2% 60.2%',
        '--primary-foreground': '355.7 100% 97.3%',
        '--secondary': '355.6 100% 94.7%',
        '--secondary-foreground': '345.3 82.7% 40.8%',
        '--accent': '355.6 100% 94.7%',
        '--accent-foreground': '345.3 82.7% 40.8%',
        '--ring': '349.7 89.2% 60.2%',
        '--muted': '355.7 100% 97.3%',
        '--muted-foreground': '343.4 79.7% 34.7%',
        '--border': '352.7 96.1% 90%',
        '--input': '352.7 96.1% 90%'
      },
      darkOverrides: {
        '--primary': '349.7 89.2% 60.2%',
        '--primary-foreground': '210 40% 98%',
        '--accent': '349.7 89.2% 60.2%',
        '--accent-foreground': '210 40% 98%',
        '--ring': '349.7 89.2% 60.2%'
      }
    },
    cyan: {
      overrides: {
        '--primary': '188.7 94.5% 42.7%',
        '--primary-foreground': '183.2 100% 96.3%',
        '--secondary': '185.1 95.9% 90.4%',
        '--secondary-foreground': '192.9 82.3% 31%',
        '--accent': '185.1 95.9% 90.4%',
        '--accent-foreground': '192.9 82.3% 31%',
        '--ring': '188.7 94.5% 42.7%',
        '--muted': '183.2 100% 96.3%',
        '--muted-foreground': '191.6 91.4% 36.5%',
        '--border': '186.2 93.5% 81.8%',
        '--input': '186.2 93.5% 81.8%'
      },
      darkOverrides: {
        '--primary': '188.7 94.5% 42.7%',
        '--primary-foreground': '210 40% 98%',
        '--accent': '188.7 94.5% 42.7%',
        '--accent-foreground': '210 40% 98%',
        '--ring': '188.7 94.5% 42.7%'
      }
    },
    indigo: {
      overrides: {
        '--primary': '238.7 83.5% 66.7%',
        '--primary-foreground': '225.9 100% 96.7%',
        '--secondary': '226.5 100% 93.9%',
        '--secondary-foreground': '244.5 57.9% 50.6%',
        '--accent': '226.5 100% 93.9%',
        '--accent-foreground': '244.5 57.9% 50.6%',
        '--ring': '238.7 83.5% 66.7%',
        '--muted': '225.9 100% 96.7%',
        '--muted-foreground': '243.4 75.4% 58.6%',
        '--border': '228 96.5% 88.8%',
        '--input': '228 96.5% 88.8%'
      },
      darkOverrides: {
        '--primary': '238.7 83.5% 66.7%',
        '--primary-foreground': '210 40% 98%',
        '--accent': '238.7 83.5% 66.7%',
        '--accent-foreground': '210 40% 98%',
        '--ring': '238.7 83.5% 66.7%'
      }
    },
    lime: {
      overrides: {
        '--primary': '83.7 80.5% 44.3%',
        '--primary-foreground': '78.3 92% 95.1%',
        '--secondary': '82.3 86.8% 89.4%',
        '--secondary-foreground': '93.7 74.1% 26.5%',
        '--accent': '82.3 86.8% 89.4%',
        '--accent-foreground': '93.7 74.1% 26.5%',
        '--ring': '83.7 80.5% 44.3%',
        '--muted': '83 86% 94%',
        '--muted-foreground': '94 20% 36%',
        '--border': '90 60% 86%',
        '--input': '90 60% 86%'
      },
      darkOverrides: {
        '--primary': '83.7 80.5% 44.3%',
        '--primary-foreground': '210 40% 98%',
        '--accent': '83.7 80.5% 44.3%',
        '--accent-foreground': '210 40% 98%',
        '--ring': '83.7 80.5% 44.3%'
      }
    }
  };

  const REMIX_MESSAGE_DEFAULT =
    "Creator hasn't added a public summary yet.";

  function generateSessionId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function normaliseApiBase(base) {
    if (base) {
      return base.replace(/\/$/, '');
    }
    if (typeof window !== 'undefined' && window.location) {
      return `${window.location.origin.replace(/\/$/, '')}/api`;
    }
    return '/api';
  }

  function ensureSessionId() {
    if (typeof window === 'undefined') return null;
    let sessionId = null;
    try {
      sessionId = window.localStorage.getItem(SESSION_STORAGE_KEY);
    } catch {
      sessionId = null;
    }
    if (!sessionId) {
      sessionId = generateSessionId();
      try {
        window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
      } catch {
        // ignore storage issues
      }
    }
    try {
      if (typeof document !== 'undefined') {
        document.cookie = `questit_session_id=${sessionId}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {
      // ignore cookie issues
    }
    return sessionId;
  }

  function createMemoryClient(toolId, apiBase) {
    const base = normaliseApiBase(apiBase);
    const request = async (targetToolId, method, key, body) => {
      if (!targetToolId) return null;
      const sessionId = ensureSessionId();
      const headers = {};
      if (sessionId) {
        headers['X-Questit-Session-Id'] = sessionId;
      }
      if (body !== undefined && body !== null) {
        headers['Content-Type'] = 'application/json';
      }
      const path =
        key != null
          ? `/tools/${encodeURIComponent(targetToolId)}/memory/${encodeURIComponent(key)}`
          : `/tools/${encodeURIComponent(targetToolId)}/memory`;
      return fetch(`${base}${path}`, {
        method,
        headers,
        body: body != null ? JSON.stringify(body) : undefined
      });
    };

    const list = async (targetToolId = toolId) => {
      const res = await request(targetToolId, 'GET');
      if (!res || !res.ok) return [];
      const data = await res.json().catch(() => ({}));
      return Array.isArray(data.memories) ? data.memories : [];
    };

    const get = async (targetToolId = toolId, key, fallback) => {
      const entries = await list(targetToolId);
      const match = entries.find((entry) => entry.memory_key === key);
      return match ? match.memory_value : fallback;
    };

    const set = async (targetToolId = toolId, key, value) => {
      const res = await request(targetToolId, 'POST', null, { key, value });
      if (!res || !res.ok) {
        const text = res ? await res.text().catch(() => '') : '';
        throw new Error(text || 'Failed to persist memory entry.');
      }
      const data = await res.json().catch(() => ({}));
      return Array.isArray(data.memory) ? data.memory[0] : data.memory || null;
    };

    const remove = async (targetToolId = toolId, key) => {
      const res = await request(targetToolId, 'DELETE', key);
      if (!res) return false;
      if (!res.ok && res.status !== 404) {
        const text = await res.text().catch(() => '');
        throw new Error(text || 'Failed to delete memory entry.');
      }
      return true;
    };

    const api = {
      ensureSessionId,
      list: () => list(),
      get: (key, fallback) => get(toolId, key, fallback),
      set: (key, value) => set(toolId, key, value),
      remove: (key) => remove(toolId, key),
      refresh: () => list(),
      forTool(targetId) {
        const resolved = targetId || toolId;
        return {
          list: () => list(resolved),
          get: (key, fallback) => get(resolved, key, fallback),
          set: (key, value) => set(resolved, key, value),
          remove: (key) => remove(resolved, key),
          refresh: () => list(resolved)
        };
      }
    };

    return api;
  }

  function attachMemoryBridge(payload) {
    const toolId = payload?.tool_id || payload?.id || null;
    const memoryMode = (payload?.memory_mode || 'none').toLowerCase();
    const memoryClient = createMemoryClient(toolId, payload?.api_base || '/api');
    window.questit = window.questit || {};
    window.questit.kit = window.questit.kit || {};
    window.questit.kit.memory = memoryClient;
    window.questit.runtime = window.questit.runtime || {};
    window.questit.runtime.memory = memoryClient;
    window.questit.runtime.memoryForTool = memoryClient.forTool.bind(memoryClient);
    window.questit.runtime.currentToolId = toolId;
    if (typeof window.questit.runtime.listTools !== 'function') {
      window.questit.runtime.listTools = () => (toolId ? [toolId] : []);
    }
    memoryClient.ensureSessionId();
    return { memoryMode, memoryClient };
  }

  function formatMemoryModeLabel(mode) {
    const lookup = (mode || '').toLowerCase();
    if (lookup === 'device') return 'This device';
    if (lookup === 'account') return 'Signed-in users';
    return 'Off';
  }

  function formatRetentionLabel(retention) {
    const lookup = (retention || '').toLowerCase();
    if (lookup === 'session') return 'Clears on reset';
    if (lookup === 'custom') return 'Custom';
    return 'Keeps data';
  }

  function parsePayload() {
    const dataEl = document.getElementById(DATA_ELEMENT_ID);
    if (!dataEl) return null;
    try {
      const json = dataEl.textContent || dataEl.innerText || '{}';
      const payload = JSON.parse(json);
      payload.shell_version = payload.shell_version || SHELL_VERSION;
      return payload;
    } catch (error) {
      console.error('Questit share: failed to parse payload', error);
      return null;
    }
  }

  function applyTheme(themeKey) {
    const key = themeKey && THEME_PRESETS[themeKey] ? themeKey : 'emerald';
    const preset = THEME_PRESETS[key];
    const lightVars = { ...BASE_THEME_VARS, ...(preset.overrides || {}) };
    const darkVars = { ...BASE_DARK_THEME_VARS, ...(preset.darkOverrides || {}) };

    const toCssVars = (vars) =>
      Object.entries(vars)
        .map(([prop, value]) => `${prop}: ${value};`)
        .join('\n');

    const style = document.getElementById(THEME_STYLE_ID) || document.createElement('style');
    style.id = THEME_STYLE_ID;
    style.textContent = `:root {\n${toCssVars(lightVars)}\n}\n.dark {\n${toCssVars(darkVars)}\n}`;
    document.head.append(style);
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatSummary(value) {
    if (!value) {
      return `<p class="questit-summary questit-summary--empty">${escapeHtml(REMIX_MESSAGE_DEFAULT)}</p>`;
    }
    const html = escapeHtml(value).replace(/\r\n|\n|\r/g, '<br>');
    return `<p class="questit-summary">${html}</p>`;
  }

  function formatModelLabel(provider, model) {
    if (!provider && !model) return 'Not specified';
    const lookup = (provider || '').toLowerCase();
    const providerLabel =
      lookup === 'openai'
        ? 'OpenAI'
        : lookup === 'gemini'
          ? 'Google Gemini'
          : provider
            ? provider.charAt(0).toUpperCase() + provider.slice(1)
            : 'Model';
    return model ? `${providerLabel} · ${model}` : providerLabel;
  }

  function formatThemeLabel(themeKey) {
    if (!themeKey) return 'Emerald';
    return themeKey.charAt(0).toUpperCase() + themeKey.slice(1);
  }

  function formatModeLabel(mode) {
    if (mode === 'dark') return 'Dark';
    if (mode === 'light') return 'Light';
    return 'System (auto)';
  }

  function setupColorMode(mode) {
    const doc = document.documentElement;
    const desired = mode === 'dark' ? 'dark' : mode === 'light' ? 'light' : 'system';

    const apply = (isDark) => {
      doc.classList.toggle('dark', !!isDark);
    };

    if (desired === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      apply(media.matches);
      const handler = (event) => apply(event.matches);
      if (media.addEventListener) {
        media.addEventListener('change', handler);
      } else if (media.addListener) {
        media.addListener(handler);
      }
      return;
    }

    apply(desired === 'dark');
  }

  function renderShell(root, payload) {
    root.classList.add('questit-shell');
    root.dataset.questitShellVersion = SHELL_VERSION;
    const summaryHtml = formatSummary(payload.public_summary);
    const modelLabel = escapeHtml(formatModelLabel(payload.model_provider, payload.model_name));
    const themeLabel = escapeHtml(formatThemeLabel(payload.theme));
    const modeLabel = escapeHtml(formatModeLabel(payload.color_mode));
    const memoryModeLabel =
      payload.memory_mode && payload.memory_mode !== 'none'
        ? escapeHtml(formatMemoryModeLabel(payload.memory_mode))
        : null;
    const retentionLabel = escapeHtml(formatRetentionLabel(payload.memory_retention));
    const title = escapeHtml(payload.title || 'Questit Tool');

    const headerNavHtml = HEADER_NAV_LINKS.map((link, index) => {
      const label = escapeHtml(link.label);
      const href = escapeHtml(link.href);
      const ariaCurrent = index === 0 ? 'aria-current="page"' : '';
      return `<a class="questit-share-nav__link" href="${href}" ${ariaCurrent}>${label}</a>`;
    }).join('');

    root.innerHTML = `
      <div class="questit-share">
        <header class="questit-share-header">
          <div class="questit-share-header__inner">
            <div class="questit-share-brand">
              <span class="questit-share-logo">Questit</span>
              <p class="questit-share-subtitle">Shared tool</p>
            </div>
            <nav class="questit-share-nav" aria-label="Questit site navigation">
              ${headerNavHtml}
            </nav>
            <div class="questit-share-actions">
              <a class="questit-share-btn questit-share-btn--primary" data-questit-action="remix" href="https://questit.cc">
                Remix in Workbench
              </a>
              <a class="questit-share-btn questit-share-btn--ghost" href="https://questit.cc" target="_blank" rel="noopener noreferrer">
                Open Questit Workspace
              </a>
            </div>
            <div class="questit-share-status" data-questit-auth data-status="signed-out">
              <span data-questit-auth-label>Viewing as guest</span>
              <a class="questit-share-status__action" data-questit-auth-action href="https://questit.cc/?login=1">
                Log in to Questit
              </a>
            </div>
          </div>
        </header>
        <section class="questit-share-card questit-share-body">
          <div class="questit-meta">
            <span class="questit-chip">Generated with Questit</span>
            <h1 data-questit-title>${title}</h1>
            <div data-questit-summary>${summaryHtml}</div>
          </div>
          <div class="questit-meta-grid">
            <div class="questit-meta-chip">
              <span>Model</span>
              <strong data-questit-model>${modelLabel}</strong>
            </div>
            <div class="questit-meta-chip">
              <span>Theme</span>
              <strong data-questit-theme>${themeLabel}</strong>
            </div>
            <div class="questit-meta-chip">
              <span>Mode</span>
              <strong data-questit-mode>${modeLabel}</strong>
            </div>
            ${
              memoryModeLabel
                ? `<div class="questit-meta-chip">
              <span>Memory</span>
              <strong>${memoryModeLabel}</strong>
              <p>${retentionLabel}</p>
            </div>`
                : ''
            }
          </div>
          <div class="questit-share-tip">
            <strong>Want to remix it?</strong>
            <p>Open this tool in the Questit workbench to customize the UI and publish your own link.</p>
          </div>
          <div class="questit-tool-frame">
            <section class="questit-tool" id="${TOOL_ROOT_ID}"></section>
          </div>
          <footer class="questit-footer">
            This tool runs entirely in the browser. Remix it in the Questit workbench to customize and publish your own copy.
          </footer>
        </section>
      </div>
    `;
  }

  function injectToolCode(payload) {
    const toolRoot = document.getElementById(TOOL_ROOT_ID);
    if (toolRoot) {
      toolRoot.innerHTML = payload.html || '<p>No content returned.</p>';
    }

    if (payload.css) {
      const existing = document.getElementById(TOOL_STYLE_ID);
      if (existing) {
        existing.textContent = payload.css;
      } else {
        const styleEl = document.createElement('style');
        styleEl.id = TOOL_STYLE_ID;
        styleEl.textContent = payload.css;
        document.head.append(styleEl);
      }
    }

    if (payload.js) {
      const scriptEl = document.createElement('script');
      scriptEl.type = 'module';
      scriptEl.setAttribute(TOOL_SCRIPT_ATTR, 'true');
      scriptEl.textContent = payload.js;
      document.body.append(scriptEl);
    }
  }

  function setupRemixLink(slug) {
    const anchor = document.querySelector('[data-questit-action="remix"]');
    if (!anchor) return;
    if (slug) {
      anchor.href = 'https://questit.cc/?remix=' + encodeURIComponent(slug);
      return;
    }
    try {
      const host = window.location.hostname || '';
      const computed = host.split('.').filter(Boolean)[0] || '';
      if (computed) {
        anchor.href = 'https://questit.cc/?remix=' + encodeURIComponent(computed);
      }
    } catch (error) {
      console.warn('Questit share: remix link fallback failed', error);
    }
  }

  function setupAuthBridge() {
    const root = document.querySelector('[data-questit-auth]');
    const label = root?.querySelector('[data-questit-auth-label]');
    const action = root?.querySelector('[data-questit-auth-action]');
    if (!root || !label || !action) return;

    const defaultAction = {
      href: action.getAttribute('href') || 'https://questit.cc/?login=1',
      text: action.textContent || 'Log in to Questit'
    };

    const setState = (state, meta = {}) => {
      root.setAttribute('data-status', state);
      if (label) {
        label.textContent =
          meta.label ||
          (state === 'signed-in'
            ? 'Signed in to Questit'
            : state === 'error'
              ? 'Status unavailable'
              : 'Viewing as guest');
      }
      if (action) {
        if (state === 'signed-in') {
          action.hidden = true;
          action.textContent = defaultAction.text;
          action.href = defaultAction.href;
        } else {
          action.hidden = false;
          action.textContent = meta.actionText || defaultAction.text;
          action.href = meta.actionHref || defaultAction.href;
        }
      }
    };

    setState('signed-out');

    const defaultBridgeOrigin = 'https://questit.cc';
    let bridgeOrigin = defaultBridgeOrigin;
    try {
      const currentOrigin = window.location.origin;
      if (currentOrigin && currentOrigin.startsWith('http')) {
        bridgeOrigin = currentOrigin;
      }
    } catch (error) {
      console.warn('Questit share: determine bridge origin failed', error);
    }

    const iframe = document.createElement('iframe');
    iframe.src =
      bridgeOrigin.replace(/\/$/, '') +
      '/auth-bridge.html?origin=' +
      encodeURIComponent(window.location.origin || bridgeOrigin);
    iframe.style.position = 'absolute';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;

    let handshakeResolved = false;

    const requestAuthState = () => {
      try {
        iframe.contentWindow?.postMessage({ type: 'questit-auth-request' }, bridgeOrigin);
      } catch (error) {
        console.warn('Questit share: auth request failed', error);
      }
    };

    const applyPayload = (payload) => {
      if (!payload || payload.type !== 'questit-auth-state') return;
      handshakeResolved = true;
      if (payload.status === 'signed-in' && payload.user) {
        const userLabel = payload.user.email || payload.user.name || 'Signed in to Questit';
        setState('signed-in', { label: 'Signed in as ' + userLabel });
        return;
      }
      if (payload.status === 'error') {
        setState('error', {
          label: 'Status unavailable',
          actionText: 'Open Questit',
          actionHref: bridgeOrigin
        });
        return;
      }
      setState('signed-out', {
        label: 'Viewing as guest',
        actionText: 'Log in to Questit',
        actionHref: defaultAction.href
      });
    };

    window.addEventListener('message', (event) => {
      if (event.origin !== bridgeOrigin) return;
      applyPayload(event.data);
    });

    iframe.addEventListener('load', () => {
      requestAuthState();
      window.setTimeout(requestAuthState, 500);
    });

    window.setTimeout(() => {
      if (!handshakeResolved) {
        setState('signed-out', {
          label: 'Viewing as guest',
          actionText: 'Log in to Questit',
          actionHref: defaultAction.href
        });
      }
    }, 2500);

    document.body.append(iframe);
  }

  function init() {
    const payload = parsePayload();
    if (!payload) return;

    const root = document.getElementById(ROOT_ELEMENT_ID);
    if (!root) return;

    applyTheme(payload.theme);
    setupColorMode((payload.color_mode || 'light').toLowerCase());
    document.title = payload.title || 'Questit Tool';

    renderShell(root, payload);
    const memoryBridge = attachMemoryBridge(payload);
    injectToolCode(payload);
    setupRemixLink(payload.share_slug);
    setupAuthBridge();

    // Expose for debugging if needed
    window.__QUESTIT_SHARE__ = {
      version: SHELL_VERSION,
      payload,
      memoryMode: memoryBridge.memoryMode
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
