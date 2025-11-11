import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Sparkles,
  RefreshCcw,
  Loader2,
  FileCode,
  Palette,
  Moon,
  Sun,
  Monitor,
  Share2,
  ExternalLink,
  Check,
  Copy
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { hasSupabaseConfig, supabase } from '@/lib/supabaseClient';
import { publishTool as publishSavedTool } from '@questit/core/publish.js';
import { generateTool } from './generateTool.js';
import WorkbenchHero from '@/components/workbench/WorkbenchHero.jsx';
import WorkbenchHeader from '@/components/workbench/WorkbenchHeader.jsx';
import PromptComposer from '@/components/workbench/PromptComposer.jsx';
import PromptTimeline from '@/components/workbench/PromptTimeline.jsx';
import SaveToolDialog from '@/components/workbench/SaveToolDialog.jsx';

const DEFAULT_PROMPT = 'Create a simple calculator';

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
  '--font-sans': "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
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
  '--font-sans': "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
};

const THEME_PRESETS = {
  emerald: {
    label: 'Emerald',
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
    label: 'Sky',
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
    label: 'Violet',
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
    label: 'Amber',
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
    label: 'Rose',
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
    label: 'Cyan',
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
    label: 'Indigo',
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
    label: 'Lime',
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
    label: 'Slate',
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
const THEME_OPTIONS = Object.entries(THEME_PRESETS).map(([value, config]) => ({
  value,
  label: config.label
}));
const COLOR_MODE_STORAGE_KEY = 'questit-color-mode';
const COLOR_MODE_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' }
];

const MODEL_OPTIONS = [
  {
    id: 'gemini:2.5-flash',
    label: 'Google · Gemini 2.5 Flash',
    provider: 'gemini',
    model: 'gemini-2.5-flash'
  },
  {
    id: 'openai:gpt-4o-mini',
    label: 'OpenAI · GPT-4o mini',
    provider: 'openai',
    model: 'gpt-4o-mini'
  },
  {
    id: 'gemini:1.5-flash',
    label: 'Google · Gemini 1.5 Flash (Legacy)',
    provider: 'gemini',
    model: 'gemini-1.5-flash'
  }
];

function resolveThemeVars(themeKey = DEFAULT_THEME_KEY) {
  const preset = THEME_PRESETS[themeKey] ?? THEME_PRESETS[DEFAULT_THEME_KEY];
  const lightVars = { ...BASE_THEME_VARS, ...preset.overrides };
  const darkVars = { ...BASE_DARK_THEME_VARS, ...(preset.darkOverrides ?? {}) };
  return { lightVars, darkVars };
}

function buildThemeCss(themeKey = DEFAULT_THEME_KEY) {
  const { lightVars, darkVars } = resolveThemeVars(themeKey);
  const toDeclarations = (vars) =>
    Object.entries(vars)
      .map(([token, value]) => `${token}: ${value};`)
      .join('\n');

  return `
:root {
${toDeclarations(lightVars)}
}

.dark {
${toDeclarations(darkVars)}
}

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}
`;
}

function buildIframeHTML({ html = '', css = '', js = '' }, themeKey = DEFAULT_THEME_KEY, mode = 'light') {
  const themeCss = buildThemeCss(themeKey);
  const htmlClass = mode === 'dark' ? ' class="dark"' : '';
  return `<!doctype html>
<html${htmlClass}>
<head>
<meta charset="utf-8"/>
<style>${themeCss}
${css || ''}</style>
</head>
<body>
${html || '<p>No HTML returned.</p>'}
<script type="module">
${js || ''}
</script>
</body>
</html>`;
}

function resolveApiBase(endpoint) {
  if (!endpoint) return 'https://questit.cc/api';
  try {
    const url = new URL(endpoint);
    const segments = url.pathname.split('/').filter(Boolean);
    const apiIndex = segments.indexOf('api');
    const basePath = apiIndex >= 0 ? segments.slice(0, apiIndex + 1).join('/') : 'api';
    return `${url.origin}/${basePath}`;
  } catch {
    return 'https://questit.cc/api';
  }
}

function buildShareUrl(workerName, apiBase) {
  if (!workerName) return '';
  try {
    const url = new URL(apiBase);
    const host = url.hostname;
    if (host.includes('localhost') || host.startsWith('127.') || host.startsWith('0.')) {
      return '';
    }
    return `${url.origin}/tools/${encodeURIComponent(workerName)}/`;
  } catch {
    return '';
  }
}

function summarizeCodeBundle({ html = '', css = '', js = '' }) {
  const parts = [];
  if (html) parts.push(`HTML ${html.length.toLocaleString()} chars`);
  if (css) parts.push(`CSS ${css.length.toLocaleString()} chars`);
  if (js) parts.push(`JS ${js.length.toLocaleString()} chars`);
  if (!parts.length) {
    return '';
  }
  return `Updated ${parts.join(' · ')}`;
}

function App() {
  const [composerValue, setComposerValue] = useState(DEFAULT_PROMPT);
  const [sessionEntries, setSessionEntries] = useState([]);
  const [sessionStatus, setSessionStatus] = useState({
    state: 'idle',
    message: ''
  });
  const [toolCode, setToolCode] = useState({ html: '', css: '', js: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(DEFAULT_THEME_KEY);
  const [user, setUser] = useState(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authStatus, setAuthStatus] = useState({ state: 'idle', message: '' });
  const [saveStatus, setSaveStatus] = useState({ state: 'idle', message: '' });
  const [saveDraft, setSaveDraft] = useState({ title: '', summary: '' });
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState('workbench');
  const [myTools, setMyTools] = useState([]);
  const [isLoadingMyTools, setIsLoadingMyTools] = useState(false);
  const [myToolsError, setMyToolsError] = useState('');
  const [myToolsRefreshKey, setMyToolsRefreshKey] = useState(0);
  const [toolActionStatus, setToolActionStatus] = useState({});
  const composerRef = useRef(null);
  const [colorMode, setColorMode] = useState(() => {
    if (typeof window === 'undefined') return 'system';
    try {
      return localStorage.getItem(COLOR_MODE_STORAGE_KEY) || 'system';
    } catch {
      return 'system';
    }
  });
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [modelId, setModelId] = useState(() => {
    if (typeof window === 'undefined') return MODEL_OPTIONS[0].id;
    try {
      const params = new URLSearchParams(window.location.search);
      const paramModel = params.get('model');
      if (paramModel && MODEL_OPTIONS.some((option) => option.id === paramModel)) {
        return paramModel;
      }
    } catch {
      // ignore
    }
    return MODEL_OPTIONS[0].id;
  });

  const endpoint = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('endpoint') || 'https://questit.cc/api/ai/proxy';
  }, []);
  const apiBase = useMemo(() => resolveApiBase(endpoint), [endpoint]);
  const selectedModelOption = useMemo(
    () => MODEL_OPTIONS.find((option) => option.id === modelId) || MODEL_OPTIONS[0],
    [modelId]
  );
  const handleOpenDocs = useCallback(() => {
    window.open('https://github.com/aaquib90/questit#readme', '_blank', 'noopener,noreferrer');
  }, []);
  const { html: currentHtml, css: currentCss, js: currentJs } = toolCode;
  const hasGenerated = Boolean(currentHtml || currentCss || currentJs);
  const resolvedMode = colorMode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : colorMode;
  const iframeDoc = useMemo(
    () =>
      hasGenerated
        ? buildIframeHTML(
            { html: currentHtml, css: currentCss, js: currentJs },
            selectedTheme,
            resolvedMode
          )
        : '',
    [currentCss, currentHtml, currentJs, hasGenerated, resolvedMode, selectedTheme]
  );
  const ModeIndicator = colorMode === 'system' ? Monitor : resolvedMode === 'dark' ? Moon : Sun;
  const userLabel = user?.email || user?.user_metadata?.full_name || 'Signed in';

  const handleRequestLogin = useCallback(() => {
    setAuthDialogOpen(true);
    setAuthStatus({ state: 'idle', message: '' });
  }, []);

  const createEntryId = () =>
    `entry-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  const executePrompt = async ({ promptText, reuseEntryId = null } = {}) => {
    const trimmed = (promptText || '').trim();
    if (!trimmed || isGenerating) return;

    const entryId = reuseEntryId || createEntryId();
    const timestamp = new Date().toISOString();
    const modelLabel = selectedModelOption.label;

    setSessionEntries((previous) => {
      if (reuseEntryId) {
        return previous.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                prompt: trimmed,
                status: 'pending',
                error: null,
                responseSummary: '',
                createdAt: timestamp,
                modelLabel
              }
            : entry
        );
      }
      return [
        ...previous,
        {
          id: entryId,
          prompt: trimmed,
          status: 'pending',
          createdAt: timestamp,
          modelId: selectedModelOption.id,
          modelLabel,
          error: null,
          responseSummary: ''
        }
      ];
    });

    if (!reuseEntryId) {
      setComposerValue('');
    }

    setIsGenerating(true);
    setSessionStatus({ state: 'loading', message: '' });

    try {
      const modelConfig = {
        provider: selectedModelOption.provider,
        model: selectedModelOption.model
      };
      const previousCode = hasGenerated ? toolCode : undefined;
      const result = await generateTool(trimmed, endpoint, previousCode, modelConfig);

      setToolCode(result);
      setSessionEntries((previous) =>
        previous.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                status: 'success',
                responseSummary: summarizeCodeBundle(result),
                error: null
              }
            : entry
        )
      );
      setSessionStatus({ state: 'success', message: '' });
      setSaveDraft((draft) => ({
        title: draft.title || trimmed.slice(0, 80),
        summary: draft.summary
      }));
    } catch (error) {
      console.error('Generation error:', error);
      const message = error?.message || 'Failed to generate tool.';
      setSessionEntries((previous) =>
        previous.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                status: 'error',
                error: message
              }
            : entry
        )
      );
      setSessionStatus({ state: 'error', message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePromptSubmit = () => {
    executePrompt({ promptText: composerValue });
  };

  const handleRetryEntry = (entry) => {
    executePrompt({ promptText: entry?.prompt || '', reuseEntryId: entry?.id });
  };

  const handleUsePrompt = (promptText) => {
    setComposerValue(promptText);
    setActiveView('workbench');
    composerRef.current?.focus();
  };

  const handleResetSession = () => {
    setSessionEntries([]);
    setToolCode({ html: '', css: '', js: '' });
    setComposerValue(DEFAULT_PROMPT);
    setSessionStatus({
      state: 'idle',
      message: ''
    });
    setSaveStatus({ state: 'idle', message: '' });
    setSaveDraft({ title: '', summary: '' });
  };

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const params = new URLSearchParams(window.location.search);
    const remixSlug = params.get('remix');
    if (!remixSlug) return undefined;

    const sanitizedSlug = remixSlug.trim().toLowerCase();
    if (!sanitizedSlug) return undefined;

    const loadRemix = async () => {
      try {
        setSessionStatus({ state: 'loading', message: 'Loading shared tool for remix…' });
        const origin = window.location.origin || '';
        const isLocalOrigin =
          origin.includes('localhost') || origin.includes('127.') || origin.includes('0.0.0.0');
        const canonicalOrigin = isLocalOrigin ? 'https://questit.cc' : origin;
        const metadataCandidates = [
          `${canonicalOrigin.replace(/\/$/, '')}/tools/${encodeURIComponent(sanitizedSlug)}/metadata`,
          `https://${sanitizedSlug}.questit.cc/metadata`
        ];

        let response;
        let lastError = null;

        for (const candidate of metadataCandidates) {
          try {
            response = await fetch(candidate, {
              headers: { Accept: 'application/json' }
            });
            if (response.ok) {
              lastError = null;
              break;
            }
            lastError = new Error(`Unable to fetch shared tool (status ${response.status})`);
          } catch (error) {
            lastError = error;
          }
        }

        if (!response || !response.ok) {
          throw lastError || new Error('Unable to fetch shared tool metadata.');
        }

        const data = await response.json();
        const html = data.html || '';
        const css = data.css || '';
        const js = data.js || '';
        setToolCode({ html, css, js });
        setSessionEntries([
          {
            id: createEntryId(),
            prompt: data.prompt || 'Remixed from shared tool',
            status: 'success',
            createdAt: new Date().toISOString(),
            responseSummary: 'Loaded shared bundle.',
            modelLabel:
              data.model_provider && data.model_name
                ? `${data.model_provider} · ${data.model_name}`
                : selectedModelOption.label,
            error: null
          }
        ]);
        if (data.theme) {
          setSelectedTheme(data.theme);
        }
        if (data.color_mode) {
          setColorMode(data.color_mode);
        }
        if (data.model_provider && data.model_name) {
          const match = MODEL_OPTIONS.find(
            (option) =>
              option.provider === data.model_provider && option.model === data.model_name
          );
          if (match) {
            setModelId(match.id);
          }
        }
        setSaveDraft({
          title: data.title || data.prompt?.slice(0, 80) || '',
          summary: data.public_summary || ''
        });
        setSessionStatus({
          state: 'success',
          message: 'Shared tool loaded. Iterate or publish as needed.'
        });
        setComposerValue('');
        setActiveView('workbench');
      } catch (error) {
        console.error('Failed to load remix tool:', error);
        setSessionStatus({
          state: 'error',
          message: error?.message || 'Unable to load shared tool for remix.'
        });
      } finally {
        params.delete('remix');
        const nextSearch = params.toString();
        const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
        window.history.replaceState(null, '', nextUrl);
      }
    };

    loadRemix();
    return undefined;
  }, [selectedModelOption.label]);

  const updateToolActionStatus = useCallback((toolId, updates) => {
    setToolActionStatus((previous) => {
      const existing = previous[toolId] || {};
      return {
        ...previous,
        [toolId]: { ...existing, ...updates }
      };
    });
  }, []);

  const fetchToolDetails = async (toolId) => {
    const { data, error } = await supabase
      .from('user_tools')
      .select('id, title, prompt, public_summary, model_provider, model_name, theme, color_mode, html, css, js, created_at, updated_at')
      .eq('id', toolId)
      .maybeSingle();

    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error('Saved tool not found.');
    }

    setMyTools((previous) =>
      previous.map((tool) => (tool.id === toolId ? { ...tool, ...data } : tool))
    );
    return data;
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    if (!hasSupabaseConfig) {
      setAuthStatus({
        state: 'error',
        message: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      });
      return;
    }
    if (!authEmail.trim()) {
      setAuthStatus({ state: 'error', message: 'Enter an email address to continue.' });
      return;
    }

    setAuthStatus({ state: 'loading', message: 'Sending magic link…' });
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail.trim(),
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) {
      setAuthStatus({ state: 'error', message: error.message });
      return;
    }

    setAuthStatus({
      state: 'success',
      message: 'Magic link sent. Check your inbox to finish signing in.'
    });
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setAuthStatus({ state: 'idle', message: '' });
      setSaveStatus({ state: 'idle', message: '' });
      setAuthEmail('');
      handleResetSession();
      setMyTools([]);
      setMyToolsError('');
      setIsLoadingMyTools(false);
      setToolActionStatus({});
    } catch (error) {
      console.warn('Sign out failed:', error);
    }
  };

  const handleRefreshMyTools = () => {
    setMyToolsRefreshKey((value) => value + 1);
  };

  const handleLoadSavedTool = async (toolId) => {
    if (!user) {
      handleRequestLogin();
      return;
    }
    if (!hasSupabaseConfig) {
      setMyToolsError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return;
    }

    updateToolActionStatus(toolId, { loading: true, error: '' });
    try {
      let toolRecord = myTools.find((tool) => tool.id === toolId);
      const hasCode =
        toolRecord &&
        (typeof toolRecord.html === 'string' ||
          typeof toolRecord.css === 'string' ||
          typeof toolRecord.js === 'string');
      if (!hasCode) {
        toolRecord = await fetchToolDetails(toolId);
      }
      if (!toolRecord) {
        throw new Error('Saved tool not found.');
      }

      const html = toolRecord.html || '';
      const css = toolRecord.css || '';
      const js = toolRecord.js || '';
      setToolCode({ html, css, js });
      const modelLabelFromRecord =
        toolRecord.model_provider && toolRecord.model_name
          ? `${toolRecord.model_provider} · ${toolRecord.model_name}`
          : selectedModelOption.label;

      setSessionEntries([
        {
          id: createEntryId(),
          prompt: toolRecord.prompt || 'Loaded from Supabase',
          status: 'success',
          createdAt: toolRecord.updated_at || new Date().toISOString(),
          responseSummary: 'Loaded saved bundle.',
          modelLabel: modelLabelFromRecord,
          error: null
        }
      ]);
      setSessionStatus({
        state: 'success',
        message: 'Loaded saved tool into the workbench.'
      });
      setComposerValue('');
      setSaveDraft({
        title: toolRecord.title || '',
        summary: toolRecord.public_summary || ''
      });
      if (toolRecord.theme) {
        setSelectedTheme(toolRecord.theme);
      }
      if (toolRecord.color_mode) {
        setColorMode(toolRecord.color_mode);
      }
      if (toolRecord.model_provider && toolRecord.model_name) {
        const match = MODEL_OPTIONS.find(
          (option) =>
            option.provider === toolRecord.model_provider && option.model === toolRecord.model_name
        );
        if (match) {
          setModelId(match.id);
        }
      }
      setActiveView('workbench');
      setSaveStatus({ state: 'idle', message: '' });
      updateToolActionStatus(toolId, { loading: false, error: '' });
    } catch (error) {
      console.error('Failed to load saved tool:', error);
      updateToolActionStatus(toolId, {
        loading: false,
        error: error?.message || 'Failed to load saved tool.'
      });
    }
  };

  const handleCopyShareLink = useCallback(async (shareUrl, toolId) => {
    if (!shareUrl || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      updateToolActionStatus(toolId, { linkCopied: true });
      setTimeout(() => {
        updateToolActionStatus(toolId, { linkCopied: false });
      }, 3000);
    } catch (error) {
      console.warn('Failed to copy link to clipboard:', error);
    }
  }, [updateToolActionStatus]);

  const handlePublishSavedTool = async (toolId) => {
    if (!user) {
      handleRequestLogin();
      return;
    }
    if (!hasSupabaseConfig) {
      setMyToolsError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      updateToolActionStatus(toolId, { publishing: false, error: '' });
      return;
    }
    updateToolActionStatus(toolId, { publishing: true, error: '' });

    try {
      let toolRecord = myTools.find((tool) => tool.id === toolId);
      const hasCode =
        toolRecord &&
        (typeof toolRecord.html === 'string' ||
          typeof toolRecord.css === 'string' ||
          typeof toolRecord.js === 'string');
      if (!hasCode) {
        toolRecord = await fetchToolDetails(toolId);
      }
      if (!toolRecord) {
        throw new Error('Saved tool not found.');
      }

      if (!toolRecord.html && !toolRecord.css && !toolRecord.js) {
        throw new Error('Saved tool is missing code content.');
      }

      const publishPayload = {
        id: toolRecord.id,
        title: toolRecord.title,
        public_summary: toolRecord.public_summary || saveDraft.summary || '',
        theme: toolRecord.theme || selectedTheme || DEFAULT_THEME_KEY,
        color_mode: toolRecord.color_mode || colorMode || resolvedMode,
        model_provider: toolRecord.model_provider || selectedModelOption.provider,
        model_name: toolRecord.model_name || selectedModelOption.model,
        html: toolRecord.html || '',
        css: toolRecord.css || '',
        js: toolRecord.js || ''
      };

      const result = await publishSavedTool(publishPayload, apiBase);
      const shareUrl = buildShareUrl(result?.name, apiBase);

      updateToolActionStatus(toolId, {
        publishing: false,
        error: '',
        shareUrl,
        publishedName: result?.name || '',
        publishedNamespace: result?.namespace || ''
      });

      // Copy link to clipboard automatically
      if (shareUrl) {
        await handleCopyShareLink(shareUrl, toolId);
      }
    } catch (error) {
      console.error('Failed to publish saved tool:', error);
      updateToolActionStatus(toolId, {
        publishing: false,
        error: error?.message || 'Failed to publish tool.'
      });
    }
  };

  const handleOpenSaveDialog = () => {
    if (!user) {
      handleRequestLogin();
      return;
    }
    if (!hasSupabaseConfig) {
      setSaveStatus({
        state: 'error',
        message: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      });
      return;
    }
    if (!hasGenerated) {
      setSaveStatus({
        state: 'error',
        message: 'Generate a tool before saving.'
      });
      return;
    }

    const latestPrompt = sessionEntries.at(-1)?.prompt || composerValue || DEFAULT_PROMPT;
    setSaveDraft((draft) => ({
      title: draft.title || latestPrompt.slice(0, 80),
      summary: draft.summary || ''
    }));
    setSaveStatus({ state: 'idle', message: '' });
    setSaveDialogOpen(true);
  };

  const handleSaveTool = async ({ title, summary }) => {
    if (!user || !hasSupabaseConfig) {
      setSaveStatus({
        state: 'error',
        message: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      });
      return;
    }

    setSaveStatus({ state: 'loading', message: 'Saving to Supabase…' });
    const sourcePrompt = sessionEntries[0]?.prompt || composerValue || null;

    const { error } = await supabase.from('user_tools').insert({
      user_id: user.id,
      title,
      prompt: sourcePrompt,
      theme: selectedTheme,
      color_mode: colorMode,
      public_summary: summary || null,
      model_provider: selectedModelOption.provider,
      model_name: selectedModelOption.model,
      html: currentHtml,
      css: currentCss,
      js: currentJs
    });

    if (error) {
      setSaveStatus({ state: 'error', message: error.message });
      return;
    }

    setSaveDialogOpen(false);
    setSaveDraft({ title, summary });
    setMyToolsRefreshKey((value) => value + 1);
    setSaveStatus({ state: 'success', message: 'Tool saved to Supabase.' });
  };

  useEffect(() => {
    if (!hasSupabaseConfig) return undefined;
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (isMounted) {
          setUser(data.session?.user ?? null);
        }
      })
      .catch((error) => {
        console.warn('Failed to load Supabase session:', error);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const updatePreference = () => setSystemPrefersDark(media.matches);
    updatePreference();
    if (media.addEventListener) {
      media.addEventListener('change', updatePreference);
      return () => media.removeEventListener('change', updatePreference);
    }
    media.addListener(updatePreference);
    return () => media.removeListener(updatePreference);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedMode === 'dark');
    try {
      localStorage.setItem(COLOR_MODE_STORAGE_KEY, colorMode);
    } catch (storageError) {
      console.warn('Failed to persist color mode preference:', storageError);
    }
    const { lightVars, darkVars } = resolveThemeVars(selectedTheme);
    const activeVars = resolvedMode === 'dark' ? darkVars : lightVars;
    Object.entries(activeVars).forEach(([token, value]) => {
      root.style.setProperty(token, value);
    });
  }, [colorMode, resolvedMode, selectedTheme]);

  useEffect(() => {
    if (activeView !== 'my-tools') return undefined;
    if (!hasSupabaseConfig || !user) {
      setIsLoadingMyTools(false);
      return undefined;
    }

    let isActive = true;
    setIsLoadingMyTools(true);
    setMyToolsError('');

    supabase
      .from('user_tools')
      .select('id, title, prompt, public_summary, model_provider, model_name, theme, color_mode, created_at, updated_at')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!isActive) return;
        if (error) {
          setMyToolsError(error.message);
          setMyTools([]);
          return;
        }
        setMyTools(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        if (!isActive) return;
        setMyToolsError(error?.message || 'Failed to load saved tools.');
        setMyTools([]);
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoadingMyTools(false);
      });

    return () => {
      isActive = false;
    };
  }, [activeView, myToolsRefreshKey, user]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="questit-aurora" />
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-10">
        <WorkbenchHeader
          activeView={activeView}
          onSelectView={setActiveView}
          user={user}
          userLabel={userLabel}
          onLogin={handleRequestLogin}
          onSignOut={handleSignOut}
        />

        {activeView === 'workbench' ? (
          <div className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
              <Card className="border border-primary/30 bg-card shadow-lg shadow-primary/10">
                <CardHeader className="space-y-4">
                  <div className="space-y-1.5">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="h-5 w-5 text-primary" aria-hidden />
                      Prompt
                    </CardTitle>
                    <CardDescription>
                      Describe what you want and generate a tool.
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="composer-model">Model</Label>
                      <Select value={modelId} onValueChange={setModelId}>
                        <SelectTrigger id="composer-model" className="w-[220px]">
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          {MODEL_OPTIONS.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {sessionEntries.length ? (
                      <Badge variant="secondary" className="w-fit">
                        Steps: {sessionEntries.length}
                      </Badge>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <PromptComposer
                    ref={composerRef}
                    value={composerValue}
                    onChange={setComposerValue}
                    onSubmit={handlePromptSubmit}
                    disabled={isGenerating}
                    isWorking={isGenerating}
                    status={sessionStatus}
                    onReset={handleResetSession}
                    canReset={sessionEntries.length > 0 || hasGenerated}
                    onSave={handleOpenSaveDialog}
                    hasGenerated={hasGenerated}
                    user={user}
                    saveStatus={saveStatus}
                    placeholder="Describe the tool you want to build…"
                  />
                </CardContent>
              </Card>

              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="mb-4 grid w-full grid-cols-2 bg-muted/70">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="preview">
                  <div className="space-y-6">
                    <Card className="overflow-hidden border border-primary/30 bg-card shadow-lg shadow-primary/10">
                      <CardHeader className="space-y-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <FileCode className="h-5 w-5 text-primary" aria-hidden />
                              Preview
                            </CardTitle>
                            <CardDescription>Rendered output from the latest AI response.</CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Palette className="h-4 w-4 text-primary" aria-hidden />
                              Theme
                            </span>
                            <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select theme" />
                              </SelectTrigger>
                              <SelectContent>
                                {THEME_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-2 text-sm text-muted-foreground">
                              <ModeIndicator className="h-4 w-4 text-primary" aria-hidden />
                              Mode
                            </span>
                            <Select value={colorMode} onValueChange={setColorMode}>
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                              <SelectContent>
                                {COLOR_MODE_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {hasGenerated ? (
                            <Badge variant="secondary" className="w-fit">
                              Live
                            </Badge>
                          ) : null}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="relative overflow-hidden rounded-xl border border-dashed border-primary/30 bg-muted/40">
                          {iframeDoc ? (
                            <iframe
                              title="Questit preview"
                              sandbox="allow-scripts allow-same-origin"
                              srcDoc={iframeDoc}
                              className="min-h-[360px] w-full rounded-xl bg-background"
                            />
                          ) : (
                            <div className="flex min-h-[360px] items-center justify-center text-sm text-muted-foreground">
                              Generated tool will appear here.
                            </div>
                          )}
                        </div>
                        {saveStatus.message ? (
                          <p
                            className={`text-xs ${
                              saveStatus.state === 'error'
                                ? 'text-destructive'
                                : saveStatus.state === 'success'
                                  ? 'text-emerald-500'
                                  : 'text-muted-foreground'
                            }`}
                          >
                            {saveStatus.message}
                          </p>
                        ) : null}
                      </CardContent>
                    </Card>

                    {hasGenerated ? (
                      <Card className="border border-primary/20 shadow-md">
                        <CardHeader className="space-y-1.5">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <FileCode className="h-5 w-5 text-primary" aria-hidden />
                            Generated code
                          </CardTitle>
                          <CardDescription>Review the HTML, CSS, and JavaScript bundles.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Tabs defaultValue="html" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 bg-muted/70">
                              <TabsTrigger value="html">HTML</TabsTrigger>
                              <TabsTrigger value="css">CSS</TabsTrigger>
                              <TabsTrigger value="js">JavaScript</TabsTrigger>
                            </TabsList>
                            <TabsContent value="html">
                              <pre className="max-h-[320px] overflow-auto rounded-lg bg-slate-950/95 p-4 text-sm text-primary-foreground">
                                {toolCode.html || '// No HTML returned'}
                              </pre>
                            </TabsContent>
                            <TabsContent value="css">
                              <pre className="max-h-[320px] overflow-auto rounded-lg bg-slate-950/95 p-4 text-sm text-primary-foreground">
                                {toolCode.css || '// No CSS returned'}
                              </pre>
                            </TabsContent>
                            <TabsContent value="js">
                              <pre className="max-h-[320px] overflow-auto rounded-lg bg-slate-950/95 p-4 text-sm text-primary-foreground">
                                {toolCode.js || '// No JS returned'}
                              </pre>
                            </TabsContent>
                          </Tabs>
                        </CardContent>
                      </Card>
                    ) : null}
                  </div>
                </TabsContent>
                <TabsContent value="history">
                  <Card className="border border-primary/30 bg-card shadow-lg shadow-primary/10">
                    <CardHeader className="space-y-2">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="h-5 w-5 text-primary" aria-hidden />
                        Prompt History
                      </CardTitle>
                      <CardDescription>
                        Review previous prompts and statuses. Reuse or retry as needed.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PromptTimeline
                        entries={sessionEntries}
                        onUsePrompt={handleUsePrompt}
                        onRetry={handleRetryEntry}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          <section className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">My Tools</h2>
                <p className="text-sm text-muted-foreground">
                  Review the tools you have saved to Supabase.
                </p>
              </div>
              {user && hasSupabaseConfig ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshMyTools}
                  disabled={isLoadingMyTools}
                >
                  {isLoadingMyTools ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Refreshing
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="h-4 w-4" aria-hidden />
                      Refresh
                    </>
                  )}
                </Button>
              ) : null}
            </div>

            {!hasSupabaseConfig ? (
              <Card className="border border-primary/20 bg-muted/40">
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  Supabase environment variables are not configured. Set <code>VITE_SUPABASE_URL</code>{' '}
                  and <code>VITE_SUPABASE_ANON_KEY</code> to enable saving and viewing tools.
                </CardContent>
              </Card>
            ) : !user ? (
              <Card className="border border-primary/20 bg-muted/40">
                <CardContent className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Sign in with a magic link to view your saved tools.
                  </p>
                  <Button className="mt-4" onClick={handleRequestLogin}>
                    Send magic link
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {myToolsError ? (
                  <Card className="border border-destructive/30 bg-destructive/10 text-destructive">
                    <CardContent className="py-6 text-sm">{myToolsError}</CardContent>
                  </Card>
                ) : null}

                {isLoadingMyTools && myTools.length === 0 ? (
                  <Card className="border border-primary/30 bg-muted/40">
                    <CardContent className="flex flex-col items-center gap-3 py-8 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden />
                      Loading your saved tools…
                    </CardContent>
                  </Card>
                ) : null}

                {myTools.length === 0 && !isLoadingMyTools ? (
                  <Card className="border border-primary/20 bg-muted/30">
                    <CardContent className="py-8 text-center text-sm text-muted-foreground">
                      You have not saved any tools yet. Generate one in the workbench and save it to
                      see it here.
                    </CardContent>
                  </Card>
                ) : null}

                {myTools.map((tool) => {
                  const status = toolActionStatus[tool.id] || {};
                  return (
                    <Card key={tool.id} className="border border-primary/20 bg-card shadow-sm">
                      <CardHeader className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg">
                              {tool.title || 'Untitled Questit Tool'}
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                              Saved on{' '}
                              {new Date(tool.created_at || tool.updated_at).toLocaleString()}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="text-xs font-medium uppercase tracking-wide">
                            {tool.model_provider ? `${tool.model_provider}` : 'Model'}
                          </Badge>
                        </div>
                        {tool.public_summary ? (
                          <p className="text-sm text-muted-foreground">{tool.public_summary}</p>
                        ) : null}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>{tool.theme ? `Theme: ${tool.theme}` : 'Default theme'}</span>
                          <span>•</span>
                          <span>{tool.color_mode ? `Mode: ${tool.color_mode}` : 'Mode: light'}</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleLoadSavedTool(tool.id)}
                            disabled={!!status.loading}
                          >
                            {status.loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                                Loading…
                              </>
                            ) : (
                              'Load in workbench'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handlePublishSavedTool(tool.id)}
                            disabled={!!status.publishing}
                          >
                            {status.publishing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                                Publishing…
                              </>
                            ) : (
                              <>
                                <Share2 className="mr-2 h-4 w-4" aria-hidden />
                                Publish share link
                              </>
                            )}
                          </Button>
                        </div>
                        {status.shareUrl ? (
                          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
                            {status.linkCopied ? (
                              <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                <Check className="h-4 w-4" aria-hidden />
                                Link copied to clipboard
                              </div>
                            ) : (
                              <div className="flex flex-1 items-center justify-between gap-2">
                                <a
                                  href={status.shareUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 underline-offset-2 hover:underline dark:text-emerald-400"
                                >
                                  {status.shareUrl}
                                  <ExternalLink className="h-3 w-3" aria-hidden />
                                </a>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 gap-1.5 px-2 text-xs"
                                  onClick={() => handleCopyShareLink(status.shareUrl, tool.id)}
                                >
                                  <Copy className="h-3 w-3" aria-hidden />
                                  Copy
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : status.publishedName ? (
                          <p className="text-xs text-muted-foreground">
                            Published worker: {status.publishedName}
                          </p>
                        ) : null}
                        {status.error ? (
                          <p className="text-xs text-destructive">{status.error}</p>
                        ) : null}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <SaveToolDialog
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
          initialTitle={saveDraft.title || sessionEntries[0]?.prompt?.slice(0, 80) || ''}
          initialSummary={saveDraft.summary || ''}
          onSubmit={handleSaveTool}
          status={saveStatus}
        />

        <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign in to Questit</DialogTitle>
              <DialogDescription>
                We’ll email you a magic link so you can save tools to Supabase.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auth-email">Email address</Label>
                <Input
                  id="auth-email"
                  type="email"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              {authStatus.message && (
                <p
                  className={`text-sm ${
                    authStatus.state === 'error'
                      ? 'text-destructive'
                      : authStatus.state === 'success'
                        ? 'text-emerald-500'
                        : 'text-muted-foreground'
                  }`}
                >
                  {authStatus.message}
                </p>
              )}
              <DialogFooter>
                <Button type="submit" disabled={authStatus.state === 'loading'}>
                  {authStatus.state === 'loading' ? 'Sending…' : 'Send magic link'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
      <footer className="relative mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-10">
        <div className="space-y-10">
          <WorkbenchHero onNavigateDocs={handleOpenDocs} />
        </div>
      </footer>
    </div>
  );
}

export default App;
