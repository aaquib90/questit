// Publishes a User Worker into a dispatch namespace (Workers for Platforms)
// Requires env: CLOUDFLARE_ACCOUNT_ID, WFP_NAMESPACE_ID, CLOUDFLARE_API_TOKEN

import { logErrorToSentry, capturePosthogEvent } from '../../lib/telemetry.js';

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
    "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
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
  '--radius': '0.75rem',
  '--font-sans':
    "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
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
      '--secondary': '79.6 89.1% 89.2%',
      '--secondary-foreground': '85.9 78.4% 27.3%',
      '--accent': '79.6 89.1% 89.2%',
      '--accent-foreground': '85.9 78.4% 27.3%',
      '--ring': '83.7 80.5% 44.3%',
      '--muted': '78.3 92% 95.1%',
      '--muted-foreground': '87.6 61.2% 20.2%',
      '--border': '80.9 88.5% 79.6%',
      '--input': '80.9 88.5% 79.6%'
    },
    darkOverrides: {
      '--primary': '83.7 80.5% 44.3%',
      '--primary-foreground': '210 40% 98%',
      '--accent': '83.7 80.5% 44.3%',
      '--accent-foreground': '210 40% 98%',
      '--ring': '83.7 80.5% 44.3%'
    }
  },
  slate: {
    overrides: {
      '--primary': '215.4 16.3% 46.9%',
      '--primary-foreground': '210 40% 98%',
      '--secondary': '214.3 31.8% 91.4%',
      '--secondary-foreground': '217.2 32.6% 17.5%',
      '--accent': '214.3 31.8% 91.4%',
      '--accent-foreground': '217.2 32.6% 17.5%',
      '--ring': '215.4 16.3% 46.9%',
      '--muted': '210 40% 96.1%',
      '--muted-foreground': '215.3 19.3% 34.5%',
      '--border': '212.7 26.8% 83.9%',
      '--input': '212.7 26.8% 83.9%'
    },
    darkOverrides: {
      '--primary': '215.4 16.3% 46.9%',
      '--primary-foreground': '210 40% 98%',
      '--accent': '215.4 16.3% 46.9%',
      '--accent-foreground': '210 40% 98%',
      '--ring': '215.4 16.3% 46.9%'
    }
  }
};

const CANONICAL_ORIGIN_FALLBACK = 'https://questit.cc';

const STATIC_SITEMAP_ROUTES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/?view=templates', changefreq: 'weekly', priority: '0.7' },
  { path: '/?view=my-tools', changefreq: 'weekly', priority: '0.7' },
  { path: '/?view=creator-portal', changefreq: 'weekly', priority: '0.6' }
];

const OG_THEME_PALETTES = {
  default: { background: ['#0f172a', '#0e7490'], accent: '#38bdf8' },
  emerald: { background: ['#064e3b', '#10b981'], accent: '#34d399' },
  sky: { background: ['#0c4a6e', '#0ea5e9'], accent: '#38bdf8' },
  violet: { background: ['#1e1b4b', '#7c3aed'], accent: '#c4b5fd' },
  amber: { background: ['#78350f', '#f59e0b'], accent: '#fcd34d' },
  rose: { background: ['#881337', '#f43f5e'], accent: '#f9a8d4' },
  cyan: { background: ['#164e63', '#06b6d4'], accent: '#67e8f9' },
  indigo: { background: ['#1e1b4b', '#6366f1'], accent: '#c7d2fe' },
  lime: { background: ['#365314', '#84cc16'], accent: '#bef264' }
};

function getCanonicalOrigin(env) {
  const raw =
    typeof env.CANONICAL_ORIGIN === 'string' && env.CANONICAL_ORIGIN.trim()
      ? env.CANONICAL_ORIGIN.trim()
      : typeof env.PUBLIC_APP_ORIGIN === 'string' && env.PUBLIC_APP_ORIGIN.trim()
        ? env.PUBLIC_APP_ORIGIN.trim()
        : null;
  if (!raw) return CANONICAL_ORIGIN_FALLBACK;
  try {
    const parsed = new URL(raw);
    return parsed.origin;
  } catch {
    return CANONICAL_ORIGIN_FALLBACK;
  }
}

function buildAbsoluteUrl(env, path = '/') {
  const origin = getCanonicalOrigin(env);
  if (!path || path === '/') return `${origin}/`;
  try {
    return new URL(path, origin).toString();
  } catch {
    return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
  }
}

