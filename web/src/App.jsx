import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Sparkles,
  RefreshCcw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  History as HistoryIcon,
  FileCode,
  Palette,
  Moon,
  Sun,
  Monitor,
  Share2,
  ExternalLink
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { hasSupabaseConfig, supabase } from '@/lib/supabaseClient';
import { publishTool as publishSavedTool } from '@questit/core/publish.js';
import { generateTool } from './generateTool.js';
import WorkbenchHero from '@/components/workbench/WorkbenchHero.jsx';

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
    const hostParts = host.split('.');
    const apexHost = hostParts.length >= 2 ? hostParts.slice(-2).join('.') : host;
    return `https://${workerName}.${apexHost}/`;
  } catch {
    return '';
  }
}

function App() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [toolCode, setToolCode] = useState({ html: '', css: '', js: '' });
  const [history, setHistory] = useState([]);
  const [iterationPrompt, setIterationPrompt] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(DEFAULT_THEME_KEY);
  const [user, setUser] = useState(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authStatus, setAuthStatus] = useState({ state: 'idle', message: '' });
  const [saveTitle, setSaveTitle] = useState('');
  const [saveSummary, setSaveSummary] = useState('');
  const [saveStatus, setSaveStatus] = useState({ state: 'idle', message: '' });
  const [activeView, setActiveView] = useState('workbench');
  const [myTools, setMyTools] = useState([]);
  const [isLoadingMyTools, setIsLoadingMyTools] = useState(false);
  const [myToolsError, setMyToolsError] = useState('');
  const [myToolsRefreshKey, setMyToolsRefreshKey] = useState(0);
  const [toolActionStatus, setToolActionStatus] = useState({});
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

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const params = new URLSearchParams(window.location.search);
    const remixSlug = params.get('remix');
    if (!remixSlug) return undefined;

    const sanitizedSlug = remixSlug.trim().toLowerCase();
    if (!sanitizedSlug) return undefined;

    const loadRemix = async () => {
      try {
        setStatusMessage('Loading shared tool for remix…');
        const response = await fetch(`https://${sanitizedSlug}.questit.cc/metadata`, {
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) {
          throw new Error(`Unable to fetch shared tool (status ${response.status})`);
        }
        const data = await response.json();
        const html = data.html || '';
        const css = data.css || '';
        const js = data.js || '';
        setToolCode({ html, css, js });
        setHistory([{ type: 'remix', prompt: '', code: { html, css, js } }]);
        setIterationPrompt('');
        if (data.theme) {
          setSelectedTheme(data.theme);
        }
        if (data.color_mode) {
          setColorMode(data.color_mode);
        }
        if (data.model_provider && data.model_name) {
          const match = MODEL_OPTIONS.find(
            (option) =>
              option.provider === data.model_provider &&
              option.model === data.model_name
          );
          if (match) {
            setModelId(match.id);
          }
        }
        setPrompt(''); // Prompt intentionally left blank for privacy
        setSaveTitle(data.title ? `${data.title} (Remix)` : 'Remixed Questit tool');
        setSaveSummary(data.public_summary || '');
        setActiveView('workbench');
        setStatusMessage('Loaded shared tool. Remix and save your own version.');
        setErrorMessage('');
        setSaveStatus({ state: 'idle', message: '' });
      } catch (error) {
        console.error('Failed to load remix tool:', error);
        setErrorMessage(error?.message || 'Unable to load shared tool for remix.');
      } finally {
        params.delete('remix');
        const nextSearch = params.toString();
        const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
        window.history.replaceState(null, '', nextUrl);
      }
    };

    loadRemix();
    return undefined;
  }, []);

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
      setSaveTitle('');
      setSaveSummary('');
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
      setAuthDialogOpen(true);
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
      setHistory([{ type: 'initial', prompt: toolRecord.prompt || '', code: { html, css, js } }]);
      setIterationPrompt('');
      setSelectedTheme(toolRecord.theme || DEFAULT_THEME_KEY);
      if (toolRecord.color_mode) {
        setColorMode(toolRecord.color_mode);
      }
      setPrompt(toolRecord.prompt || DEFAULT_PROMPT);
      setSaveTitle(toolRecord.title || '');
      setSaveSummary(toolRecord.public_summary || '');
      if (toolRecord.model_provider && toolRecord.model_name) {
        const match = MODEL_OPTIONS.find(
          (option) =>
            option.provider === toolRecord.model_provider &&
            option.model === toolRecord.model_name
        );
        if (match) {
          setModelId(match.id);
        }
      }
      setActiveView('workbench');
      setStatusMessage('Loaded saved tool into the workbench.');
      setErrorMessage('');
      setSaveStatus({ state: 'idle', message: '' });
      setAuthDialogOpen(false);

      updateToolActionStatus(toolId, { loading: false, error: '' });
    } catch (error) {
      console.error('Failed to load saved tool:', error);
      updateToolActionStatus(toolId, {
        loading: false,
        error: error?.message || 'Failed to load saved tool.'
      });
    }
  };

  const handlePublishSavedTool = async (toolId) => {
    if (!user) {
      setAuthDialogOpen(true);
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
        public_summary: toolRecord.public_summary || saveSummary || '',
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
    } catch (error) {
      console.error('Failed to publish saved tool:', error);
      updateToolActionStatus(toolId, {
        publishing: false,
        error: error?.message || 'Failed to publish tool.'
      });
    }
  };

  const handleSaveTool = async () => {
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }
    if (!hasSupabaseConfig) {
      setSaveStatus({
        state: 'error',
        message: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      });
      return;
    }
    if (!hasGenerated) return;

    const title = saveTitle.trim() || `Tool ${new Date().toLocaleString()}`;
    const summary = saveSummary.trim();
    setSaveStatus({ state: 'loading', message: 'Saving to Supabase…' });

    const sourcePrompt = history[0]?.prompt || prompt || null;

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

  const handleGenerate = async (event) => {
    event?.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setActiveAction('generate');
    setIsGenerating(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const modelConfig = {
        provider: selectedModelOption.provider,
        model: selectedModelOption.model
      };
      const result = await generateTool(prompt.trim(), endpoint, undefined, modelConfig);
      setToolCode(result);
      setHistory([{ type: 'initial', prompt: prompt.trim(), code: result }]);
      setIterationPrompt('');
      setSaveTitle(prompt.trim().slice(0, 60));
      setSaveSummary('');
      setSaveStatus({ state: 'idle', message: '' });
      setStatusMessage('Tool generated. Review the preview below.');
    } catch (error) {
      console.error('Generation error:', error);
      setErrorMessage(error?.message || 'Failed to generate tool.');
      setStatusMessage('');
      setToolCode({ html: '', css: '', js: '' });
      setHistory([]);
      setSaveStatus({ state: 'idle', message: '' });
    } finally {
      setActiveAction(null);
      setIsGenerating(false);
    }
  };

  const handleIterate = async (event) => {
    event?.preventDefault();
    if (!iterationPrompt.trim() || !hasGenerated || isGenerating) return;

    setActiveAction('iterate');
    setIsGenerating(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const modelConfig = {
        provider: selectedModelOption.provider,
        model: selectedModelOption.model
      };
      const updated = await generateTool(iterationPrompt.trim(), endpoint, toolCode, modelConfig);
      setToolCode(updated);
      setHistory((previous) => [
        ...previous,
        { type: 'iteration', prompt: iterationPrompt.trim(), code: updated }
      ]);
      setIterationPrompt('');
      setSaveStatus({ state: 'idle', message: '' });
      setStatusMessage('Iteration applied. Preview updated.');
    } catch (error) {
      console.error('Iteration error:', error);
      setErrorMessage(error?.message || 'Failed to apply iteration.');
      setStatusMessage('');
    } finally {
      setActiveAction(null);
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="questit-aurora" />
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-10">
        <section className="questit-glass flex flex-col gap-6 rounded-3xl border border-border/60 p-6 shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground">Workspace</p>
              <h2 className="text-lg font-semibold text-foreground">Workbench control center</h2>
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
              <div className="flex rounded-full border border-primary/20 bg-primary/10 p-1 shadow-sm">
                <Button
                  variant={activeView === 'workbench' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('workbench')}
                  aria-pressed={activeView === 'workbench'}
                  className="rounded-full px-5"
                >
                  Workbench
                </Button>
                <Button
                  variant={activeView === 'my-tools' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('my-tools')}
                  aria-pressed={activeView === 'my-tools'}
                  className="rounded-full px-5"
                >
                  My Tools
                </Button>
              </div>
              <div className="flex items-center justify-center gap-3">
                {user ? (
                  <>
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium">
                      {userLabel}
                    </Badge>
                    <Button variant="ghost" className="text-sm" onClick={handleSignOut}>
                      Sign out
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    className="gap-2 rounded-full px-5"
                    onClick={() => {
                      setAuthDialogOpen(true);
                      setAuthStatus({ state: 'idle', message: '' });
                    }}
                  >
                    Log in
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {activeView === 'workbench' ? (
          <div className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card className="border border-primary/30 shadow-lg shadow-primary/10">
            <CardHeader className="space-y-1.5">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden />
                Generate
              </CardTitle>
              <CardDescription>
                Describe the tool you want to build and send it to the Questit AI proxy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model-select">Model</Label>
                  <Select value={modelId} onValueChange={setModelId}>
                    <SelectTrigger id="model-select" className="w-full">
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
                <div className="space-y-2">
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Describe the tool you want to build…"
                    className="min-h-[140px] resize-y"
                  />
                </div>
                <Button type="submit" disabled={isGenerating} className="w-full sm:w-auto">
                  {isGenerating && activeAction === 'generate' ? 'Generating…' : 'Generate Tool'}
                </Button>
              </form>

              {statusMessage && (
                <Alert className="border border-primary/40 bg-primary/10 text-primary">
                  <AlertDescription className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
                    <span>{statusMessage}</span>
                  </AlertDescription>
                </Alert>
              )}

              {errorMessage && (
                <Alert variant="destructive" className="border-destructive/40">
                  <AlertDescription className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4" aria-hidden />
                    <span>{errorMessage}</span>
                  </AlertDescription>
                </Alert>
              )}

              {hasGenerated && (
                <div className="space-y-4">
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      <RefreshCcw className="h-4 w-4 text-primary" aria-hidden />
                      Iterate
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Give follow-up instructions to evolve the current tool. The existing HTML, CSS, and JavaScript are sent back so updates stay contextual.
                    </p>
                  </div>
                  <form onSubmit={handleIterate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="iteration">Update instructions</Label>
                      <Textarea
                        id="iteration"
                        value={iterationPrompt}
                        onChange={(event) => setIterationPrompt(event.target.value)}
                        placeholder="For example: add keyboard shortcuts and a dark theme toggle."
                        className="min-h-[120px] resize-y"
                      />
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-muted-foreground">
                        {history.length > 1
                          ? `Iterations applied: ${history.length - 1}`
                          : 'No iterations applied yet.'}
                      </p>
                      <Button type="submit" variant="secondary" disabled={isGenerating || !iterationPrompt.trim()} className="sm:w-auto">
                        {isGenerating && activeAction === 'iterate' ? 'Applying…' : 'Apply Update'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-primary/30 bg-card shadow-lg shadow-primary/10">
            <CardHeader className="space-y-2 pb-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileCode className="h-5 w-5 text-primary" aria-hidden />
                Preview
              </CardTitle>
              <div className="flex flex-col gap-3 text-left sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Palette className="h-4 w-4 text-primary" aria-hidden />
                    <span>Theme</span>
                  </div>
                  <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                    <SelectTrigger className="w-[180px]">
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ModeIndicator className="h-4 w-4 text-primary" aria-hidden />
                    <span>Mode</span>
                  </div>
                  <Select value={colorMode} onValueChange={setColorMode}>
                    <SelectTrigger className="w-[160px]">
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
                {hasGenerated ? <Badge variant="secondary" className="sm:self-center">Live</Badge> : null}
              </div>
            </div>
            <CardDescription>Rendered output from the latest AI response.</CardDescription>
            </CardHeader>
          <CardContent>
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
              {hasGenerated && (
                <div className="mt-6 space-y-3 rounded-lg border border-primary/20 bg-muted/30 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Save to Supabase</p>
                      <p className="text-xs text-muted-foreground">
                        Persist the generated code bundle to your Supabase project.
                      </p>
                    </div>
                    {user ? (
                      <Badge variant="secondary" className="w-fit">
                        {userLabel}
                      </Badge>
                    ) : (
                      <Button variant="secondary" onClick={() => { setAuthDialogOpen(true); setAuthStatus({ state: 'idle', message: '' }); }}>
                        Log in to save
                      </Button>
                    )}
                  </div>

                  {user ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="save-title">Tool name</Label>
                        <Input
                          id="save-title"
                          value={saveTitle}
                          onChange={(event) => setSaveTitle(event.target.value)}
                          placeholder="Give this tool a descriptive name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="save-summary">Public summary (optional)</Label>
                        <Textarea
                          id="save-summary"
                          value={saveSummary}
                          onChange={(event) => setSaveSummary(event.target.value)}
                          placeholder="Short description shown on shared pages (prompt stays private)"
                          className="min-h-[90px] resize-y"
                        />
                      </div>
                      {saveStatus.message && (
                        <p
                          className={`text-sm ${
                            saveStatus.state === 'error'
                              ? 'text-destructive'
                              : saveStatus.state === 'success'
                                ? 'text-emerald-500'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {saveStatus.message}
                        </p>
                      )}
                      <Button onClick={handleSaveTool} disabled={saveStatus.state === 'loading'}>
                        {saveStatus.state === 'loading' ? 'Saving…' : 'Save to Supabase'}
                      </Button>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Sign in to sync your generated tools with Supabase.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {hasGenerated && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)]">
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

            <Card className="border border-primary/20 shadow-md">
              <CardHeader className="space-y-1.5">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HistoryIcon className="h-5 w-5 text-primary" aria-hidden />
                  Session history
                </CardTitle>
                <CardDescription>Prompts sent during this workbench session.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {history.map((entry, index) => {
                  const isInitial = entry.type === 'initial';
                  const label = isInitial ? 'Initial prompt' : `Iteration ${index}`;
                  return (
                    <div
                      key={`${entry.type}-${index}`}
                      className="space-y-2 rounded-xl border border-primary/20 bg-muted/40 p-4"
                    >
                      <Badge variant={isInitial ? 'default' : 'secondary'} className="px-2 py-0.5">
                        {label}
                      </Badge>
                      <p className="text-sm leading-relaxed text-muted-foreground">{entry.prompt}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}
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
              <Alert variant="destructive" className="border-destructive/40">
                <AlertDescription className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4" aria-hidden />
                  <span>
                    Configure Supabase environment variables to view saved tools.
                  </span>
                </AlertDescription>
              </Alert>
            ) : !user ? (
              <Card className="border border-primary/20 bg-muted/40">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-lg">Sign in to view your tools</CardTitle>
                  <CardDescription>
                    Use a magic link to access the tools stored in your Supabase project.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => {
                      setAuthDialogOpen(true);
                      setAuthStatus({ state: 'idle', message: '' });
                    }}
                  >
                    Send magic link
                  </Button>
                </CardContent>
              </Card>
            ) : isLoadingMyTools ? (
              <Card className="border border-primary/20 bg-muted/40">
                <CardContent className="flex items-center gap-3 py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
                  <span className="text-sm text-muted-foreground">Loading saved tools…</span>
                </CardContent>
              </Card>
            ) : myToolsError ? (
              <Alert variant="destructive" className="border-destructive/40">
                <AlertDescription className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4" aria-hidden />
                  <span>{myToolsError}</span>
                </AlertDescription>
              </Alert>
            ) : myTools.length === 0 ? (
              <Card className="border border-dashed border-primary/30 bg-background/60">
                <CardContent className="space-y-3 py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    No saved tools yet. Generate a tool in the workbench and save it to Supabase.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {myTools.map((tool) => {
                  const createdAt = tool?.created_at ? new Date(tool.created_at) : null;
                  const isValidDate = createdAt && !Number.isNaN(createdAt.getTime());
                  const createdDateLabel = isValidDate ? createdAt.toLocaleDateString() : '—';
                  const createdDateTimeLabel = isValidDate
                    ? createdAt.toLocaleString()
                    : 'Unknown save time';
                  const status = toolActionStatus[tool.id] || {};

                  return (
                    <Card key={tool.id} className="border border-primary/20 bg-background/80">
                      <CardHeader className="space-y-2">
                        <CardTitle className="flex items-center justify-between text-lg">
                          <span>{tool.title || 'Untitled tool'}</span>
                          <Badge variant="outline" className="text-xs font-normal">
                            {createdDateLabel}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Saved {createdDateTimeLabel}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {tool.prompt ? (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Prompt
                            </p>
                            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                              {tool.prompt}
                            </p>
                          </div>
                        ) : null}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="px-2 py-0.5">
                            Theme: {tool.theme || 'default'}
                          </Badge>
                          <Badge variant="secondary" className="px-2 py-0.5">
                            Mode: {tool.color_mode || 'system'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLoadSavedTool(tool.id)}
                            disabled={Boolean(status.loading) || Boolean(status.publishing)}
                          >
                            {status.loading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                Loading…
                              </>
                            ) : (
                              <>
                                <FileCode className="h-4 w-4" aria-hidden />
                                Load in workbench
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handlePublishSavedTool(tool.id)}
                            disabled={Boolean(status.publishing) || Boolean(status.loading)}
                          >
                            {status.publishing ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                Publishing…
                              </>
                            ) : (
                              <>
                                <Share2 className="h-4 w-4" aria-hidden />
                                Publish share link
                              </>
                            )}
                          </Button>
                        </div>
                        {status.shareUrl ? (
                          <p className="flex items-center gap-1 text-xs text-emerald-600">
                            Link:{' '}
                            <a
                              href={status.shareUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
                            >
                              {status.shareUrl}
                              <ExternalLink className="h-3 w-3" aria-hidden />
                            </a>
                          </p>
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
          {/* Future: feature grid / roadmap summary can live here */}
        </div>
      </footer>
    </div>
  );
}

export default App;
