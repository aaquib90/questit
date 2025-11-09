import { useEffect, useMemo, useState } from 'react';
import {
  Sparkles,
  RefreshCcw,
  AlertCircle,
  CheckCircle2,
  History as HistoryIcon,
  FileCode,
  Palette,
  Moon,
  Sun,
  Monitor
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

import { generateTool } from './generateTool.js';

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
  const endpoint = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('endpoint') || 'https://questit.cc/api/ai/proxy';
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

  const handleGenerate = async (event) => {
    event?.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setActiveAction('generate');
    setIsGenerating(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const result = await generateTool(prompt.trim(), endpoint);
      setToolCode(result);
      setHistory([{ type: 'initial', prompt: prompt.trim(), code: result }]);
      setIterationPrompt('');
      setStatusMessage('Tool generated. Review the preview below.');
    } catch (error) {
      console.error('Generation error:', error);
      setErrorMessage(error?.message || 'Failed to generate tool.');
      setStatusMessage('');
      setToolCode({ html: '', css: '', js: '' });
      setHistory([]);
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
      const updated = await generateTool(iterationPrompt.trim(), endpoint, toolCode);
      setToolCode(updated);
      setHistory((previous) => [
        ...previous,
        { type: 'iteration', prompt: iterationPrompt.trim(), code: updated }
      ]);
      setIterationPrompt('');
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
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto max-w-6xl space-y-8 py-10">
        <header className="space-y-4 text-center md:text-left">
          <Badge variant="secondary" className="mx-auto w-fit rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide md:mx-0">
            Questit Workbench
          </Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Build micro-tools from natural language
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground md:mx-0">
              Provide a prompt to generate a self-contained HTML/CSS/JS bundle, then iterate with follow-up instructions. Everything runs on the Questit edge stack.
            </p>
          </div>
        </header>

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
    </div>
  );
}

export default App;
