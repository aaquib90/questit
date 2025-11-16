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
    { label: 'My tools', href: 'https://questit.cc/#my-tools' }
  ];

  const BRAND_LOGO_SVG = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 281.25 93.749996"
  role="img"
  aria-label="Questit"
  class="questit-share-logo__svg"
  preserveAspectRatio="xMidYMid meet"
>
  <defs>
    <clipPath id="questit-logo-a">
      <rect x="0" y="0" width="185" height="77" />
    </clipPath>
    <clipPath id="questit-logo-b">
      <path d="M21 29h67v64.5H21Zm0 0" clip-rule="nonzero" />
    </clipPath>
    <clipPath id="questit-logo-c">
      <path d="M.543 56H66v8H.543Zm0 0" clip-rule="nonzero" />
    </clipPath>
    <clipPath id="questit-logo-d">
      <path d="M4 1h8v63.5H4Zm0 0" clip-rule="nonzero" />
    </clipPath>
    <clipPath id="questit-logo-e">
      <rect x="0" y="0" width="67" height="65" />
    </clipPath>
    <clipPath id="questit-logo-f">
      <path d="M1 1h65.539v8H1Zm0 0" clip-rule="nonzero" />
    </clipPath>
    <clipPath id="questit-logo-g">
      <path d="M56 0h8v63.672h-8Zm0 0" clip-rule="nonzero" />
    </clipPath>
    <clipPath id="questit-logo-h">
      <rect x="0" y="0" width="67" height="64" />
    </clipPath>
  </defs>
  <g transform="matrix(1 0 0 1 45 9)" clip-path="url(#questit-logo-a)" fill="currentColor">
    <g transform="translate(.960893 55.048829)">
      <path d="M5.766-3.875c-2.918-3.196-4.375-7.102-4.375-11.719 0-4.613 1.457-8.508 4.375-11.688 2.914-3.176 6.617-4.766 11.11-4.766 4.125 0 7.52 1.48 10.187 4.437h.125v-3.516h10.625v46.906H27.062V-2.97C24.395-.383 21 .906 16.875.906c-4.492 0-8.195-1.594-11.11-4.781Zm9.047-16.969c-1.336 1.356-2 3.106-2 5.25 0 2.149.695 3.907 2.094 5.282 1.395 1.375 3.125 2.062 5.188 2.062 2.02 0 3.727-.688 5.125-2.063 1.394-1.375 2.094-3.133 2.094-5.281 0-2.102-.68-3.844-2.031-5.219-1.355-1.375-3.086-2.063-5.188-2.063-2.187 0-3.949.68-5.281 2.032Zm0 0" />
    </g>
    <g transform="translate(37.242538 55.048829)">
      <path d="M13.781-31.125v14.797c0 3.074.461 5.262 1.39 6.563.926 1.293 2.504 1.938 4.734 1.938 2.227 0 3.805-.645 4.734-1.938.926-1.3 1.39-3.488 1.39-6.563v-14.797h10.75v17.406c0 5.18-1.352 8.914-4.047 11.203-2.688 2.281-6.965 3.422-12.828 3.422s-10.148-1.14-12.844-3.422c-2.688-2.29-4.032-6.024-4.032-11.203v-17.406Zm0 0" />
    </g>
    <g transform="translate(71.885983 55.048829)">
      <path d="M35.141-14.078H12.563c0 2.187.707 3.809 2.125 4.86 1.414 1.054 2.953 1.578 4.61 1.578 1.738 0 3.113-.234 4.125-.703 1.008-.469 2.165-1.39 3.47-2.765l7.765 3.89C31.414-1.8 26.035.906 18.516.906c-4.7 0-8.73-1.602-12.094-4.812C3.066-7.125 1.39-11 1.39-15.531c0-4.531 1.676-8.414 5.032-11.656 3.363-3.239 7.395-4.86 12.093-4.86 4.926 0 8.938 1.43 12.032 4.282 3.101 2.856 4.656 6.934 4.656 12.235 0 .73-.023 1.214-.062 1.453ZM12.86-20.031h11.844c-.25-1.614-.891-2.852-1.922-3.719-1.031-.875-2.355-1.313-3.969-1.313-1.782 0-3.2.469-4.25 1.406-1.055.93-1.621 2.137-1.703 3.625Zm0 0" />
    </g>
    <g transform="translate(103.313692 55.048829)">
      <path d="M17.172-32.047c1.781 0 3.54.203 5.281.61 1.739.406 3.035.812 3.89 1.218l1.266.61-3.516 7.031c-2.43-1.29-4.734-1.937-6.922-1.937-1.211 0-2.07.133-2.578.39-.5.262-.75.758-.75 1.484 0 .168.016.336.047.5.039.156.124.309.25.453.125.137.234.258.328.36.101.094.273.204.515.328.25.125.441.219.578.281.145.055.379.141.703.266.32.125.563.219.719.282.164.054.441.14.828.265.383.125.676.211.875.25 1.258.367 2.352.773 3.281 1.218.926.438 1.906 1.043 2.938 1.813 1.031.773 1.828 1.746 2.39 2.922.57 1.168.859 2.5.859 4 0 7.074-4.918 10.61-14.75 10.61-2.219 0-4.336-.344-6.344-1.031-2-.688-3.445-1.375-4.328-2.063l-1.343-1.094 4.375-7.344c.321.281.742.617 1.266 1 .532.387 1.484.914 2.86 1.578 1.375.668 2.566 1 3.578 1 2.227 0 3.344-.742 3.344-2.234 0-.688-.289-1.223-.859-1.61-.563-.383-1.523-.816-2.875-1.297-1.355-.488-2.418-.937-3.187-1.344-1.938-1.008-3.477-2.149-4.61-3.422C4.145-18.234 3.578-19.926 3.578-22.031c0-3.156 1.223-5.614 3.672-7.375 2.446-1.758 5.754-2.64 9.922-2.64Zm0 0" />
    </g>
    <g transform="translate(128.006573 55.048829)">
      <path d="M5.469-31.125v-11.594h10.734v11.594h6.563v8.188h-6.563v9.89c0 2.875.805 4.312 2.422 4.312.406 0 .832-.078 1.281-.234.445-.164.789-.332 1.031-.5l.36-.234 2.672 8.672c-2.305 1.289-4.934 1.937-7.89 1.937-2.023 0-3.762-.355-5.219-1.062-1.46-.707-2.562-1.656-3.312-2.844-.742-1.195-1.273-2.453-1.594-3.766-.324-1.312-.484-2.718-.484-4.218v-11.953h-4.5v-8.188Zm0 0" />
    </g>
    <g transform="translate(146.814053 55.048829)">
      <path d="M4.672-48.484c1.25-1.258 2.742-1.89 4.484-1.89 1.739 0 3.235.633 4.485 1.89 1.258 1.25 1.89 2.746 1.89 4.484 0 1.742-.633 3.242-1.89 4.5-1.25 1.25-2.746 1.875-4.485 1.875-1.742 0-3.234-.625-4.484-1.875-1.25-1.258-1.875-2.758-1.875-4.5 0-1.742.625-3.238 1.875-4.484Zm-.03 17.36V0h10.75v-31.125Zm0 0" />
    </g>
    <g transform="translate(159.978848 55.048829)">
      <path d="M5.469-31.125v-11.594h10.734v11.594h6.563v8.188h-6.563v9.89c0 2.875.805 4.312 2.422 4.312.406 0 .832-.078 1.281-.234.445-.164.789-.332 1.031-.5l.36-.234 2.672 8.672c-2.305 1.289-4.934 1.937-7.89 1.937-2.023 0-3.762-.355-5.219-1.062-1.46-.707-2.562-1.656-3.312-2.844-.742-1.195-1.273-2.453-1.594-3.766-.324-1.312-.484-2.718-.484-4.218v-11.953h-4.5v-8.188Zm0 0" />
    </g>
  </g>
  <g clip-path="url(#questit-logo-b)">
    <g transform="matrix(1 0 0 1 21 29)" clip-path="url(#questit-logo-e)">
      <g clip-path="url(#questit-logo-c)">
        <path
          stroke-linecap="butt"
          stroke-linejoin="miter"
          transform="matrix(.688167 0 0 .688167 4.181404 56.372848)"
          fill="none"
          d="M-.002 4.998h84.435"
          stroke="currentColor"
          stroke-width="10"
          stroke-opacity="1"
          stroke-miterlimit="4"
        />
      </g>
      <g clip-path="url(#questit-logo-d)">
        <path
          stroke-linecap="butt"
          stroke-linejoin="miter"
          transform="matrix(0 .688167 -.688167 0 11.059551 4.444936)"
          fill="none"
          d="M.001 5.002h82.465"
          stroke="currentColor"
          stroke-width="10"
          stroke-opacity="1"
          stroke-miterlimit="4"
        />
      </g>
    </g>
  </g>
  <g transform="matrix(1 0 0 1 197 0)" clip-path="url(#questit-logo-h)">
    <g clip-path="url(#questit-logo-f)">
      <path
        stroke-linecap="butt"
        stroke-linejoin="miter"
        transform="matrix(-.688167 0 0 -.688167 63.064223 8.233879)"
        fill="none"
        d="M.003 5h84.43"
        stroke="currentColor"
        stroke-width="10"
        stroke-opacity="1"
        stroke-miterlimit="4"
      />
    </g>
    <g clip-path="url(#questit-logo-g)">
      <path
        stroke-linecap="butt"
        stroke-linejoin="miter"
        transform="matrix(0 -.688167 .688167 0 56.186082 60.161791)"
        fill="none"
        d="M.002 4.997h82.462"
        stroke="currentColor"
        stroke-width="10"
        stroke-opacity="1"
        stroke-miterlimit="4"
      />
    </g>
  </g>
