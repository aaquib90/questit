import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Eye,
  Key,
  Loader2,
  Lock,
  LogIn,
  Share2,
  Sparkles
} from 'lucide-react';

import BrandLogo from '@/components/layout/BrandLogo.jsx';
import { Section, Shell, Surface } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DEFAULT_THEME_KEY, buildIframeHTML } from '@/lib/themeManager.js';
import { useToolMemory } from '@/lib/memoryClient.js';
import { cn } from '@/lib/utils.js';

function deriveShareUrl(slug) {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin.replace(/\/$/, '');
  const encodedSlug = encodeURIComponent(slug);
  return `${origin}/tools/${encodedSlug}`;
}

function formatDateTime(iso) {
  if (!iso) return null;
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    const datePart = date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timePart = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return `${datePart} · ${timePart}`;
  } catch {
    return null;
  }
}

function formatMemoryMode(mode) {
  if (mode === 'device') return 'Device only';
  if (mode === 'account') return 'Signed-in users';
  return 'Off';
}

function formatRetention(retention) {
  if (retention === 'session') return 'Clears when reset';
  if (retention === 'custom') return 'Custom';
  return 'Keeps data across visits';
}

function StateMessage({ title, description }) {
  return (
    <Section className="flex justify-center">
      <Surface muted className="flex w-full max-w-xl flex-col items-center gap-4 px-8 py-14 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" aria-hidden />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
          {description ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => (window.location.href = '/')}>
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
            Back to Questit
          </Button>
        </div>
      </Surface>
    </Section>
  );
}

