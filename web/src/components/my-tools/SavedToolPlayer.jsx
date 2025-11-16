import { useMemo } from 'react';
import { ArrowLeft, Copy, ExternalLink, Loader2, Share2 } from 'lucide-react';

import { Shell, Surface, Section } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DEFAULT_THEME_KEY, buildIframeHTML } from '@/lib/themeManager.js';
import { useToolMemory } from '@/lib/memoryClient.js';

function formatDateTime(iso) {
  if (!iso) return null;
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString();
  } catch {
    return null;
  }
}

function formatMemoryLabel(mode) {
  if (!mode || mode === 'none') return 'Off';
  if (mode === 'device') return 'This device';
  if (mode === 'account') return 'Signed-in users';
  return mode;
}

function formatRetentionLabel(retention) {
  if (retention === 'session') return 'Clears on reset';
  if (retention === 'custom') return 'Custom';
  return 'Keeps data across visits';
}

export default function SavedToolPlayer({
  tool,
  apiBase,
  status = {},
  memoryClient,
  onBack,
  onOpenInWorkbench,
  onPublish,
  onClearMemory
}) {
  const memoryMode = tool?.memory_mode || 'none';
  const memoryRetention = tool?.memory_retention || 'indefinite';
  const toolId = tool?.id || null;
  const memoryState = useToolMemory(toolId, {
    apiBase,
    enabled: Boolean(toolId && memoryMode !== 'none'),
    client: memoryClient
  });
  const memoryEntries = Array.isArray(memoryState.entries) ? memoryState.entries : [];
  const shareUrl = status.shareUrl || tool?.shareUrl || '';

  const iframeDoc = useMemo(() => {
    if (!tool) return '';
    return buildIframeHTML(
      { html: tool.html || '', css: tool.css || '', js: tool.js || '' },
      tool.theme || DEFAULT_THEME_KEY,
      tool.color_mode || 'light'
    );
  }, [tool]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <Shell className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to My Tools
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" className="gap-2" onClick={onOpenInWorkbench}>
              <Share2 className="h-4 w-4" aria-hidden />
              Open in Workbench
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onPublish}
              disabled={Boolean(status.publishing)}
            >
              {status.publishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Publishing…
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  Publish link
                </>
              )}
            </Button>
          </div>
        </Shell>
      </header>

      <main className="py-10">
        <Shell className="space-y-8">
          <Surface muted className="space-y-4 p-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <Badge size="xs" variant="outline">
                  Saved tool
                </Badge>
                {tool?.model_provider ? (
                  <Badge size="xs" variant="outline">
                    {tool.model_provider}
                  </Badge>
                ) : null}
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">{tool?.title || 'Untitled tool'}</h1>
              {tool?.public_summary ? (
                <p className="text-sm text-muted-foreground">{tool.public_summary}</p>
              ) : null}
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>Theme: {tool?.theme || 'default'}</span>
                <span>•</span>
                <span>Mode: {tool?.color_mode || 'light'}</span>
                <span>•</span>
                <span>Memory: {formatMemoryLabel(memoryMode)}</span>
                {tool?.updated_at ? (
                  <>
                    <span>•</span>
                    <span>Updated {formatDateTime(tool.updated_at)}</span>
                  </>
                ) : null}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-muted/40">
              {iframeDoc ? (
                <iframe
                  title={`Preview of ${tool?.title || 'Saved tool'}`}
                  sandbox="allow-scripts allow-same-origin"
                  srcDoc={iframeDoc}
                  className="h-[640px] w-full rounded-2xl bg-background"
                />
              ) : (
                <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
                  No tool code available.
                </div>
              )}
            </div>
          </Surface>

          <Section className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
            <Surface className="space-y-4 p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Your Data</h2>
              {memoryMode === 'none' ? (
                <p className="text-sm text-muted-foreground">
                  This tool is not storing any data. Enable memory in the workbench settings to
                  persist user inputs.
                </p>
              ) : memoryState.status === 'loading' ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Loading stored entries…
                </div>
              ) : memoryEntries.length ? (
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {memoryEntries.map((entry) => (
                    <li
                      key={entry.memory_key}
                      className="rounded-xl border border-border/40 bg-muted/40 px-4 py-3"
                    >
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        <span>{entry.memory_key}</span>
                        <span>{entry.updated_at ? formatDateTime(entry.updated_at) : ''}</span>
                      </div>
                      <pre className="mt-2 max-h-48 overflow-auto text-sm text-foreground">
                        {JSON.stringify(entry.memory_value, null, 2)}
                      </pre>
                      <div className="mt-2 flex justify-end">
                        <Button
                          size="xs"
                          variant="ghost"
                          className="text-xs"
                          onClick={() => memoryState.removeMemory(entry.memory_key)}
                        >
                          Clear entry
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Interact with the tool to see saved data here.
                </p>
              )}
              {memoryMode !== 'none' ? (
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
                        if (onClearMemory) {
                          await onClearMemory();
                          await memoryState.refresh({ silent: true });
                          return;
                        }
                        await Promise.all(
                          memoryEntries.map((entry) =>
                            memoryState.removeMemory(entry.memory_key)
                          )
                        );
                        await memoryState.refresh({ silent: true });
                      }}
                    disabled={Boolean(status.clearingMemory)}
                  >
                      {status.clearingMemory ? (
                        <>
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden />
                          Clearing…
                        </>
                      ) : (
                        'Clear all'
                      )}
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </Surface>

            <Surface className="space-y-4 p-6 text-sm text-muted-foreground">
              <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Details
              </h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.25em]">Memory</span>
                  <span className="font-medium text-foreground">{formatMemoryLabel(memoryMode)}</span>
                </div>
                {memoryMode !== 'none' ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.25em]">Retention</span>
                    <span className="font-medium text-foreground">
                      {formatRetentionLabel(memoryRetention)}
                    </span>
                  </div>
                ) : null}
                {shareUrl ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.25em]">Share URL</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 text-xs"
                      onClick={() => navigator.clipboard?.writeText?.(shareUrl)}
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden /> Copy
                    </Button>
                  </div>
                ) : null}
                <p className="text-[11px] leading-relaxed">
                  Memory is device-specific for now. For a public link, publish the tool and share the
                  viewer URL.
                </p>
              </div>
            </Surface>
          </Section>
        </Shell>
      </main>
    </div>
  );
}