function xmlEscape(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncateText(value, maxLength) {
  if (!value) return '';
  const str = String(value).trim();
  if (str.length <= maxLength) return str;
  return `${str.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

async function fetchPublicPublishedTools(env, { limit = 500 } = {}) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseServiceRole = env.SUPABASE_SERVICE_ROLE;
  if (!supabaseUrl || !supabaseServiceRole) {
    return { tools: [], error: 'supabase_config_missing' };
  }

  const params = new URLSearchParams();
  params.set(
    'select',
    'slug,title,summary,updated_at,created_at,visibility,tags,theme,color_mode,owner_id,view_count'
  );
  params.set('visibility', 'eq.public');
  params.set('order', 'updated_at.desc.nullslast');
  params.set('limit', String(Math.min(Math.max(limit, 1), 2000)));

  const requestUrl = `${supabaseUrl}/rest/v1/published_tools?${params.toString()}`;

  try {
    const res = await fetch(requestUrl, {
      headers: buildSupabaseHeaders(supabaseServiceRole, { Accept: 'application/json' })
    });
    if (!res.ok) {
      const text = await res.text();
      return { tools: [], error: `supabase_request_failed:${res.status}:${text?.slice(0, 200) || ''}` };
    }
    const data = await res.json();
    return { tools: Array.isArray(data) ? data : [], error: null };
  } catch (error) {
    return { tools: [], error: error?.message || 'supabase_request_exception' };
  }
}

function buildSitemapXml(env, tools = []) {
  const origin = getCanonicalOrigin(env);
  const staticEntries = STATIC_SITEMAP_ROUTES.map((entry) => ({
    ...entry,
    loc: buildAbsoluteUrl(env, entry.path),
    lastmod: new Date().toISOString()
  }));

  const toolEntries = [];
  for (const tool of tools) {
    const slug = normaliseSlug(tool.slug);
    if (!slug) continue;
    const visibility = (tool.visibility || 'public').toLowerCase();
    if (visibility !== 'public') continue;
    const loc = `${origin}/tools/${encodeURIComponent(slug)}/`;
    const lastModified = tool.updated_at || tool.created_at || null;
    toolEntries.push({
      loc,
      changefreq: 'weekly',
      priority: '0.5',
      lastmod: lastModified ? new Date(lastModified).toISOString() : null
    });
  }

  const entries = [...staticEntries, ...toolEntries];
  const body = entries
    .map((entry) => {
      const parts = [`    <loc>${xmlEscape(entry.loc)}</loc>`];
      if (entry.lastmod) {
        parts.push(`    <lastmod>${xmlEscape(entry.lastmod)}</lastmod>`);
      }
      if (entry.changefreq) {
        parts.push(`    <changefreq>${xmlEscape(entry.changefreq)}</changefreq>`);
      }
      if (entry.priority) {
        parts.push(`    <priority>${xmlEscape(entry.priority)}</priority>`);
      }
      return `  <url>
${parts.join('\n')}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function selectOgPalette(theme, colorMode) {
  const key = typeof theme === 'string' && theme.trim() ? theme.trim().toLowerCase() : 'default';
  const palette = OG_THEME_PALETTES[key] || OG_THEME_PALETTES.default;
  if (colorMode === 'dark') {
    return palette;
  }
  return palette;
}

function createToolOgSvg(env, tool) {
  const origin = getCanonicalOrigin(env);
  const palette = selectOgPalette(tool.theme, tool.color_mode);
  const [bgFrom, bgTo] = palette.background;
  const accent = palette.accent;
  const title = truncateText(tool.title || 'Questit Tool', 68);
  const summary = truncateText(tool.summary || 'Open Questit published tools and try them instantly.', 180);
  const slug = normaliseSlug(tool.slug) || 'tool';
  const subtitle = `${origin.replace(/^https?:\/\//, '')}/tools/${slug}`;
  const tags = Array.isArray(tool.tags)
    ? tool.tags
        .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
        .filter(Boolean)
        .slice(0, 3)
    : [];
  const tagsText = tags.length ? tags.join(' • ') : 'AI • Micro-tools • Questit';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${xmlEscape(bgFrom)}" />
      <stop offset="100%" stop-color="${xmlEscape(bgTo)}" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" rx="48" />
  <g opacity="0.18" stroke="${xmlEscape(accent)}" stroke-width="18" fill="none">
    <path d="M120 160h320" stroke-linecap="round" />
    <path d="M920 470h160" stroke-linecap="round" />
    <circle cx="980" cy="210" r="72" />
    <circle cx="240" cy="450" r="54" />
  </g>
  <g fill="#ecfeff">
    <text x="120" y="300" font-family="'Inter', 'Segoe UI', system-ui" font-size="82" font-weight="700" letter-spacing="0.01em">
      ${xmlEscape(title)}
    </text>
    <text x="120" y="380" font-family="'Inter', 'Segoe UI', system-ui" font-size="36" font-weight="400" opacity="0.92" letter-spacing="0.01em">
      ${xmlEscape(summary)}
    </text>
  </g>
  <g fill="#f8fafc" opacity="0.86">
    <text x="120" y="450" font-family="'Inter', 'Segoe UI', system-ui" font-size="30" font-weight="500" letter-spacing="0.1em" text-transform="uppercase">
      ${xmlEscape(tagsText)}
    </text>
    <text x="120" y="520" font-family="'Inter', 'Segoe UI', system-ui" font-size="30" font-weight="600" fill="${xmlEscape(accent)}">
      ${xmlEscape(subtitle)}
    </text>
  </g>
  <g transform="translate(900 320)">
    <circle cx="120" cy="120" r="120" fill="${xmlEscape(accent)}" opacity="0.12" />
    <circle cx="120" cy="120" r="92" fill="none" stroke="${xmlEscape(accent)}" stroke-width="8" opacity="0.6" />
    <text x="120" y="150" text-anchor="middle" font-family="'Inter', 'Segoe UI', system-ui" font-size="48" font-weight="700" fill="#ecfeff">
      Questit
    </text>
  </g>
</svg>`;
}

async function buildSitemapResponse(env) {
  const { tools, error } = await fetchPublicPublishedTools(env);
  if (error) {
    await logErrorToSentry(env, new Error('sitemap_fetch_failed'), { extra: { error } });
  }
  const xml = buildSitemapXml(env, tools);
  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600'
    }
  });
}

async function buildToolOgImageResponse(env, slug) {
  if (!slug) {
    return new Response('Not Found', { status: 404 });
  }

  const supabaseUrl = env.SUPABASE_URL;
  const supabaseServiceRole = env.SUPABASE_SERVICE_ROLE;
  if (!supabaseUrl || !supabaseServiceRole) {
    return new Response('Missing configuration', { status: 500 });
  }

  const normalized = normaliseSlug(slug);
  if (!normalized) {
    return new Response('Not Found', { status: 404 });
  }

  const selectUrl = `${supabaseUrl}/rest/v1/published_tools?slug=eq.${encodeURIComponent(
    normalized
  )}&select=slug,title,summary,visibility,tags,theme,color_mode,updated_at,created_at&limit=1`;

  try {
    const res = await fetch(selectUrl, {
      headers: buildSupabaseHeaders(supabaseServiceRole, { Accept: 'application/json' })
    });
    if (!res.ok) {
      const text = await res.text();
      await logErrorToSentry(env, new Error('og_lookup_failed'), {
        extra: { status: res.status, body: text?.slice(0, 200) || null, slug: normalized }
      });
      return new Response('Not Found', { status: res.status === 404 ? 404 : 500 });
    }
    const data = await res.json();
    const record = Array.isArray(data) ? data[0] : data;
    if (!record || (record.visibility || 'public').toLowerCase() !== 'public') {
      return new Response('Not Found', { status: 404 });
    }
    record.slug = normalized;
    const svg = createToolOgSvg(env, record);
    return new Response(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    await logErrorToSentry(env, error, { extra: { slug: normalized } });
    return new Response('Not Found', { status: 404 });
  }
}

const DEFAULT_THEME_KEY = 'emerald';
const SHARE_SHELL_VERSION = 'v1';

function resolveThemeVars(themeKey = DEFAULT_THEME_KEY) {
  const safeKey = (themeKey || '').toLowerCase();
  const preset = THEME_PRESETS[safeKey] || THEME_PRESETS[DEFAULT_THEME_KEY];
  const lightVars = { ...BASE_THEME_VARS, ...(preset.overrides || {}) };
  const darkVars = { ...BASE_DARK_THEME_VARS, ...(preset.darkOverrides || {}) };
  return { lightVars, darkVars };
}

function declarationsToCss(vars) {
  return Object.entries(vars)
    .map(([token, value]) => `${token}: ${value};`)
    .join('\n');
}

function buildThemeCss(themeKey = DEFAULT_THEME_KEY) {
  const { lightVars, darkVars } = resolveThemeVars(themeKey);
  return `
@import url('https://fonts.googleapis.com/css2?family=Rubik+80s+Fade&display=swap');

:root {
${declarationsToCss(lightVars)}
}

.dark {
${declarationsToCss(darkVars)}
}

*, *::before, *::after {
  box-sizing: border-box;
}

html {
  font-family: var(--font-sans);
  font-feature-settings: 'rlig' 1, 'calt' 1;
}

body {
  margin: 0;
  min-height: 100vh;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  transition: background 150ms ease, color 150ms ease;
}

a {
  color: inherit;
}

button,
input,
select,
textarea {
  font: inherit;
}
`;
}

function buildLayoutCss() {
  return `
.questit-shell {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(24px, 5vw, 42px);
  padding: clamp(28px, 7vw, 68px) clamp(18px, 7vw, 80px) clamp(48px, 10vw, 104px);
  background: hsl(var(--background));
  overflow: hidden;
}

.questit-shell::before {
  content: "";
  position: absolute;
  inset: -40% -25% -10%;
  background:
    radial-gradient(48% 48% at 20% 18%, hsla(var(--primary), 0.22), transparent 70%),
    radial-gradient(60% 60% at 82% 10%, hsla(var(--accent), 0.2), transparent 75%),
    radial-gradient(55% 55% at 50% 78%, hsla(var(--secondary), 0.18), transparent 75%);
  filter: blur(120px);
  opacity: 0.85;
  z-index: -2;
}

.questit-shell::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, hsla(var(--background), 0.94) 0%, hsla(var(--background), 0.98) 24%, hsl(var(--background)) 100%);
  z-index: -1;
}

.questit-shell > * {
  position: relative;
  z-index: 1;
}

.questit-glass {
  background: linear-gradient(135deg, hsl(var(--background) / 0.86) 0%, hsl(var(--background) / 0.68) 60%);
  border: 1px solid hsl(var(--primary) / 0.1);
  box-shadow: 0 24px 60px -32px hsl(var(--primary) / 0.55);
  backdrop-filter: blur(22px);
}

.questit-surface {
  width: min(960px, 100%);
  display: flex;
  justify-content: center;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.questit-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(16px, 3vw, 28px);
  width: 100%;
  border-radius: clamp(24px, 3vw, 36px);
  padding: clamp(20px, 3vw, 32px);
  border: 1px solid hsl(var(--primary) / 0.12);
  background:
    linear-gradient(120deg, hsl(var(--background) / 0.9), hsl(var(--background) / 0.7));
  box-shadow:
    inset 0 1px 0 hsla(var(--background), 0.55),
    0 22px 48px -30px rgba(15, 23, 42, 0.48),
    0 32px 60px -28px hsl(var(--primary) / 0.4);
  backdrop-filter: blur(26px) saturate(135%);
  overflow: hidden;
}

.questit-header::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(70% 100% at 12% 16%, hsla(var(--primary), 0.28) 0%, transparent 60%),
    radial-gradient(70% 120% at 88% 8%, hsla(var(--accent), 0.2) 0%, transparent 70%);
  opacity: 0.85;
  pointer-events: none;
}

.questit-header::after {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  border: 1px solid hsla(var(--primary), 0.12);
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: 0.45;
}

.questit-header > * {
  position: relative;
  z-index: 1;
}

.questit-header-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.questit-header-logo {
  font-family: 'Rubik 80s Fade', cursive;
  font-size: clamp(2rem, 3.6vw, 2.75rem);
  color: hsl(var(--primary));
  text-shadow:
    0 18px 38px hsl(var(--primary) / 0.35),
    0 4px 12px hsl(var(--primary) / 0.45);
  letter-spacing: 0.04em;
}

.questit-header-subtitle {
  font-size: 0.72rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: hsla(var(--muted-foreground), 0.85);
}

.questit-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
}

.questit-header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: flex-end;
}

.questit-header-pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border-radius: 999px;
  padding: 0.65rem 1.55rem;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform 140ms ease, box-shadow 160ms ease, background 160ms ease, color 160ms ease;
  border: 1px solid hsla(var(--primary), 0.22);
  box-shadow: 0 18px 40px -30px hsl(var(--primary));
}

