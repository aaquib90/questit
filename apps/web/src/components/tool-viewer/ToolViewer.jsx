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
import { useSeoMetadata } from '@/lib/seo.js';

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

const DEFAULT_TOOL_SUMMARY = 'Open Questit published tools and try them instantly.';

function buildToolStructuredData(tool, url, image) {
  if (!tool) return null;
  const creatorName =
    tool.owner_name || tool.owner?.name || tool.owner?.display_name || tool.owner?.username || null;

  let resolvedImage = null;
  if (image) {
    try {
      resolvedImage = new URL(image, url).toString();
    } catch {
      resolvedImage = image;
    }
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.title,
    description: tool.summary || DEFAULT_TOOL_SUMMARY,
    applicationCategory: 'WebApplication',
    operatingSystem: 'Web',
    url,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  };

  if (resolvedImage) {
    schema.image = resolvedImage;
  }

  if (creatorName) {
    schema.publisher = { '@type': 'Person', name: creatorName };
  }
  if (tool.updated_at) {
    schema.dateModified = tool.updated_at;
  }
  if (tool.created_at) {
    schema.dateCreated = tool.created_at;
  }
  if (tool.slug) {
    schema.identifier = tool.slug;
  }

  return schema;
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
  const [authToken, setAuthToken] = useState(null);
  const [copyState, setCopyState] = useState('idle');
  const [passphraseInput, setPassphraseInput] = useState('');
  const [passphraseStatus, setPassphraseStatus] = useState({ state: 'idle', message: '' });
  const [refreshKey, setRefreshKey] = useState(0);

  const shareUrl = useMemo(() => deriveShareUrl(slug), [slug]);
  const { status: viewerStatus, data: toolData } = viewerState;
  const seoPayload = useMemo(() => {
    const fallbackHref =
      typeof window !== 'undefined'
        ? window.location.href
        : `https://questit.cc/tools/${encodeURIComponent(slug)}`;
    const href = shareUrl || fallbackHref;

    if (viewerStatus !== 'ready' || !toolData) {
      return {
        title: 'Questit Tool Viewer',
        description: DEFAULT_TOOL_SUMMARY,
        url: href,
        canonical: href,
        image: '/og-default.svg',
        robots: 'noindex,nofollow'
      };
    }

    const tool = toolData;
    const visibility = tool.visibility || 'public';
    const isPublic = visibility === 'public';
    const dynamicOg =
      tool.slug && typeof tool.slug === 'string'
        ? `/api/og/tools/${encodeURIComponent(tool.slug)}.svg`
        : null;
    const previewImage =
      tool.og_image_url ||
      tool.preview_image_url ||
      tool.cover_image ||
      dynamicOg ||
      '/og-default.svg';
    const icon =
      tool.favicon_url ||
      tool.icon ||
      tool.owner_avatar ||
      tool.owner?.avatar_url ||
      '/favicon.png';
    const keywords = Array.isArray(tool.tags) ? tool.tags.filter(Boolean).join(', ') : undefined;

    return {
      title: `${tool.title} · Questit Tool`,
      description: tool.summary || DEFAULT_TOOL_SUMMARY,
      url: href,
      canonical: href,
      image: previewImage,
      icon,
      appleIcon: icon,
      type: 'article',
      robots: isPublic ? 'index,follow' : 'noindex,nofollow',
      keywords,
      structuredData: isPublic ? buildToolStructuredData(tool, href, previewImage) : null
    };
  }, [viewerStatus, toolData, shareUrl, slug]);
  useSeoMetadata(seoPayload);

  // Attempt to fetch a Supabase access token via the auth bridge (best-effort)
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    let cancelled = false;
    let iframe;
    let timeoutId;
    const origin = window.location.origin;
    const src = `/public/auth-bridge.html?origin=${encodeURIComponent(origin)}`;
    const request = { type: 'questit-auth-request' };

    const handleMessage = (event) => {
      try {
        if (event.origin !== origin) return;
        const data = event.data;
        if (!data || data.type !== 'questit-auth-state') return;
        if (!cancelled) {
          if (typeof data.access_token === 'string' && data.access_token.trim()) {
            setAuthToken(data.access_token.trim());
          }
        }
      } catch {
        // ignore malformed events
      }
    };

    try {
      iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.setAttribute('aria-hidden', 'true');
      iframe.src = src;
      document.body.appendChild(iframe);
      window.addEventListener('message', handleMessage);
      timeoutId = window.setTimeout(() => {
        try {
          iframe?.contentWindow?.postMessage(request, origin);
        } catch {
          // ignore postMessage errors
        }
      }, 100);
    } catch {
      // ignore bridge init errors
    }

    return () => {
      cancelled = true;
      window.removeEventListener('message', handleMessage);
      if (timeoutId) window.clearTimeout(timeoutId);
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTool() {
      setViewerState({ status: 'loading', error: '', data: null, statusCode: null });

      try {
        const endpoint = `${apiBase.replace(/\/$/, '')}/tools/${encodeURIComponent(slug)}`;
        const headers = { Accept: 'application/json' };
        if (authToken) {
          headers.Authorization = `Bearer ${authToken}`;
        }
        const response = await fetch(endpoint, {
          method: 'GET',
          headers,
          credentials: authToken ? 'include' : 'same-origin',
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
  }, [apiBase, slug, refreshKey, authToken]);

  useEffect(() => {
    if (viewerState.status === 'ready') {
      setPassphraseStatus({ state: 'idle', message: '' });
      setPassphraseInput('');
    }
  }, [viewerState.status]);

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

  const submitPassphrase = async (event) => {
    event.preventDefault();
    if (!passphraseInput.trim()) {
      setPassphraseStatus({ state: 'error', message: 'Enter the passphrase to continue.' });
      return;
    }
    setPassphraseStatus({ state: 'loading', message: 'Verifying passphrase…' });
    try {
      const endpoint = `${apiBase.replace(/\/$/, '')}/tools/${encodeURIComponent(slug)}/passphrase`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ passphrase: passphraseInput.trim() })
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        let message = 'Incorrect passphrase. Try again.';
        try {
          const payload = text ? JSON.parse(text) : null;
          if (payload?.error) message = payload.error;
        } catch {
          // ignore parse error
        }
        setPassphraseStatus({ state: 'error', message });
        return;
      }
      setPassphraseStatus({ state: 'success', message: 'Passphrase accepted. Loading tool…' });
      setPassphraseInput('');
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setPassphraseStatus({
        state: 'error',
        message: error?.message || 'Failed to verify passphrase. Please try again.'
      });
    }
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

  const handleDownloadMemory = async () => {
    if (!toolId) return;
    try {
      const endpoint = `${apiBase.replace(/\/$/, '')}/tools/${encodeURIComponent(toolId)}/memory/export`;
      const headers = {};
      if (authToken) headers.Authorization = `Bearer ${authToken}`;
      const res = await fetch(endpoint, { method: 'GET', headers, credentials: 'include' });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questit-tool-${toolId}-memory.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e?.message || 'Failed to download your data.');
    }
  };

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
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={handleDownloadMemory}
                      >
                        Download
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
            isPassphraseGate ? (
              <Surface muted className="flex flex-1 flex-col items-center gap-6 px-8 py-12 text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <Key className="h-6 w-6" aria-hidden />
                </div>
                <div className="space-y-3 max-w-lg">
                  <h2 className="text-2xl font-semibold tracking-tight">Enter the passphrase to unlock this tool</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    The creator shared a code with you. Enter it below to reveal the tool, or build your own in the Questit workbench.
                  </p>
                </div>
                <form onSubmit={submitPassphrase} className="w-full max-w-sm space-y-3 text-left">
                  <label htmlFor="questit-passphrase" className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Passphrase
                  </label>
                  <input
                    id="questit-passphrase"
                    type="password"
                    autoComplete="off"
                    value={passphraseInput}
                    onChange={(event) => setPassphraseInput(event.target.value)}
                    className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter passphrase"
                  />
                  {passphraseStatus.message ? (
                    <p
                      className={`text-xs ${
                        passphraseStatus.state === 'error'
                          ? 'text-destructive'
                          : passphraseStatus.state === 'success'
                            ? 'text-emerald-500'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {passphraseStatus.message}
                    </p>
                  ) : null}
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="flex-1" disabled={passphraseStatus.state === 'loading'}>
                      {passphraseStatus.state === 'loading' ? 'Verifying…' : 'Unlock tool'}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setPassphraseInput('')}>
                      Clear
                    </Button>
                  </div>
                </form>
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
              </Surface>
            ) : (
              <Surface muted className="flex flex-1 flex-col items-center gap-5 px-8 py-12 text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <Lock className="h-6 w-6" aria-hidden />
                </div>
                <div className="space-y-3 max-w-lg">
                  <h2 className="text-2xl font-semibold tracking-tight">Only the creator can view this tool</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Sign in with the account that published this link, or spin up a fresh Questit tool shot from the workbench.
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => setRefreshKey((v) => v + 1)}
                  >
                    Retry loading
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Private links keep your experiments visible only to you.
                </p>
              </Surface>
            )
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