export default function ToolViewer({ slug, apiBase }) {
  const [viewerState, setViewerState] = useState({
    status: 'loading',
    error: '',
    data: null,
    statusCode: null
  });
  const [copyState, setCopyState] = useState('idle');

  const shareUrl = useMemo(() => deriveShareUrl(slug), [slug]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTool() {
      setViewerState({ status: 'loading', error: '', data: null, statusCode: null });

      try {
        const endpoint = `${apiBase.replace(/\/$/, '')}/tools/${encodeURIComponent(slug)}`;
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: controller.signal
        });

        if (response.status === 404) {
          setViewerState({
            status: 'not-found',
            error: 'We could not find a published tool for this link.',
            data: null,
            statusCode: 404
          });
          return;
        }

        if (response.status === 403) {
          let message = 'This tool is restricted.';
          try {
            const payload = await response.json();
            if (payload?.error) {
              message = payload.error;
            }
          } catch {
            // ignore JSON parse failure
          }
          setViewerState({
            status: 'forbidden',
            error: message,
            data: null,
            statusCode: 403
          });
          return;
        }

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Failed to load tool (status ${response.status})`);
        }

        const payload = await response.json();
        setViewerState({
          status: 'ready',
          error: '',
          data: payload,
          statusCode: response.status
        });

        if (payload?.title && typeof document !== 'undefined') {
          document.title = `${payload.title} · Questit`;
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        setViewerState({
          status: 'error',
          error: error?.message || 'Failed to load this tool.',
          data: null,
          statusCode: null
        });
      }
    }

    loadTool();
    return () => controller.abort();
  }, [apiBase, slug]);

  const iframeDoc = useMemo(() => {
    if (!viewerState.data) return '';
    return buildIframeHTML(
      {
        html: viewerState.data.html || '',
        css: viewerState.data.css || '',
        js: viewerState.data.js || ''
      },
      viewerState.data.theme || DEFAULT_THEME_KEY,
      viewerState.data.color_mode || 'light'
    );
  }, [viewerState.data]);

  const viewCountLabel = useMemo(() => {
    if (!viewerState.data) return '0';
    try {
      return new Intl.NumberFormat('en-US').format(Number(viewerState.data.view_count || 0));
    } catch {
      return String(viewerState.data.view_count || 0);
    }
  }, [viewerState.data]);

  const updatedLabel = useMemo(
    () => formatDateTime(viewerState.data?.updated_at),
    [viewerState.data?.updated_at]
  );

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2400);
    } catch {
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2400);
    }
  };

  const handleRemix = () => {
    const remixUrl = `/?remix=${encodeURIComponent(slug)}`;
    window.location.href = remixUrl;
  };

  const handleNavigateHome = () => {
    window.location.href = '/';
  };

  const handleSignInRedirect = () => {
    window.location.href = '/?login=1';
  };

  const { status, error, data } = viewerState;
  const toolId = data?.tool_id || null;
  const memoryMode = data?.memory_mode || 'none';
  const memoryRetention = data?.memory_retention || 'indefinite';
  const showMemoryPanel = status === 'ready' && Boolean(toolId) && memoryMode !== 'none';
  const memoryState = useToolMemory(toolId, {
    apiBase,
    enabled: showMemoryPanel
  });
  const memoryEntries = showMemoryPanel && Array.isArray(memoryState.entries) ? memoryState.entries : [];
  const isForbidden = status === 'forbidden';
  const forbiddenMessage = error || '';
  const isPassphraseGate = isForbidden && /passphrase/i.test(forbiddenMessage);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <Shell className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleNavigateHome}
              className="inline-flex items-center gap-3 rounded-full border border-border/50 bg-background/70 px-4 py-2 text-sm font-semibold transition hover:border-primary/40 hover:text-primary"
            >
              <BrandLogo className="h-6 w-auto" aria-hidden />
              <span className="hidden text-xs uppercase tracking-[0.3em] text-muted-foreground sm:inline">
                Tool Viewer
              </span>
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-xs font-semibold"
              onClick={handleNavigateHome}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to workbench
            </Button>
            {status === 'ready' ? (
              <Button size="sm" className="gap-2" onClick={handleRemix}>
                <Share2 className="h-4 w-4" aria-hidden />
                Open in Workbench
              </Button>
            ) : null}
          </div>
        </Shell>
      </header>

      <main className="py-10">
        <Shell className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr),320px]">
          {status === 'ready' && data ? (
            <>
              <div className="space-y-6">
                <Surface muted className="space-y-4 p-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge size="xs" className="uppercase tracking-[0.25em]">
                        Live Tool
                      </Badge>
                      <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" aria-hidden />
                        {viewCountLabel} views
                      </div>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight">{data.title}</h1>
                    {data.summary ? (
                      <p className="text-sm leading-relaxed text-muted-foreground">{data.summary}</p>
                    ) : null}
                    {updatedLabel ? (
                      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                        Updated {updatedLabel}
                      </p>
                    ) : null}
                    {Array.isArray(data.tags) && data.tags.length ? (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {data.tags.map((tag) => (
                          <Badge key={tag} variant="outline" size="xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-muted/40">
                    {iframeDoc ? (
                      <iframe
                        title={`Preview of ${data.title}`}
                        sandbox="allow-scripts allow-same-origin allow-forms"
                        srcDoc={iframeDoc}
                        className="h-[620px] w-full rounded-2xl bg-background"
                      />
                    ) : (
                      <div className="flex h-[520px] items-center justify-center text-muted-foreground">
                        Preview unavailable.
                      </div>
                    )}
                  </div>
                </Surface>
              </div>

              <aside className="space-y-6">
                <Surface className="space-y-5 p-5">
                  <div className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      Share
                    </h2>
                    <div className="flex flex-col gap-2">
                      <div className="rounded-2xl border border-border/40 bg-muted/40 px-4 py-3 text-sm">
                        <p className="truncate font-medium text-foreground">{shareUrl}</p>
                        <p className="text-xs text-muted-foreground">Copy this link to share the tool.</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={handleCopyShareLink}
                        >
                          {copyState === 'copied' ? (
                            <Check className="h-4 w-4 text-emerald-500" aria-hidden />
                          ) : (
                            <Copy className="h-4 w-4" aria-hidden />
                          )}
                          {copyState === 'copied' ? 'Link copied' : 'Copy link'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => window.open(shareUrl, '_blank', 'noopener,noreferrer')}
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden />
                          Open
                        </Button>
                      </div>
                      {copyState === 'error' ? (
                        <p className="text-xs text-destructive">Unable to copy link. Try manually.</p>
                      ) : null}
                    </div>
                  </div>
                </Surface>

                {showMemoryPanel ? (
                  <Surface className="space-y-4 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                          Your Data
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {memoryMode === 'device'
                            ? 'Stored on this device until you clear it.'
                            : 'Synced for signed-in viewers.'}
                        </p>
                      </div>
                      <Badge size="xs" variant="outline">
                        Beta
                      </Badge>
                    </div>
                    {memoryState.status === 'loading' ? (
                      <p className="text-xs text-muted-foreground">Loading saved entries…</p>
                    ) : memoryEntries.length ? (
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {memoryEntries.map((entry) => (
                          <li
                            key={entry.memory_key}
                            className="rounded-lg border border-border/40 bg-muted/40 px-3 py-2 text-left"
                          >
                            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                              {entry.memory_key}
                            </span>
                            <pre className="mt-2 max-h-36 overflow-auto text-sm text-foreground">
                              {JSON.stringify(entry.memory_value, null, 2)}
                            </pre>
                            <div className="mt-2 flex justify-end">
                              <Button
                                size="xs"
                                variant="ghost"
                                className="text-xs"
                                onClick={() => memoryState.removeMemory(entry.memory_key)}
                              >
                                Clear
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        This tool hasn&apos;t stored anything yet. Interact with it to save progress.
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => memoryState.refresh({ silent: true })}
                      >
                        Refresh
                      </Button>
                      {memoryEntries.length ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs"
                          onClick={async () => {
                            await Promise.all(
                              memoryEntries.map((entry) =>
                                memoryState.removeMemory(entry.memory_key)
                              )
                            );
                            await memoryState.refresh({ silent: true });
                          }}
                        >
                          Clear all
                        </Button>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {formatRetention(memoryRetention)}
                    </p>
                  </Surface>
                ) : null}

                <Surface className="space-y-4 p-5 text-sm">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Details
                  </h2>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center justify-between gap-4">
                      <span className="text-xs uppercase tracking-[0.25em]">Slug</span>
                      <span className="text-right font-medium text-foreground">{data.slug}</span>
                    </li>
                    <li className="flex items-center justify-between gap-4">
                      <span className="text-xs uppercase tracking-[0.25em]">Visibility</span>
                      <span className="text-right font-medium text-foreground capitalize">
                        {data.visibility}
                      </span>
                    </li>
                    {memoryMode !== 'none' ? (
                      <>
                        <li className="flex items-center justify-between gap-4">
                          <span className="text-xs uppercase tracking-[0.25em]">Memory</span>
                          <span className="text-right font-medium text-foreground">
                            {formatMemoryMode(memoryMode)}
                          </span>
                        </li>
                        <li className="flex items-center justify-between gap-4">
                          <span className="text-xs uppercase tracking-[0.25em]">Retention</span>
                          <span className="text-right font-medium text-foreground">
                            {formatRetention(memoryRetention)}
                          </span>
                        </li>
                      </>
                    ) : null}
                    {data.model_provider || data.model_name ? (
                      <li className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-[0.25em]">Model</span>
                        <span className="font-medium text-foreground">
                          {[data.model_provider, data.model_name].filter(Boolean).join(' · ')}
                        </span>
                      </li>
                    ) : null}
                    {data.created_at ? (
                      <li className="flex flex-col gap-1">
                        <span className="text-xs uppercase tracking-[0.25em]">Created</span>
                        <span className="font-medium text-foreground">
                          {formatDateTime(data.created_at) || data.created_at}
                        </span>
                      </li>
                    ) : null}
                  </ul>
                </Surface>
              </aside>
            </>
          ) : status === 'loading' ? (
            <Surface muted className="flex min-h-[420px] flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
                <p className="text-sm text-muted-foreground">Loading published tool…</p>
              </div>
            </Surface>
          ) : isForbidden ? (
            <Surface muted className="flex flex-1 flex-col items-center gap-5 px-8 py-12 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/12 text-primary">
                {isPassphraseGate ? <Key className="h-6 w-6" aria-hidden /> : <Lock className="h-6 w-6" aria-hidden />}
              </div>
              <div className="space-y-3 max-w-lg">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {isPassphraseGate
                    ? 'This tool is shared with a passphrase'
                    : 'Only the creator can view this tool'}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {isPassphraseGate
                    ? 'Ask the creator for the passphrase they shared with you, or start building your own Questit tool in minutes.'
                    : 'You need to be the creator to open this link. Sign in to see your private tools or spin up a fresh idea of your own.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button size="sm" className="gap-2" onClick={handleNavigateHome}>
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Build your own tool
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleSignInRedirect}>
                  <LogIn className="h-4 w-4" aria-hidden />
                  Sign in to Questit
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {isPassphraseGate
                  ? 'Tip: Passphrase sharing is great for classrooms, clients, or friends.'
                  : 'Private links keep your experiments visible only to you.'}
              </p>
            </Surface>
          ) : status === 'not-found' ? (
            <StateMessage
              icon={AlertCircle}
              title="Tool not found"
              description={error || 'The published tool could not be located.'}
            />
          ) : (
            <StateMessage
              icon={AlertCircle}
              title="Something went wrong"
              description={error || 'An unexpected error occurred while loading this tool.'}
            />
          )}
        </Shell>
      </main>

      <footer className="border-t border-border/20 bg-background/70 py-6 text-sm text-muted-foreground">
        <Shell className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Questit. Build and share your own tools.</span>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => window.open('https://questit.cc', '_blank', 'noopener,noreferrer')}
              className={cn(
                'text-xs uppercase tracking-[0.25em] transition hover:text-primary focus:outline-none'
              )}
            >
              questit.cc
            </button>
            <button
              type="button"
              className="text-xs uppercase tracking-[0.25em] text-muted-foreground transition hover:text-primary focus:outline-none"
              onClick={() => window.open('https://questit.cc/privacy', '_blank', 'noopener,noreferrer')}
            >
              Privacy
            </button>
            <button
              type="button"
              className="text-xs uppercase tracking-[0.25em] text-muted-foreground transition hover:text-primary focus:outline-none"
              onClick={() => window.open('https://questit.cc/terms', '_blank', 'noopener,noreferrer')}
            >
              Terms
            </button>
          </div>
        </Shell>
      </footer>
    </div>
  );
}