.questit-header-pill:hover {
  transform: translateY(-1px);
}

.questit-header-pill--primary {
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsla(var(--primary), 0.85) 100%);
  color: hsl(var(--primary-foreground));
  border-color: transparent;
  box-shadow: 0 26px 55px -32px hsl(var(--primary));
}

.questit-header-pill--primary:hover {
  box-shadow: 0 30px 65px -30px hsl(var(--primary));
}

.questit-header-pill--ghost {
  background: linear-gradient(135deg, hsla(var(--background), 0.92) 0%, hsla(var(--background), 0.72) 100%);
  color: hsl(var(--foreground));
  box-shadow: 0 18px 42px -32px rgba(15, 23, 42, 0.48);
}

.questit-header-pill--ghost:hover {
  box-shadow: 0 22px 50px -30px hsl(var(--primary));
}

.questit-header-status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.55rem;
  font-size: 0.78rem;
  color: hsla(var(--muted-foreground), 0.9);
}

.questit-header-status__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  border: 1px solid hsla(var(--primary), 0.18);
  background: linear-gradient(135deg, hsla(var(--background), 0.92) 0%, hsla(var(--background), 0.72) 100%);
  color: hsl(var(--foreground));
  font-weight: 600;
  letter-spacing: 0.02em;
  box-shadow: 0 12px 28px -26px rgba(15, 23, 42, 0.55);
}

.questit-header-status[data-status='signed-in'] .questit-header-status__badge {
  color: hsl(var(--primary));
  background: linear-gradient(135deg, hsla(var(--primary), 0.18) 0%, hsla(var(--background), 0.75) 100%);
}

.questit-header-status__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.45rem 1rem;
  border-radius: 999px;
  border: 1px solid hsla(var(--primary), 0.24);
  background: hsla(var(--primary), 0.14);
  color: hsl(var(--primary));
  font-weight: 600;
  text-decoration: none;
  transition: transform 140ms ease, box-shadow 160ms ease, background 160ms ease;
  box-shadow: 0 14px 34px -28px hsl(var(--primary));
}

.questit-header-status__action:hover {
  transform: translateY(-1px);
  box-shadow: 0 20px 44px -30px hsl(var(--primary));
}

.questit-header-status__action[hidden] {
  display: none;
}

.questit-tool-container {
  position: relative;
  width: min(960px, 100%);
  background: linear-gradient(150deg, hsla(var(--background), 0.96) 0%, hsla(var(--background), 0.72) 60%);
  border-radius: clamp(28px, 4vw, 40px);
  border: 1px solid hsla(var(--primary), 0.14);
  box-shadow:
    inset 0 1px 0 hsla(var(--background), 0.75),
    0 36px 80px -38px rgba(15, 23, 42, 0.62);
  padding: clamp(28px, 5vw, 48px);
  backdrop-filter: blur(26px) saturate(120%);
  overflow: hidden;
}

.questit-tool-container::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(160deg, hsla(var(--primary), 0.08) 10%, transparent 65%),
    linear-gradient(220deg, hsla(var(--accent), 0.1) 15%, transparent 75%);
  opacity: 0.75;
  pointer-events: none;
}

.questit-tool-container > * {
  position: relative;
  z-index: 1;
}

.questit-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: clamp(20px, 4vw, 32px);
}

.questit-meta span {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: hsla(var(--muted-foreground), 0.85);
}

.questit-meta h1 {
  font-size: clamp(1.6rem, 2.6vw, 2.35rem);
  margin: 0;
  color: hsl(var(--foreground));
  font-weight: 600;
}

.questit-summary {
  margin: 0;
  color: hsla(var(--muted-foreground), 0.9);
  font-size: clamp(0.92rem, 1.05vw, 1.05rem);
  line-height: 1.65;
}

.questit-summary--empty {
  font-style: italic;
  color: hsla(var(--muted-foreground), 0.75);
}

.questit-meta-grid {
  display: grid;
  gap: clamp(12px, 2.5vw, 20px);
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  margin-top: clamp(14px, 2.5vw, 24px);
}

.questit-meta-chip {
  position: relative;
  border-radius: calc(var(--radius) + 2px);
  background: linear-gradient(140deg, hsla(var(--background), 0.9) 0%, hsla(var(--background), 0.76) 100%);
  border: 1px solid hsla(var(--primary), 0.12);
  padding: clamp(14px, 2.5vw, 18px);
  box-shadow:
    inset 0 1px 0 hsla(var(--background), 0.7),
    0 14px 30px -28px rgba(15, 23, 42, 0.6);
}

.questit-meta-chip span {
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: hsla(var(--muted-foreground), 0.85);
  margin-bottom: 6px;
}

.questit-meta-chip strong {
  display: block;
  font-size: 0.98rem;
  color: hsl(var(--foreground));
  font-weight: 600;
}

.questit-meta-cta {
  margin-top: clamp(18px, 3vw, 28px);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.85rem;
  border-radius: calc(var(--radius) + 6px);
  padding: clamp(12px, 2.5vw, 18px);
  background: hsla(var(--muted), 0.38);
  border: 1px dashed hsla(var(--primary), 0.28);
  color: hsla(var(--muted-foreground), 0.88);
  font-size: 0.85rem;
  line-height: 1.5;
}

.questit-meta-cta strong {
  color: hsl(var(--primary));
  font-weight: 600;
}

.questit-tool {
  position: relative;
  display: block;
  border-radius: calc(var(--radius) + 6px);
  background: linear-gradient(135deg, hsla(var(--background), 0.92) 0%, hsla(var(--background), 0.68) 100%);
  border: 1px solid hsla(var(--primary), 0.12);
  padding: clamp(20px, 4.2vw, 32px);
  box-shadow:
    inset 0 1px 0 hsla(var(--background), 0.7),
    0 18px 42px -32px rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(10px) saturate(115%);
}

.questit-tool > * {
  max-width: 100%;
}

.questit-footer {
  margin-top: clamp(20px, 4vw, 32px);
  font-size: 0.75rem;
  color: hsla(var(--muted-foreground), 0.85);
}

