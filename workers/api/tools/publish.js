// Publishes a User Worker into a dispatch namespace (Workers for Platforms)
// Requires env: CLOUDFLARE_ACCOUNT_ID, WFP_NAMESPACE_ID, CLOUDFLARE_API_TOKEN

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

function buildUserWorkerScript(tool, assetBaseUrl) {
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
  const assetBase =
    (assetBaseUrl || 'https://questit.cc/share-shell').replace(/\/$/, '');
  const cssHref = `${assetBase}/${SHARE_SHELL_VERSION}/share.css`;
  const jsHref = `${assetBase}/${SHARE_SHELL_VERSION}/share.js`;

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
    shell_version: SHARE_SHELL_VERSION
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
    shell_version: SHARE_SHELL_VERSION
  };

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

async function handleGetPublishedTool(request, env, corsHeaders, slug) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseServiceRole = env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl || !supabaseServiceRole) {
    return new Response('Supabase not configured for publishing', {
      status: 500,
      headers: corsHeaders
    });
  }

  const headers = buildSupabaseHeaders(supabaseServiceRole, { Accept: 'application/json' });
  const selectUrl = `${supabaseUrl}/rest/v1/published_tools?slug=eq.${encodeURIComponent(
    slug
  )}&select=id,slug,tool_id,owner_id,title,summary,html,css,js,visibility,passphrase_hash,view_count,last_viewed_at,created_at,updated_at,tags,theme,color_mode,model_provider,model_name`;

  const selectRes = await fetch(selectUrl, { headers });
  const selectText = await selectRes.text();

  if (!selectRes.ok) {
    const message = selectText || `Failed to load tool metadata (status ${selectRes.status})`;
    return new Response(message, {
      status: 502,
      headers: corsHeaders
    });
  }

  let list;
  try {
    list = selectText ? JSON.parse(selectText) : [];
  } catch {
    return new Response('Failed to parse tool metadata', {
      status: 502,
      headers: corsHeaders
    });
  }

  if (!Array.isArray(list) || list.length === 0) {
    return new Response(
      JSON.stringify({ error: 'Tool not found.' }),
      {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  const record = list[0];
  const viewerIdHeader = request.headers.get('x-questit-user-id');
  const viewerId = viewerIdHeader ? viewerIdHeader.trim() : null;

  if (record.visibility === 'private' && (!viewerId || viewerId !== record.owner_id)) {
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

  if (record.visibility === 'passphrase') {
    return new Response(
      JSON.stringify({ error: 'This tool requires a passphrase.' }),
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
    model_name: record.model_name || null
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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
    const isToolsRoute = pathSegments[0] === 'api' && pathSegments[1] === 'tools';
    const isPublishRoute = isToolsRoute && pathSegments[2] === 'publish';

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
    let scriptName = requestedSlug;
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
    const source = buildUserWorkerScript(enrichedTool, assetBaseUrl);

    const deploymentUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/dispatch/namespaces/${namespaceSlug}/scripts/${scriptName}`;
    const res = await fetch(deploymentUrl, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/javascript' },
      body: source
    });
    const body = await res.text();
    if (!res.ok) {
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
