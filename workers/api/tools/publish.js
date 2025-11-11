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
  border: 1px solid hsla(var(--primary), 0.32);
  background:
    linear-gradient(165deg, hsla(var(--primary), 0.42) 0%, hsla(var(--primary), 0.24) 24%, hsla(var(--background), 0.82) 62%, hsla(var(--background), 0.72) 100%),
    linear-gradient(120deg, hsla(var(--background), 0.75), hsla(var(--background), 0.68));
  box-shadow:
    inset 0 1px 0 hsla(var(--background), 0.55),
    0 22px 32px -22px hsla(var(--primary), 0.65),
    0 38px 65px -26px rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(26px) saturate(140%);
  overflow: hidden;
}

.questit-header::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(75% 95% at 14% 20%, hsla(var(--primary), 0.55) 0%, transparent 58%),
    linear-gradient(150deg, hsla(var(--accent), 0.32) 12%, transparent 68%);
  opacity: 0.9;
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

function escapeHtmlText(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r\n|\n|\r/g, '<br>');
}

function sanitizeForStyle(content) {
  return String(content ?? '').replace(/<\/style/gi, '<\\/style');
}

function sanitizeForScript(content) {
  return String(content ?? '').replace(/<\/script/gi, '<\\/script');
}

function buildUserWorkerScript(tool) {
  const themeKey = tool.theme || DEFAULT_THEME_KEY;
  const themeCss = buildThemeCss(themeKey);
  const layoutCss = buildLayoutCss();
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
  const colorModeSetup =
    colorMode === 'system'
      ? `
const media = window.matchMedia('(prefers-color-scheme: dark)');
const applyScheme = (event) => {
  document.documentElement.classList.toggle('dark', !!(event.matches ?? event));
};
applyScheme(media.matches);
if (media.addEventListener) {
  media.addEventListener('change', (event) => applyScheme(event.matches));
} else if (media.addListener) {
  media.addListener((event) => applyScheme(event.matches));
}`
      : '';

  const formatModelLabel = (provider, model) => {
    if (!provider && !model) return 'Not specified';
    const providerLabel = provider
      ? provider.toLowerCase() === 'openai'
        ? 'OpenAI'
        : provider.toLowerCase() === 'gemini'
          ? 'Google Gemini'
          : provider.charAt(0).toUpperCase() + provider.slice(1)
      : 'Model';
    return model ? `${providerLabel} · ${model}` : providerLabel;
  };

  const shellTitle = escapeHtmlAttr(tool.title || 'Questit Tool');
  const summaryHtml = tool.public_summary
    ? `<p class="questit-summary">${escapeHtmlText(tool.public_summary)}</p>`
    : `<p class="questit-summary questit-summary--empty">Creator hasn't added a public summary yet.</p>`;
  const modelDisplay = formatModelLabel(tool.model_provider, tool.model_name);
  const themeLabel = themeKey.charAt(0).toUpperCase() + themeKey.slice(1);
  const modeLabel = colorMode === 'system' ? 'System (auto)' : colorMode === 'dark' ? 'Dark' : 'Light';
  const shareSlug = tool.share_slug || null;
  const htmlSnippet = String(tool.html ?? '').trim() || '<p>No content returned.</p>';
  const cssSnippet = sanitizeForStyle(tool.css);
  const jsSnippet = sanitizeForScript(tool.js);

  const fullHtml = `<!doctype html>
<html${htmlClass}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${shellTitle}</title>
<style>${themeCss}
${layoutCss}
${cssSnippet}</style>
</head>
<body>
<div class="questit-shell">
  <div class="questit-surface">
    <div class="questit-header">
      <div class="questit-header-meta">
        <span class="questit-header-logo">Questit</span>
        <span class="questit-header-subtitle">Shared tool</span>
      </div>
      <div class="questit-header-right">
        <div class="questit-header-actions">
          <a class="questit-header-pill questit-header-pill--primary" data-questit-action="remix" href="https://questit.cc">
            Remix in Workbench
          </a>
          <a class="questit-header-pill questit-header-pill--ghost" href="https://questit.cc" target="_blank" rel="noopener noreferrer">
            Open Questit Workspace
          </a>
        </div>
        <div class="questit-header-status" data-questit-auth data-status="signed-out">
          <span class="questit-header-status__badge" data-questit-auth-label>Viewing as guest</span>
          <a class="questit-header-status__action" data-questit-auth-action href="https://questit.cc/?login=1">
          Log in to Questit
          </a>
        </div>
      </div>
    </div>
  </div>
  <div class="questit-tool-container">
    <div class="questit-meta">
      <span>Generated with Questit</span>
      <h1>${shellTitle}</h1>
      ${summaryHtml}
      <div class="questit-meta-grid">
        <div class="questit-meta-chip">
          <span>Model</span>
          <strong>${escapeHtmlText(modelDisplay)}</strong>
        </div>
        <div class="questit-meta-chip">
          <span>Theme</span>
          <strong>${escapeHtmlText(themeLabel)}</strong>
        </div>
        <div class="questit-meta-chip">
          <span>Mode</span>
          <strong>${escapeHtmlText(modeLabel)}</strong>
        </div>
      </div>
      <div class="questit-meta-cta">
        <strong>Tip:</strong>
        <span>Remix or open above to customise this tool in Questit. If you're not signed in yet, the workspace will prompt you to log in.</span>
      </div>
    </div>
    <section class="questit-tool" id="questit-tool-root">
${htmlSnippet}
    </section>
    <footer class="questit-footer">
      This tool runs entirely in the browser. Remix it in the Questit workbench to customize and publish your own copy.
    </footer>
  </div>
</div>
<script>
${colorModeSetup}
(() => {
  try {
    const anchor = document.querySelector('[data-questit-action="remix"]');
    const slugFromMeta = ${shareSlug ? `"${shareSlug}"` : 'null'};
    let slug = slugFromMeta;
    if (!slug && typeof window !== 'undefined') {
      const host = window.location.hostname || '';
      slug = host.split('.').filter(Boolean)[0] || '';
    }
    if (anchor && slug) {
      anchor.href = 'https://questit.cc/?remix=' + encodeURIComponent(slug);
    }
  } catch (error) {
    console.warn('Questit remix link generation failed', error);
  }
})();
(() => {
  if (typeof window === 'undefined') return;
  const root = document.querySelector('[data-questit-auth]');
  if (!root) return;
  const labelEl = root.querySelector('[data-questit-auth-label]');
  const actionEl = root.querySelector('[data-questit-auth-action]');
  const defaultAction = {
    href: actionEl ? actionEl.getAttribute('href') || 'https://questit.cc/?login=1' : 'https://questit.cc/?login=1',
    text: actionEl ? actionEl.textContent || 'Log in to Questit' : 'Log in to Questit'
  };
  const guestState = {
    label: 'Viewing as guest',
    actionText: defaultAction.text,
    actionHref: defaultAction.href
  };

  const setState = (state, meta = {}) => {
    root.setAttribute('data-status', state);
    if (labelEl) {
      labelEl.textContent = meta.label || (state === 'signed-in'
        ? 'Signed in to Questit'
        : state === 'error'
          ? 'Status unavailable'
          : state === 'checking'
            ? 'Checking sign-in…'
          : 'Viewing as guest');
    }
    if (actionEl) {
      if (state === 'signed-in') {
        actionEl.hidden = true;
        actionEl.textContent = defaultAction.text;
        actionEl.href = defaultAction.href;
      } else {
        actionEl.hidden = false;
        actionEl.textContent = meta.actionText || defaultAction.text;
        actionEl.href = meta.actionHref || defaultAction.href;
      }
    }
  };

  setState('signed-out', guestState);

  const defaultBridgeOrigin = 'https://questit.cc';
  let bridgeOrigin = defaultBridgeOrigin;
  try {
    const currentOrigin = window.location.origin;
    if (currentOrigin && currentOrigin.startsWith('http')) {
      bridgeOrigin = currentOrigin;
    }
  } catch {
    bridgeOrigin = defaultBridgeOrigin;
  }
  const bridgeUrl =
    bridgeOrigin.replace(/\/$/, '') +
    '/auth-bridge.html?origin=' +
    encodeURIComponent(window.location.origin || bridgeOrigin);

  const iframe = document.createElement('iframe');
  iframe.src = bridgeUrl;
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
      console.warn('Questit auth request failed', error);
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

  const handleMessage = (event) => {
    if (event.origin !== bridgeOrigin) return;
    applyPayload(event.data);
  };

  window.addEventListener('message', handleMessage);
  iframe.addEventListener('load', () => {
    requestAuthState();
    window.setTimeout(requestAuthState, 500);
  });

  window.setTimeout(() => {
    if (!handshakeResolved) {
      setState('signed-out', guestState);
    }
  }, 2500);

  document.body.appendChild(iframe);
})();
</script>
<script type="module">
${jsSnippet}
</script>
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
    js: tool.js || ''
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

const html = ${JSON.stringify(fullHtml)};
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
    
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { 
        status: 405,
        headers: corsHeaders
      });
    }
    
    const tool = await request.json();

    const accountId = env.CLOUDFLARE_ACCOUNT_ID;
    const namespaceSlug = env.WFP_NAMESPACE_NAME || env.WFP_NAMESPACE_ID;
    const token = env.CLOUDFLARE_API_TOKEN;
    if (!accountId || !namespaceSlug || !token) {
      return new Response('Workers for Platforms not configured', { 
        status: 500,
        headers: corsHeaders
      });
    }

    const sanitizeSlug = (value) =>
      String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const baseSlugSource = tool.slug || tool.title || tool.id || '';
    let baseSlug = sanitizeSlug(baseSlugSource).slice(0, 40);
    if (!baseSlug) {
      baseSlug = `tool`;
    }
    const randomSuffix = Math.random().toString(36).slice(2, 7);
    let scriptName = `${baseSlug}-${randomSuffix}`.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    if (scriptName.length > 63) {
      scriptName = scriptName.slice(0, 63).replace(/-+$/g, '');
    }

    const enrichedTool = { ...tool, share_slug: scriptName };
    const source = buildUserWorkerScript(enrichedTool);

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/dispatch/namespaces/${namespaceSlug}/scripts/${scriptName}`;
    const res = await fetch(url, {
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

    return new Response(JSON.stringify({ name: scriptName, namespace: namespaceSlug }), { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
};