@media (max-width: 640px) {
  .questit-shell {
    padding: 16px;
  }

  .questit-header {
    flex-direction: column;
    align-items: stretch;
  }

  .questit-header-right {
    width: 100%;
    align-items: flex-start;
  }

  .questit-header-actions {
    justify-content: flex-start;
  }

  .questit-header-status {
    justify-content: flex-start;
  }

  .questit-tool {
    padding: 16px;
  }
}
`;
}

function escapeHtmlAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeJsonForScript(jsonString) {
  return String(jsonString ?? '')
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E')
    .replace(/&/g, '\\u0026');
}

function buildUserWorkerScript(tool, assetBaseUrl, authBridgeOrigin) {
  const themeKeyRaw = (tool.theme || DEFAULT_THEME_KEY).toLowerCase();
  const themeKey = THEME_PRESETS[themeKeyRaw] ? themeKeyRaw : DEFAULT_THEME_KEY;
  const rawColorMode = (tool.color_mode || '').toLowerCase();
  const colorMode =
    rawColorMode === 'system'
      ? 'system'
      : rawColorMode === 'dark'
        ? 'dark'
        : rawColorMode === 'light'
          ? 'light'
          : 'light';
  const htmlClass = colorMode === 'dark' ? ' class="dark"' : '';
  const shareSlug = tool.share_slug || null;
  const visibility = (tool.visibility || 'public').toLowerCase();
  const passphraseHash = tool.passphrase_hash || null;
  const assetBase =
    (assetBaseUrl || 'https://questit.cc/share-shell').replace(/\/$/, '');
  const cssHref = `${assetBase}/${SHARE_SHELL_VERSION}/share.css`;
  const jsHref = `${assetBase}/${SHARE_SHELL_VERSION}/share.js`;
  const explicitAuthOrigin =
    typeof authBridgeOrigin === 'string' && authBridgeOrigin.trim()
      ? authBridgeOrigin.trim()
      : null;
  let resolvedAuthOrigin = explicitAuthOrigin || null;
  if (!resolvedAuthOrigin) {
    try {
      const assetOrigin = new URL(assetBase);
      resolvedAuthOrigin = `${assetOrigin.protocol}//${assetOrigin.host}`;
    } catch {}
  }
  if (!resolvedAuthOrigin) {
    resolvedAuthOrigin = 'https://questit.cc';
  }

  const payload = {
    title: tool.title || '',
    public_summary: tool.public_summary || '',
    model_provider: tool.model_provider || null,
    model_name: tool.model_name || null,
    theme: themeKey,
    color_mode: colorMode,
    html: String(tool.html ?? ''),
    css: tool.css || '',
    js: tool.js || '',
    share_slug: shareSlug,
    shell_version: SHARE_SHELL_VERSION,
    visibility,
    passphrase_required: visibility === 'passphrase',
    memory_mode: tool.memory_mode || 'none',
    memory_retention: tool.memory_retention || 'indefinite',
    auth_origin: resolvedAuthOrigin
  };

  const shellTitle = escapeHtmlAttr(tool.title || 'Questit Tool');
  const dataJson = escapeJsonForScript(JSON.stringify(payload));
  const htmlDocument = `<!doctype html>
<html${htmlClass}>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${shellTitle}</title>
    <link rel="stylesheet" href="${cssHref}">
  </head>
  <body>
    <div id="questit-share-root" class="questit-shell"></div>
    <script type="application/json" id="questit-share-data">${dataJson}</script>
    <script type="module" src="${jsHref}"></script>
  </body>
</html>`;
  const metadataPayload = {
    id: tool.id || null,
    title: tool.title || '',
    public_summary: tool.public_summary || '',
    theme: themeKey,
    color_mode: colorMode,
    model_provider: tool.model_provider || null,
    model_name: tool.model_name || null,
    slug: shareSlug,
    html: tool.html || '',
    css: tool.css || '',
    js: tool.js || '',
    shell_version: SHARE_SHELL_VERSION,
    visibility,
    passphrase_required: visibility === 'passphrase',
    passphrase_hash: passphraseHash,
    memory_mode: tool.memory_mode || 'none',
    memory_retention: tool.memory_retention || 'indefinite'
  };

  const privateGateHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Restricted tool · Questit</title>
    <style>
      :root {
        color-scheme: light dark;
      }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: radial-gradient(circle at top, rgba(56,189,248,0.16), rgba(15,23,42,0.85));
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 32px;
        color: #e2e8f0;
      }
      .card {
        width: min(560px, 100%);
        border-radius: 28px;
        background: rgba(15, 23, 42, 0.88);
        border: 1px solid rgba(148, 163, 184, 0.35);
        box-shadow: 0 42px 120px -40px rgba(15, 23, 42, 0.65);
        padding: 48px 40px;
        text-align: center;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border-radius: 9999px;
        border: 1px solid rgba(148, 163, 184, 0.4);
        background: rgba(15, 23, 42, 0.6);
        color: rgba(148, 163, 184, 0.9);
        font-size: 11px;
        letter-spacing: 0.25em;
        text-transform: uppercase;
        padding: 6px 16px;
        margin-bottom: 20px;
      }
      h1 {
        margin: 0 0 16px;
        font-size: clamp(26px, 5vw, 34px);
        color: #f8fafc;
        letter-spacing: -0.02em;
      }
      p {
        margin: 0 0 28px;
        color: #cbd5f5;
        font-size: 15px;
        line-height: 1.6;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 12px;
      }
      .button {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 12px 20px;
        border-radius: 9999px;
        font-size: 14px;
        font-weight: 600;
        border: 1px solid rgba(148, 163, 184, 0.3);
        text-decoration: none;
        color: inherit;
        background: rgba(30, 41, 59, 0.6);
        transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
      }
      .button--primary {
        border-color: rgba(94, 234, 212, 0.6);
        background: linear-gradient(120deg, rgba(94, 234, 212, 0.22), rgba(56, 189, 248, 0.24));
        color: #0f172a;
      }
      .button:hover {
        transform: translateY(-2px);
        border-color: rgba(148, 163, 184, 0.6);
      }
      .button--primary:hover {
        border-color: rgba(94, 234, 212, 0.9);
        background: linear-gradient(120deg, rgba(94, 234, 212, 0.3), rgba(56, 189, 248, 0.36));
      }
    </style>
  </head>
  <body>
    <div class="card">
      <span class="badge">Private tool</span>
      <h1>This tool is only visible to its creator</h1>
      <p>Want to try it yourself? Sign in with the account that published this link, or start building your own Questit tool in just a few clicks.</p>
      <div class="actions">
        <a class="button button--primary" href="/">Create your own tool</a>
        <a class="button" href="/?login=1">Sign in to Questit</a>
      </div>
    </div>
  </body>
</html>`;

  const passphraseGateHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Passphrase required · Questit</title>
    <style>
      :root {
        color-scheme: light dark;
      }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: radial-gradient(circle at top, rgba(129, 140, 248,0.15), rgba(15,23,42,0.9));
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 32px;
        color: #e2e8f0;
      }
      .card {
        width: min(560px, 100%);
        border-radius: 28px;
        background: rgba(15, 23, 42, 0.88);
        border: 1px solid rgba(165, 180, 252, 0.42);
        box-shadow: 0 42px 120px -46px rgba(79,70,229,0.6);
        padding: 48px 40px;
        text-align: center;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border-radius: 9999px;
        border: 1px solid rgba(165, 180, 252, 0.5);
        background: rgba(76, 29, 149, 0.4);
        color: rgba(224, 231, 255, 0.9);
        font-size: 11px;
        letter-spacing: 0.25em;
        text-transform: uppercase;
        padding: 6px 16px;
        margin-bottom: 20px;
      }
      h1 {
        margin: 0 0 16px;
        font-size: clamp(26px, 5vw, 34px);
        color: #ede9fe;
        letter-spacing: -0.02em;
      }
      p {
        margin: 0 0 28px;
        color: #c7d2fe;
        font-size: 15px;
        line-height: 1.6;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 12px;
      }
      .button {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 12px 20px;
        border-radius: 9999px;
        font-size: 14px;
        font-weight: 600;
        border: 1px solid rgba(165, 180, 252, 0.35);
        text-decoration: none;
        color: inherit;
        background: rgba(30, 41, 59, 0.6);
        transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
      }
      .button--primary {
        border-color: rgba(167, 139, 250, 0.6);
        background: linear-gradient(120deg, rgba(167, 139, 250, 0.25), rgba(129, 140, 248, 0.26));
        color: #0f172a;
      }
      .button:hover {
        transform: translateY(-2px);
        border-color: rgba(165, 180, 252, 0.7);
      }
      .button--primary:hover {
        border-color: rgba(167, 139, 250, 0.9);
        background: linear-gradient(120deg, rgba(167, 139, 250, 0.33), rgba(129, 140, 248, 0.36));
      }
    </style>
  </head>
  <body>
    <div class="card">
      <span class="badge">Passphrase required</span>
      <h1>You’ll need the shared passphrase to view this tool</h1>
      <p>The creator locked access with a passphrase. Reach out to them for the code—or jump into Questit and craft your own interactive tool.</p>
      <div class="actions">
        <a class="button button--primary" href="/">Start building your tool</a>
        <a class="button" href="/?login=1">Sign in to Questit</a>
      </div>
    </div>
  </body>
</html>`;

  const responseInit = JSON.stringify({
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });

  return `addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

const html = ${JSON.stringify(htmlDocument)};
const metadata = ${JSON.stringify(metadataPayload)};

async function handleRequest(request) {
  if (metadata.visibility === 'private') {
    return new Response(${JSON.stringify(privateGateHtml)}, {
      status: 403,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  if (metadata.visibility === 'passphrase') {
    return new Response(${JSON.stringify(passphraseGateHtml)}, {
      status: 403,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  const url = new URL(request.url);
  if (url.pathname === '/metadata') {
    return new Response(JSON.stringify(metadata), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  return new Response(html, ${responseInit});
}
`;
}

const VALID_VISIBILITIES = new Set(['public', 'private', 'passphrase']);

function normaliseVisibility(value) {
  const candidate = (value || '').toString().toLowerCase().trim();
  return VALID_VISIBILITIES.has(candidate) ? candidate : 'public';
}

function normaliseSlug(value) {
  if (!value) return '';
  const slug = value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!slug) return '';
  if (slug.length <= 63) return slug;
  return slug.slice(0, 63).replace(/-+$/g, '');
}

function generateSlug(baseSource = 'tool') {
  const base = normaliseSlug(baseSource) || 'tool';
  const suffix = Math.random().toString(36).slice(2, 7);
  let slug = `${base}-${suffix}`.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  if (!slug) {
    slug = `tool-${suffix}`;
  }
  if (slug.length > 63) {
    slug = slug.slice(0, 63).replace(/-+$/g, '');
  }
  return slug;
}

function sanitiseTags(tags) {
  if (!Array.isArray(tags)) return null;
  const cleaned = tags
    .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
    .filter(Boolean);
  return cleaned.length ? cleaned : null;
}

