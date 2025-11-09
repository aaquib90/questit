import { useEffect, useMemo, useState } from 'react';
import {
  Sparkles,
  RefreshCcw,
  AlertCircle,
  CheckCircle2,
  History as HistoryIcon,
  FileCode,
  Palette
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

const THEME_PRESETS = {
  emerald: {
    label: 'Emerald',
    overrides: {}
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
    }
  }
};

const DEFAULT_THEME_KEY = 'emerald';
const THEME_OPTIONS = Object.entries(THEME_PRESETS).map(([value, config]) => ({
  value,
  label: config.label
}));

function buildThemeCss(themeKey = DEFAULT_THEME_KEY) {
  const overrides = THEME_PRESETS[themeKey]?.overrides ?? {};
  const mergedVars = { ...BASE_THEME_VARS, ...overrides };
  const declarations = Object.entries(mergedVars)
    .map(([token, value]) => `${token}: ${value};`)
    .join('\n');
  return `
:root {
${declarations}
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

function buildIframeHTML({ html = '', css = '', js = '' }, themeKey = DEFAULT_THEME_KEY) {
  const themeCss = buildThemeCss(themeKey);
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<style>${themeCss}${css || ''}</style>
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
  const endpoint = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('endpoint') || 'https://questit.cc/api/ai/proxy';
  }, []);
  const { html: currentHtml, css: currentCss, js: currentJs } = toolCode;
  const hasGenerated = Boolean(currentHtml || currentCss || currentJs);
  const iframeDoc = useMemo(
    () => (hasGenerated ? buildIframeHTML({ html: currentHtml, css: currentCss, js: currentJs }, selectedTheme) : ''),
    [currentCss, currentHtml, currentJs, hasGenerated, selectedTheme]
  );

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(BASE_THEME_VARS).forEach(([token, value]) => {
      root.style.setProperty(token, value);
    });
    const overrides = THEME_PRESETS[selectedTheme]?.overrides ?? {};
    Object.entries(overrides).forEach(([token, value]) => {
      root.style.setProperty(token, value);
    });
  }, [selectedTheme]);

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
              <div className="flex flex-col gap-2 text-left sm:flex-row sm:items-center sm:gap-3">
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
                {hasGenerated ? <Badge variant="secondary">Live</Badge> : null}
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