</svg>
`;

  const CHEVRON_ICON = `
<svg aria-hidden="true" class="questit-share-icon" viewBox="0 0 16 16">
  <path d="M4.5 6l3.5 4 3.5-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
`;

  const USER_ICON = `
<svg aria-hidden="true" class="questit-share-icon" viewBox="0 0 20 20">
  <path d="M10 2.5a4 4 0 110 8 4 4 0 010-8zM4.5 16.25a5.5 5.5 0 0111 0V18H4.5v-1.75z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
`;

  const ARROW_ICON = `
<svg aria-hidden="true" class="questit-share-icon" viewBox="0 0 20 20">
  <path d="M11 5.5l4.5 4.5-4.5 4.5M4.5 10h10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
`;

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
      const isActive = index === 0;
      const ariaCurrent = isActive ? 'aria-current="page"' : '';
      const activeClass = isActive ? ' questit-share-nav__link--active' : '';
      return `<a class="questit-share-nav__link${activeClass}" href="${href}" ${ariaCurrent}>${label}</a>`;
    }).join('');

    // Load shared header assets from the same origin as the share-shell assets
    try {
      const headerOrigin =
        (payload?.auth_origin && typeof payload.auth_origin === 'string'
          ? payload.auth_origin
          : 'https://questit.cc'
        ).replace(/\/$/, '');
      const headerCssHref = `${headerOrigin}/header/${SHELL_VERSION}/header.css`;
      const headerJsHref = `${headerOrigin}/header/${SHELL_VERSION}/header.js`;
      if (!document.querySelector(`link[data-questit-header]`)) {
        const l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = headerCssHref;
        l.setAttribute('data-questit-header', 'true');
        document.head.append(l);
      }
      if (!document.querySelector(`script[data-questit-header]`)) {
        const s = document.createElement('script');
        s.type = 'module';
        s.src = headerJsHref;
        s.setAttribute('data-questit-header', 'true');
        document.head.append(s);
      }
    } catch {
      // ignore asset injection failures; the page will still render without the shared header
    }

    root.innerHTML = `
      <div class="questit-share">
        <questit-header
          active="workbench"
          mode="${modeLabel.toUpperCase()}"
          theme="${themeLabel.toUpperCase()}"
          login-href="https://questit.cc/?login=1"
          workspace-href="https://questit.cc"
          remix-href="https://questit.cc"
        ></questit-header>
        <section class="questit-share-card questit-share-body">
          <div class="questit-share-cta">
            <span class="questit-tooltip-host">
              <a class="questit-share-btn questit-share-btn--primary" data-questit-action="remix" href="https://questit.cc">
                Remix in Workbench
              </a>
              <span role="tooltip" class="questit-tooltip">
                Open this tool in the Questit workbench to customize the UI and publish your own link.
              </span>
            </span>
            <a class="questit-share-btn questit-share-btn--ghost" href="https://questit.cc" target="_blank" rel="noopener noreferrer">
              Open Questit Workspace
            </a>
          </div>
          <h1 data-questit-title>${title}</h1>
          <div data-questit-summary>${summaryHtml}</div>
          
          <div class="questit-tool-frame">
            <section class="questit-tool" id="${TOOL_ROOT_ID}"></section>
          </div>
          <footer class="questit-footer">
            This tool runs entirely in the browser. Remix it in the Questit workbench to customize and publish your own copy.
          </footer>
        </section>
      </div>
    `;

    // Fallback: if the custom element fails to register quickly, inject the previous static header markup
    const installFallbackIfNeeded = () => {
      try {
        const el = document.querySelector('questit-header');
        const defined = !!customElements.get('questit-header');
        const hasChildren = el && el.children && el.children.length > 0;
        if (el && (!defined || !hasChildren)) {
          const wrapper = document.createElement('div');
          wrapper.className = 'questit-share-header';
          wrapper.innerHTML = `
            <div class="questit-share-header__inner">
              <div class="questit-share-brand">
                <div class="questit-share-logo" aria-label="Questit">${BRAND_LOGO_SVG}</div>
              </div>
              <nav class="questit-share-nav" aria-label="Questit site navigation">
                ${headerNavHtml}
              </nav>
              <div class="questit-share-controls">
                <div class="questit-share-select" aria-label="Color mode"><span>${modeLabel.toUpperCase()}</span>${CHEVRON_ICON}</div>
                <div class="questit-share-select" aria-label="Theme"><span>${themeLabel.toUpperCase()}</span>${CHEVRON_ICON}</div>
              </div>
            </div>
          `;
          el.replaceWith(wrapper);
        }
      } catch {
        // ignore fallback failures
      }
    };
    // Give the module a moment to load; if not, render fallback
    window.setTimeout(installFallbackIfNeeded, 300);
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

  function readSupabaseSessionFromStorage() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      const keys = Object.keys(window.localStorage).filter(
        (key) => key.startsWith('sb-') && key.endsWith('-auth-token')
      );
      for (const key of keys) {
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;
        try {
          const record = JSON.parse(raw);
          const session = record?.currentSession || record?.session || record || null;
          const user =
            session?.user ||
            record?.currentUser ||
            record?.user ||
            null;
          if (user) {
            return {
              user,
              label:
                user.email ||
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                null
            };
          }
        } catch (error) {
          // ignore malformed session entries
        }
      }
    } catch (error) {
      // accessing localStorage can throw in restricted environments
    }
    return null;
  }

  function setupAuthBridge(payload = {}) {
    const headerEl = document.querySelector('questit-header');
    const root = document.querySelector('[data-questit-auth]');
    const label = root?.querySelector('[data-questit-auth-label]');
    const action = root?.querySelector('[data-questit-auth-action]');

    const defaultAction = {
      href: (action && action.getAttribute('href')) || 'https://questit.cc/?login=1',
      text: (action && action.textContent) || 'Log in to Questit'
    };

    const setState = (state, meta = {}) => {
      if (root) root.setAttribute('data-status', state);
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
      if (headerEl) {
        if (state === 'signed-in' && meta.userLabel) {
          headerEl.setAttribute('user', meta.userLabel);
        } else if (state === 'error') {
          headerEl.setAttribute('user', 'Status unavailable');
        } else {
          headerEl.setAttribute('user', '');
        }
      }
    };

    setState('signed-out', { userLabel: '' });

    const normaliseOrigin = (value) => {
      if (!value || typeof value !== 'string') return null;
      try {
        const url = new URL(value);
        return `${url.protocol}//${url.host}`;
      } catch {
        return null;
      }
    };

    const deriveHostBridgeOrigin = () => {
      try {
        const { protocol, hostname, origin } = window.location;
        if (!hostname || !protocol) return null;
        const parts = hostname.split('.').filter(Boolean);
        if (parts.length <= 2) {
          return origin;
        }
        const baseHost = parts.slice(1).join('.');
        return `${protocol}//${baseHost}`;
      } catch (error) {
        console.warn('Questit share: derive bridge origin failed', error);
        return null;
      }
    };

    let bridgeOrigin =
      normaliseOrigin(payload?.auth_origin) ||
      normaliseOrigin(window.__QUESTIT_AUTH_ORIGIN) ||
      deriveHostBridgeOrigin() ||
      normaliseOrigin('https://questit.cc') ||
      'https://questit.cc';

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
    const localSession = readSupabaseSessionFromStorage();
    if (localSession) {
      const userLabel = localSession.label || 'Signed in to Questit';
      setState('signed-in', { label: 'Signed in as ' + userLabel, userLabel });
      handshakeResolved = true;
    }

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
        setState('signed-in', { label: 'Signed in as ' + userLabel, userLabel });
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
    setupAuthBridge(payload);

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