function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hashPassphrase(passphrase, salt = '') {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${passphrase}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(digest);
}

function isoNow() {
  return new Date().toISOString();
}

function buildSupabaseHeaders(serviceRoleKey, extra = {}) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    ...extra
  };
}

function sanitizeNullableString(value, maxLength = 255) {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (!str) return null;
  return str.slice(0, maxLength);
}

function withCors(response, corsHeaders = {}) {
  const merged = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    merged.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: merged
  });
}

function scanForDangerousPatterns(tool) {
  const findings = [];
  const add = (severity, message, snippet) =>
    findings.push({
      severity,
      message,
      snippet: typeof snippet === 'string' ? snippet.slice(0, 160) : null
    });
  const js = String(tool.js || '');
  const html = String(tool.html || '');
  // Basic JS guards
  if (/\beval\s*\(/i.test(js)) add('high', 'Use of eval() is not allowed', 'eval(');
  if (/\bnew\s+Function\s*\(/i.test(js)) add('high', 'Use of new Function() is not allowed', 'new Function(');
  if (/\bdocument\.write\s*\(/i.test(js)) add('medium', 'document.write() can be harmful to shell layout', 'document.write(');
  if (/<script[^>]+src\s*=/i.test(html)) add('high', 'External <script src> tags are not allowed', '<script src=...>');
  // Inline event handlers in HTML (onclick=, onerror=, etc.)
  if (/\son\w+\s*=/i.test(html)) add('medium', 'Inline HTML event handlers are discouraged', 'on*=');
  return findings;
}

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((acc, part) => {
    const [rawKey, ...rawValue] = part.split('=');
    if (!rawKey) return acc;
    const key = rawKey.trim();
    const value = rawValue.join('=').trim();
    if (key) {
      acc[key] = decodeURIComponent(value || '');
    }
    return acc;
  }, {});
}

async function resolveAuthContext(request, env) {
  const headers = request.headers;
  const authHeader = headers.get('authorization') || headers.get('Authorization');
  let userId = null;

  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) {
      try {
        const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: env.SUPABASE_SERVICE_ROLE
          }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          userId = userData?.id || null;
        }
      } catch {
        // ignore auth lookup errors; we'll fall back to session scope
      }
    }
  }

  const sessionHeader = headers.get('x-questit-session-id') || headers.get('X-Questit-Session-Id');
  let sessionId = sanitizeNullableString(sessionHeader, 128);
  if (!sessionId) {
    const cookieHeader = headers.get('cookie') || headers.get('Cookie');
    const cookies = parseCookies(cookieHeader);
    sessionId = sanitizeNullableString(cookies['questit_session_id'], 128);
  }

  return { userId, sessionId };
}

async function selectExistingMemory(env, toolId, key, context) {
  const supabaseUrl = env.SUPABASE_URL;
  const serviceRole = env.SUPABASE_SERVICE_ROLE;
  let url = `${supabaseUrl}/rest/v1/tool_memories?tool_id=eq.${encodeURIComponent(
    toolId
  )}&memory_key=eq.${encodeURIComponent(key)}&select=id&limit=1`;

  if (context.userId) {
    url += `&user_id=eq.${encodeURIComponent(context.userId)}`;
  } else if (context.sessionId) {
    url += `&session_id=eq.${encodeURIComponent(context.sessionId)}`;
  }

  const res = await fetch(url, {
    headers: buildSupabaseHeaders(serviceRole, { Accept: 'application/json' })
  });

  if (!res.ok) {
    return null;
  }

  const text = await res.text();
  if (!text) return null;
  try {
    const parsed = JSON.parse(text);
    const record = Array.isArray(parsed) ? parsed[0] : parsed;
    return record?.id || null;
  } catch {
    return null;
  }
}

async function handleMemoryGet(toolId, env, context) {
  if (!context.userId && !context.sessionId) {
    return new Response(
      JSON.stringify({ error: 'Provide an authenticated user or session identifier.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  let url = `${env.SUPABASE_URL}/rest/v1/tool_memories?tool_id=eq.${encodeURIComponent(
    toolId
  )}&select=memory_key,memory_value,updated_at`;

  if (context.userId) {
    url += `&user_id=eq.${encodeURIComponent(context.userId)}`;
  } else if (context.sessionId) {
    url += `&session_id=eq.${encodeURIComponent(context.sessionId)}`;
  }

  const res = await fetch(url, {
    headers: buildSupabaseHeaders(env.SUPABASE_SERVICE_ROLE, { Accept: 'application/json' })
  });

  if (!res.ok) {
    const text = await res.text();
    return new Response(text || 'Failed to load tool memory', {
      status: res.status,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  const text = await res.text();
  const payload = text ? JSON.parse(text) : [];
  return new Response(JSON.stringify({ memories: payload || [] }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}

async function handleMemoryExport(toolId, env, context) {
  const listRes = await handleMemoryGet(toolId, env, context);
  if (!listRes.ok) return listRes;
  try {
    const text = await listRes.text();
    const filename = `questit-tool-${toolId}-memory.json`;
    return new Response(text, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to export memory.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleMemoryUpsert(toolId, env, context, request) {
  if (!context.userId && !context.sessionId) {
    return new Response(
      JSON.stringify({ error: 'Provide an authenticated user or session identifier.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const rawKey = sanitizeNullableString(body?.key, 120);
  if (!rawKey) {
    return new Response(JSON.stringify({ error: 'Memory key is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const memoryValue = body?.value;
  const serviceRole = env.SUPABASE_SERVICE_ROLE;
  const supabaseUrl = env.SUPABASE_URL;
  const headers = buildSupabaseHeaders(serviceRole, {
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  });

  const existingId = await selectExistingMemory(env, toolId, rawKey, context);

  if (existingId) {
    const updateRes = await fetch(
      `${supabaseUrl}/rest/v1/tool_memories?id=eq.${encodeURIComponent(existingId)}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          memory_value: memoryValue,
          user_id: context.userId ?? null,
          session_id: context.userId ? null : context.sessionId,
          updated_at: isoNow()
        })
      }
    );

    const text = await updateRes.text();
    if (!updateRes.ok) {
      return new Response(text || 'Failed to update memory entry.', {
        status: updateRes.status,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const payload = text ? JSON.parse(text) : null;
    return new Response(JSON.stringify({ memory: Array.isArray(payload) ? payload[0] : payload }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const insertRes = await fetch(`${supabaseUrl}/rest/v1/tool_memories`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      tool_id: toolId,
      memory_key: rawKey,
      memory_value: memoryValue,
      user_id: context.userId ?? null,
      session_id: context.userId ? null : context.sessionId
    })
  });

  const text = await insertRes.text();
  if (!insertRes.ok) {
    return new Response(text || 'Failed to persist memory entry.', {
      status: insertRes.status,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  const payload = text ? JSON.parse(text) : null;
  return new Response(JSON.stringify({ memory: Array.isArray(payload) ? payload[0] : payload }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleMemoryDelete(toolId, env, context, key) {
  if (!context.userId && !context.sessionId) {
    return new Response(
      JSON.stringify({ error: 'Provide an authenticated user or session identifier.' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  const normalizedKey = sanitizeNullableString(key, 120);
  if (!normalizedKey) {
    return new Response(JSON.stringify({ error: 'Memory key is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let url = `${env.SUPABASE_URL}/rest/v1/tool_memories?tool_id=eq.${encodeURIComponent(
    toolId
  )}&memory_key=eq.${encodeURIComponent(normalizedKey)}`;

  if (context.userId) {
    url += `&user_id=eq.${encodeURIComponent(context.userId)}`;
  } else if (context.sessionId) {
    url += `&session_id=eq.${encodeURIComponent(context.sessionId)}`;
  }

  const res = await fetch(url, {
    method: 'DELETE',
    headers: buildSupabaseHeaders(env.SUPABASE_SERVICE_ROLE, {
      Prefer: 'return=minimal'
    })
  });

  if (!res.ok) {
    const text = await res.text();
    return new Response(text || 'Failed to delete memory entry.', {
      status: res.status,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  return new Response(null, { status: 204 });
}

function buildPassphraseCookie(slug, hash, env, requestUrl) {
  const segments = [];
  segments.push(`questit_passphrase_${slug}=${hash}`);
  segments.push('Path=/');
  segments.push('Max-Age=604800');
  segments.push('HttpOnly');
  segments.push('SameSite=Lax');
  const cookieDomain = env.PUBLISHED_TOOLS_COOKIE_DOMAIN;
  if (cookieDomain) {
    segments.push(`Domain=${cookieDomain}`);
  } else {
    try {
      const host = new URL(requestUrl).hostname;
      if (host && /^[a-z0-9.-]+$/i.test(host) && host.split('.').length > 1) {
        segments.push(`Domain=.${host.split('.').slice(-2).join('.')}`);
      }
    } catch {
      // ignore domain parsing errors
    }
  }
  return segments.join('; ');
}

async function fetchPublishedToolRecord(env, slug, corsHeaders) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseServiceRole = env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl || !supabaseServiceRole) {
    return {
      error: new Response('Supabase not configured for publishing', {
        status: 500,
        headers: corsHeaders
      })
    };
  }

  const selectUrl = `${supabaseUrl}/rest/v1/published_tools?slug=eq.${encodeURIComponent(
    slug
  )}&select=id,slug,tool_id,owner_id,title,summary,html,css,js,visibility,passphrase_hash,view_count,last_viewed_at,created_at,updated_at,tags,theme,color_mode,model_provider,model_name,memory_mode,memory_retention`;

  const selectRes = await fetch(selectUrl, {
    headers: buildSupabaseHeaders(supabaseServiceRole, { Accept: 'application/json' })
  });
  const selectText = await selectRes.text();

  if (!selectRes.ok) {
    const message = selectText || `Failed to load tool metadata (status ${selectRes.status})`;
    return {
      error: new Response(message, {
        status: 502,
        headers: corsHeaders
      })
    };
  }

  let list;
  try {
    list = selectText ? JSON.parse(selectText) : [];
  } catch {
    return {
      error: new Response('Failed to parse tool metadata', {
        status: 502,
        headers: corsHeaders
      })
    };
  }

  if (!Array.isArray(list) || list.length === 0) {
    return {
      error: new Response(
        JSON.stringify({ error: 'Tool not found.' }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    };
  }

  return { record: list[0], supabaseUrl, supabaseServiceRole };
}

async function handlePassphraseVerify(slug, request, env, corsHeaders) {
  const lookup = await fetchPublishedToolRecord(env, slug, corsHeaders);
  if (lookup.error) {
    return withCors(lookup.error, corsHeaders);
  }
  const { record } = lookup;
  if (record.visibility !== 'passphrase') {
    return withCors(
      new Response(JSON.stringify({ error: 'Passphrase not required for this tool.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }),
      corsHeaders
    );
  }
  if (!record.passphrase_hash) {
    return withCors(
      new Response(JSON.stringify({ error: 'No passphrase configured for this tool.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }),
      corsHeaders
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return withCors(
      new Response(JSON.stringify({ error: 'Invalid JSON payload.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }),
      corsHeaders
    );
  }

  const passphrase = typeof payload?.passphrase === 'string' ? payload.passphrase.trim() : '';
  if (!passphrase) {
    return withCors(
      new Response(JSON.stringify({ error: 'Passphrase is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }),
      corsHeaders
    );
  }

  const hashed = await hashPassphrase(passphrase, env.PUBLISHED_TOOLS_PASSPHRASE_SALT || '');
  if (hashed !== record.passphrase_hash) {
    return withCors(
      new Response(JSON.stringify({ error: 'Incorrect passphrase.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }),
      corsHeaders
    );
  }

  const cookie = buildPassphraseCookie(slug, hashed, env, request.url);
  const response = new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookie
    }
  });
  try {
    await capturePosthogEvent(env, 'passphrase_verified', { slug });
  } catch {}
  return withCors(response, corsHeaders);
}

async function handleGetPublishedTool(request, env, corsHeaders, slug) {
  const lookup = await fetchPublishedToolRecord(env, slug, corsHeaders);
  if (lookup.error) {
    return lookup.error;
  }
  const { record, supabaseUrl, supabaseServiceRole } = lookup;
  const viewerIdHeader = request.headers.get('x-questit-user-id');
  const viewerId = viewerIdHeader ? viewerIdHeader.trim() : null;
  const authContext = await resolveAuthContext(request, env);
  const ownerBypass = authContext.userId && authContext.userId === record.owner_id;

  if (record.visibility === 'private' && !ownerBypass && (!viewerId || viewerId !== record.owner_id)) {
    return new Response(
      JSON.stringify({ error: 'This tool is private to its creator.' }),
      {
        status: 403,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  const cookies = parseCookies(request.headers.get('cookie') || request.headers.get('Cookie') || '');
  const cookieKey = `questit_passphrase_${slug}`;
  const passphraseCookie = cookies[cookieKey];
  const hasValidPassphrase =
    record.passphrase_hash && passphraseCookie && passphraseCookie === record.passphrase_hash;

  if (
    record.visibility === 'passphrase' &&
    !hasValidPassphrase &&
    !ownerBypass &&
    (!viewerId || viewerId !== record.owner_id)
  ) {
    return new Response(
      JSON.stringify({ error: 'This tool requires a passphrase.', requires_passphrase: true }),
      {
        status: 403,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  const nowIso = isoNow();
  const nextViewCount = Number(record.view_count || 0) + 1;

  try {
    const updateRes = await fetch(
      `${supabaseUrl}/rest/v1/published_tools?slug=eq.${encodeURIComponent(slug)}`,
      {
        method: 'PATCH',
        headers: buildSupabaseHeaders(supabaseServiceRole, {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Prefer: 'return=representation'
        }),
        body: JSON.stringify({
          view_count: nextViewCount,
          last_viewed_at: nowIso
        })
      }
    );

    const updateText = await updateRes.text();
    if (updateRes.ok) {
      try {
        const updatePayload = updateText ? JSON.parse(updateText) : null;
        const updatedRecord = Array.isArray(updatePayload) ? updatePayload[0] : updatePayload;
        if (updatedRecord) {
          record.view_count = updatedRecord.view_count ?? nextViewCount;
          record.last_viewed_at = updatedRecord.last_viewed_at ?? nowIso;
        } else {
          record.view_count = nextViewCount;
          record.last_viewed_at = nowIso;
        }
      } catch {
        record.view_count = nextViewCount;
        record.last_viewed_at = nowIso;
      }
    } else {
      record.view_count = nextViewCount;
      record.last_viewed_at = nowIso;
    }
  } catch {
    record.view_count = nextViewCount;
    record.last_viewed_at = nowIso;
  }

  if (record.id) {
    try {
      const sessionId = sanitizeNullableString(request.headers.get('x-questit-session-id'), 128);
      const userAgent = sanitizeNullableString(request.headers.get('user-agent'), 255);
      await fetch(`${supabaseUrl}/rest/v1/tool_views`, {
        method: 'POST',
        headers: buildSupabaseHeaders(supabaseServiceRole, {
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        }),
        body: JSON.stringify({
          published_tool_id: record.id,
          viewer_id: sanitizeNullableString(viewerId, 64),
          session_id: sessionId,
          user_agent: userAgent
        })
      });
    } catch {
      // best-effort logging; ignore failures
    }
  }

  delete record.passphrase_hash;

  const payload = {
    slug: record.slug,
    tool_id: record.tool_id,
    owner_id: record.owner_id,
    title: record.title,
    summary: record.summary,
    html: record.html || '',
    css: record.css || '',
    js: record.js || '',
    visibility: record.visibility,
    tags: Array.isArray(record.tags) ? record.tags : [],
    view_count: Number(record.view_count || 0),
    last_viewed_at: record.last_viewed_at,
    created_at: record.created_at,
    updated_at: record.updated_at,
    theme: record.theme || null,
    color_mode: record.color_mode || null,
    model_provider: record.model_provider || null,
    model_name: record.model_name || null,
    memory_mode: record.memory_mode || 'none',
    memory_retention: record.memory_retention || 'indefinite'
  };

  return new Response(JSON.stringify(payload), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}

function getCorsHeaders(origin) {
  const allowedOrigins = [
    'http://localhost:8000',
    'http://localhost:3000',
    'http://127.0.0.1:8000',
    'https://questit.cc',
    'https://www.questit.cc'
  ];
  const isAllowed = origin && allowedOrigins.some(allowed => origin === allowed || origin.endsWith('.questit.cc'));
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Questit-Session-Id',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const corsHeaders = getCorsHeaders(origin);
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    let url;
    try {
      url = new URL(request.url);
    } catch {
      return new Response('Bad Request', {
        status: 400,
        headers: corsHeaders
      });
    }

    const pathSegments = url.pathname.split('/').filter(Boolean);

    if (
      pathSegments[0] === 'api' &&
      pathSegments[1] === 'site' &&
      (pathSegments[2] || '').startsWith('sitemap')
    ) {
      const sitemapResponse = await buildSitemapResponse(env);
      if (request.method === 'HEAD') {
        return withCors(
          new Response(null, {
            status: sitemapResponse.status,
            headers: sitemapResponse.headers
          }),
          corsHeaders
        );
      }
      return withCors(sitemapResponse, corsHeaders);
    }

    if (pathSegments[0] === 'api' && pathSegments[1] === 'og' && pathSegments[2] === 'tools') {
      const rawSlug = pathSegments[3] || '';
      const slug = rawSlug.replace(/\.svg$/i, '');
      const ogResponse = await buildToolOgImageResponse(env, slug);
      return withCors(ogResponse, corsHeaders);
    }

    const isToolsRoute = pathSegments[0] === 'api' && pathSegments[1] === 'tools';
    const isPublishRoute = isToolsRoute && pathSegments[2] === 'publish';

    // PATCH/DELETE /api/tools/:slug (owner-only)
    if (isToolsRoute && pathSegments[2] && ['PATCH', 'DELETE'].includes(request.method)) {
      const slug = sanitizeNullableString(decodeURIComponent(pathSegments[2]), 64);
      if (!slug) {
        return new Response('Invalid slug', { status: 400, headers: corsHeaders });
      }
      const auth = await resolveAuthContext(request, env);
      if (!auth.userId) {
        return new Response(JSON.stringify({ error: 'Authentication required.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      // Load record and verify ownership
      const lookup = await fetchPublishedToolRecord(env, slug, corsHeaders);
      if (lookup.error) {
        return withCors(lookup.error, corsHeaders);
      }
      const { record } = lookup;
      if (!record || record.owner_id !== auth.userId) {
        return new Response(JSON.stringify({ error: 'Owner access required.' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (request.method === 'DELETE') {
        // Delete dispatch script (best effort)
        try {
          const accountId = env.CLOUDFLARE_ACCOUNT_ID;
          const namespaceSlug = env.WFP_NAMESPACE_NAME || env.WFP_NAMESPACE_ID;
          const token = env.CLOUDFLARE_API_TOKEN;
          if (accountId && namespaceSlug && token) {
            const delUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/dispatch/namespaces/${namespaceSlug}/scripts/${slug}`;
            await fetch(delUrl, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
          }
        } catch {
          // ignore delete failures
        }
        // Remove DB record
        try {
          const res = await fetch(
            `${env.SUPABASE_URL}/rest/v1/published_tools?slug=eq.${encodeURIComponent(slug)}&owner_id=eq.${encodeURIComponent(auth.userId)}`,
            {
              method: 'DELETE',
              headers: buildSupabaseHeaders(env.SUPABASE_SERVICE_ROLE, { Prefer: 'return=minimal' })
            }
          );
          if (!res.ok) {
            const text = await res.text();
            await logErrorToSentry(env, new Error('unpublish_delete_failed'), {
              extra: { status: res.status, body: text?.slice(0, 300) || null, slug }
            });
            return new Response(text || 'Failed to unpublish tool.', {
              status: 502,
              headers: corsHeaders
            });
          }
        } catch (error) {
          await logErrorToSentry(env, error, { extra: { slug } });
          return new Response('Failed to unpublish tool.', { status: 502, headers: corsHeaders });
        }
        try {
          await capturePosthogEvent(env, 'publish_deleted', { slug, owner_id: auth.userId });
        } catch {}
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      if (request.method === 'PATCH') {
        let patch;
        try {
          patch = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: 'Invalid JSON payload.' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        const visibility = normaliseVisibility(patch.visibility || record.visibility);
        let passphraseHash = record.passphrase_hash || null;
        if (visibility === 'passphrase') {
          if (typeof patch.passphrase_hash === 'string' && patch.passphrase_hash.trim()) {
            passphraseHash = patch.passphrase_hash.trim();
          } else if (typeof patch.passphrase === 'string' && patch.passphrase.trim()) {
            passphraseHash = await hashPassphrase(
              patch.passphrase.trim(),
              env.PUBLISHED_TOOLS_PASSPHRASE_SALT || ''
            );
          }
        } else {
          passphraseHash = null;
        }
        const themeCandidate =
          typeof patch.theme === 'string' && patch.theme.trim()
            ? patch.theme.trim().toLowerCase()
            : null;
        const allowedColorModes = new Set(['light', 'dark', 'system']);
        const colorCandidate =
          typeof patch.color_mode === 'string' && patch.color_mode.trim()
            ? patch.color_mode.trim().toLowerCase()
            : null;
        const updatePayload = {
          title: sanitizeNullableString(patch.title, 255) ?? record.title,
          summary: sanitizeNullableString(patch.summary, 2000) ?? record.summary,
          visibility,
          passphrase_hash: passphraseHash,
          tags: sanitiseTags(patch.tags) ?? record.tags,
          theme: themeCandidate && THEME_PRESETS[themeCandidate] ? themeCandidate : record.theme,
          color_mode: allowedColorModes.has(colorCandidate || '') ? colorCandidate : record.color_mode,
          updated_at: isoNow()
        };
        try {
          const res = await fetch(
            `${lookup.supabaseUrl}/rest/v1/published_tools?slug=eq.${encodeURIComponent(slug)}&owner_id=eq.${encodeURIComponent(auth.userId)}`,
            {
              method: 'PATCH',
              headers: buildSupabaseHeaders(lookup.supabaseServiceRole, {
                'Content-Type': 'application/json',
                Prefer: 'return=representation'
              }),
              body: JSON.stringify(updatePayload)
            }
          );
          const text = await res.text();
          if (!res.ok) {
            await logErrorToSentry(env, new Error('publish_update_failed'), {
              extra: { status: res.status, body: text?.slice(0, 300) || null, slug }
            });
            return new Response(text || 'Failed to update published tool.', {
              status: 502,
              headers: corsHeaders
            });
          }
          let payload = null;
          try {
            const parsed = text ? JSON.parse(text) : null;
            payload = Array.isArray(parsed) ? parsed[0] : parsed;
          } catch {
            payload = null;
          }
          try {
            await capturePosthogEvent(env, 'publish_updated', { slug, owner_id: auth.userId });
          } catch {}
          return new Response(JSON.stringify(payload || { ok: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          await logErrorToSentry(env, error, { extra: { slug } });
          return new Response('Failed to update published tool.', { status: 502, headers: corsHeaders });
        }
      }
    }

    if (
      request.method === 'GET' &&
      isToolsRoute &&
      pathSegments[2] &&
      pathSegments[2] !== 'publish'
    ) {
      if (pathSegments.length > 3) {
        return new Response('Not Found', {
          status: 404,
          headers: corsHeaders
        });
      }

      let slug = '';
      try {
        slug = decodeURIComponent(pathSegments[2] || '').trim().toLowerCase();
      } catch {
        slug = '';
      }

      if (!slug) {
        return new Response('Not Found', {
          status: 404,
          headers: corsHeaders
        });
      }

      return handleGetPublishedTool(request, env, corsHeaders, slug);
    }

    const toolIdSegment = pathSegments[2];
    const memoryRoute =
      isToolsRoute && toolIdSegment && pathSegments[3] === 'memory';
    const passphraseRoute =
      isToolsRoute && toolIdSegment && pathSegments[3] === 'passphrase';

    if (memoryRoute) {
      const decodedToolId = sanitizeNullableString(decodeURIComponent(toolIdSegment), 64);
      if (!decodedToolId) {
        return new Response('Invalid tool identifier.', {
          status: 400,
          headers: corsHeaders
        });
      }
      const context = await resolveAuthContext(request, env);
      const tailSegments = pathSegments.slice(4);
    if (request.method === 'GET' && tailSegments.length === 0) {
        const response = await handleMemoryGet(decodedToolId, env, context);
        return withCors(response, corsHeaders);
      }
    if (request.method === 'GET' && tailSegments.length === 1 && tailSegments[0] === 'export') {
      const response = await handleMemoryExport(decodedToolId, env, context);
      return withCors(response, corsHeaders);
    }
      if (request.method === 'POST' && tailSegments.length === 0) {
        const response = await handleMemoryUpsert(decodedToolId, env, context, request);
        return withCors(response, corsHeaders);
      }
      if (request.method === 'DELETE' && tailSegments.length === 1) {
        const key = tailSegments[0] ? decodeURIComponent(tailSegments[0]) : '';
        const response = await handleMemoryDelete(decodedToolId, env, context, key);
        return withCors(response, corsHeaders);
      }
      return new Response('Unsupported memory operation.', {
        status: 405,
        headers: corsHeaders
      });
    }

    if (passphraseRoute) {
      const decodedSlug = sanitizeNullableString(decodeURIComponent(toolIdSegment), 64);
      if (!decodedSlug) {
        return new Response('Invalid tool identifier.', {
          status: 400,
          headers: corsHeaders
        });
      }
      if (request.method === 'POST') {
        const response = await handlePassphraseVerify(decodedSlug, request, env, corsHeaders);
        return response;
      }
      return new Response('Method Not Allowed', {
        status: 405,
        headers: corsHeaders
      });
    }

    if (!isPublishRoute) {
      return new Response('Not Found', {
        status: 404,
        headers: corsHeaders
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { 
        status: 405,
        headers: corsHeaders
      });
    }
    
    const tool = await request.json();

    const supabaseUrl = env.SUPABASE_URL;
    const supabaseServiceRole = env.SUPABASE_SERVICE_ROLE;
    if (!supabaseUrl || !supabaseServiceRole) {
      return new Response('Supabase not configured for publishing', {
        status: 500,
        headers: corsHeaders
      });
    }

    const ownerId =
      tool.owner_id ||
      tool.user_id ||
      tool.ownerId ||
      (tool.owner && (tool.owner.id || tool.owner.user_id)) ||
      null;

    if (!ownerId) {
      return new Response('owner_id is required to publish a tool', {
        status: 400,
        headers: corsHeaders
      });
    }

    const toolId = tool.tool_id || tool.id;
    if (!toolId) {
      return new Response('tool_id is required to publish a tool', {
        status: 400,
        headers: corsHeaders
      });
    }

    const visibility = normaliseVisibility(tool.visibility);
    let passphraseHash = null;
    if (visibility === 'passphrase') {
      if (typeof tool.passphrase_hash === 'string' && tool.passphrase_hash.trim()) {
        passphraseHash = tool.passphrase_hash.trim();
      } else if (typeof tool.passphrase === 'string' && tool.passphrase.trim()) {
        passphraseHash = await hashPassphrase(
          tool.passphrase.trim(),
          env.PUBLISHED_TOOLS_PASSPHRASE_SALT || ''
        );
      } else {
        return new Response('Passphrase is required when visibility is set to passphrase.', {
          status: 400,
          headers: corsHeaders
        });
      }
    }

    // Static scan for unsafe patterns
    const scanFindings = scanForDangerousPatterns(tool);
    const critical = scanFindings.filter((f) => f.severity === 'high');
    if (critical.length > 0) {
      await logErrorToSentry(env, new Error('publish_static_scan_failed'), {
        extra: { findings: scanFindings }
      });
      return new Response(JSON.stringify({ error: 'Bundle failed security scan.', findings: scanFindings }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const ownerUuid = ownerId.toString().trim();
    if (!ownerUuid) {
      return new Response('owner_id is required to publish a tool', {
        status: 400,
        headers: corsHeaders
      });
    }
    const toolUuid = toolId.toString().trim();
    if (!toolUuid) {
      return new Response('tool_id is required to publish a tool', {
        status: 400,
        headers: corsHeaders
      });
    }

    const requestedSlug = normaliseSlug(tool.share_slug || tool.slug);

    let existingSlug = null;
    if (!requestedSlug) {
      try {
        const existingRes = await fetch(
          `${supabaseUrl}/rest/v1/published_tools?tool_id=eq.${encodeURIComponent(
            toolUuid
          )}&owner_id=eq.${encodeURIComponent(ownerUuid)}&select=slug&limit=1`,
          {
            headers: buildSupabaseHeaders(supabaseServiceRole, { Accept: 'application/json' })
          }
        );
        if (existingRes.ok) {
          const text = await existingRes.text();
          if (text) {
            const parsed = JSON.parse(text);
            const record = Array.isArray(parsed) ? parsed[0] : parsed;
            if (record?.slug) {
              existingSlug = normaliseSlug(record.slug);
            }
          }
        }
      } catch {
        // ignore lookup failures; we'll fall back to generating a new slug
      }
    }

    let scriptName = requestedSlug || existingSlug;
    if (!scriptName) {
      scriptName = generateSlug(tool.title || toolId || 'tool');
    }

    const enrichedTool = { ...tool, share_slug: scriptName };
    delete enrichedTool.passphrase;
    delete enrichedTool.passphrase_hash;

    const accountId = env.CLOUDFLARE_ACCOUNT_ID;
    const namespaceSlug = env.WFP_NAMESPACE_NAME || env.WFP_NAMESPACE_ID;
    const token = env.CLOUDFLARE_API_TOKEN;
    if (!accountId || !namespaceSlug || !token) {
      return new Response('Workers for Platforms not configured', {
        status: 500,
        headers: corsHeaders
      });
    }

    const assetBaseUrl = (env.SHARE_SHELL_BASE_URL || 'https://questit.cc/share-shell').trim();
    const authBridgeOrigin =
      typeof env.SHARE_SHELL_AUTH_ORIGIN === 'string'
        ? env.SHARE_SHELL_AUTH_ORIGIN.trim()
        : null;
    const source = buildUserWorkerScript(enrichedTool, assetBaseUrl, authBridgeOrigin);

    const deploymentUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/dispatch/namespaces/${namespaceSlug}/scripts/${scriptName}`;
    const res = await fetch(deploymentUrl, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/javascript' },
      body: source
    });
    const body = await res.text();
    if (!res.ok) {
      try {
        await logErrorToSentry(env, new Error('publish_deploy_failed'), {
          extra: { status: res.status, body: body?.slice(0, 500) || null, slug: scriptName }
        });
      } catch {}
      return new Response(body, { 
        status: res.status,
        headers: corsHeaders
      });
    }

    const summary =
      typeof tool.public_summary === 'string' && tool.public_summary.trim()
        ? tool.public_summary.trim()
        : typeof tool.summary === 'string' && tool.summary.trim()
          ? tool.summary.trim()
          : null;

    const themeCandidate =
      typeof tool.theme === 'string' && tool.theme.trim()
        ? tool.theme.trim().toLowerCase()
        : null;
    const themeKeyForRecord = themeCandidate && THEME_PRESETS[themeCandidate] ? themeCandidate : null;
    const colorCandidate =
      typeof tool.color_mode === 'string' && tool.color_mode.trim()
        ? tool.color_mode.trim().toLowerCase()
        : null;
    const allowedColorModes = new Set(['light', 'dark', 'system']);
    const colorModeForRecord = allowedColorModes.has(colorCandidate || '') ? colorCandidate : null;
    const modelProvider = sanitizeNullableString(tool.model_provider, 64);
    const modelName = sanitizeNullableString(tool.model_name, 128);

    const supabasePayload = {
      slug: scriptName,
      tool_id: toolUuid,
      owner_id: ownerUuid,
      title: (tool.title || '').toString().trim() || 'Untitled Tool',
      summary,
      html: typeof tool.html === 'string' ? tool.html : '',
      css: typeof tool.css === 'string' ? tool.css : '',
      js: typeof tool.js === 'string' ? tool.js : '',
      visibility,
      passphrase_hash: visibility === 'passphrase' ? passphraseHash : null,
      tags: sanitiseTags(tool.tags),
      theme: themeKeyForRecord,
      color_mode: colorModeForRecord,
      model_provider: modelProvider,
      model_name: modelName,
      memory_mode: (tool.memory_mode || 'none').toLowerCase(),
      memory_retention: (tool.memory_retention || 'indefinite').toLowerCase(),
      updated_at: isoNow()
    };

    const supabaseResponse = await fetch(`${supabaseUrl}/rest/v1/published_tools?on_conflict=slug`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceRole,
        'Authorization': `Bearer ${supabaseServiceRole}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(supabasePayload)
    });

    const supabaseText = await supabaseResponse.text();
    if (!supabaseResponse.ok) {
      try {
        await logErrorToSentry(env, new Error('publish_metadata_persist_failed'), {
          extra: {
            status: supabaseResponse.status,
            body: supabaseText?.slice(0, 500) || null,
            slug: scriptName
          }
        });
      } catch {}
      return new Response(
        `Failed to persist published tool: ${supabaseResponse.status} ${supabaseText}`,
        {
          status: 502,
          headers: corsHeaders
        }
      );
    }

    let supabaseRecord = null;
    if (supabaseText) {
      try {
        const parsed = JSON.parse(supabaseText);
        supabaseRecord = Array.isArray(parsed) ? parsed[0] : parsed;
      } catch {
        // ignore parse errors; not critical for response
      }
    }

    try {
      await capturePosthogEvent(env, 'publish_success', {
        slug: scriptName,
        owner_id: ownerUuid,
        tool_id: toolUuid,
        namespace: namespaceSlug
      });
    } catch {}

    return new Response(
      JSON.stringify({
        name: scriptName,
        slug: scriptName,
        namespace: namespaceSlug,
        published_tool: supabaseRecord
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
};
