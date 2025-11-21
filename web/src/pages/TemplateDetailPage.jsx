import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shell, Surface } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTemplateById } from '@/data/templates.js';
import { useSeoMetadata } from '@/lib/seo.js';
import { buildIframeHTML, DEFAULT_THEME_KEY, useThemeManager } from '@/lib/themeManager.js';
import { useTemplateLibrary } from '@/hooks/useTemplateLibrary.js';

const LOCAL_MEMORY_PREFIX = 'questit.template.memory.';

function buildTemplateMemoryBootstrap(toolId) {
  if (!toolId) return '';
  const storageKey = `${LOCAL_MEMORY_PREFIX}${toolId}`;
  return `<script>(function(){
    const TOOL_ID = ${JSON.stringify(toolId)};
    const STORAGE_KEY = ${JSON.stringify(storageKey)};
    const supportsStorage = (function(){
      try {
        const testKey = STORAGE_KEY + ':test';
        localStorage.setItem(testKey, '1');
        localStorage.removeItem(testKey);
        return true;
      } catch (error) {
        return false;
      }
    })();
    const hasParent = typeof window !== 'undefined' && window.parent && window.parent !== window;
    const safeNow = () => new Date().toISOString();
    const read = () => {
      if (!supportsStorage) return {};
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch (error) {
        return {};
      }
    };
    const toEntries = (data) => Object.entries(data).map(([memory_key, record]) => ({
      memory_key,
      memory_value: record && typeof record === 'object' && 'value' in record ? record.value : record,
      updated_at: (record && record.updated_at) || safeNow()
    }));
    const broadcast = (data) => {
      if (!hasParent) return;
      try {
        window.parent.postMessage({ type: 'questit-template-memory-sync', toolId: TOOL_ID, entries: toEntries(data) }, '*');
      } catch (error) {
        // swallow
      }
    };
    const write = (data) => {
      if (supportsStorage) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
          // ignore
        }
      }
      broadcast(data);
    };
    const api = {
      ensureSessionId: () => Promise.resolve(),
      list: async () => toEntries(read()),
      get: async (key, fallback) => {
        const data = read();
        const record = data[key];
        if (!record) return fallback;
        return typeof record === 'object' && 'value' in record ? record.value : record;
      },
      set: async (key, value) => {
        const data = read();
        data[key] = { value, updated_at: safeNow() };
        write(data);
        return { memory_key: key, memory_value: value };
      },
      remove: async (key) => {
        const data = read();
        delete data[key];
        write(data);
      },
      refresh: () => toEntries(read()),
      forTool: () => api
    };
    window.questit = window.questit || {};
    window.questit.kit = window.questit.kit || {};
    window.questit.kit.memory = api;
    window.questit.runtime = window.questit.runtime || {};
    window.questit.runtime.currentToolId = TOOL_ID;
    window.questit.runtime.memory = api;
    window.questit.runtime.memoryForTool = () => api;
    window.questit.runtime.listTools = () => [TOOL_ID];
    broadcast(read());
    window.addEventListener('message', (event) => {
      const detail = event && event.data;
      if (!detail || detail.toolId !== TOOL_ID) return;
      if (detail.type === 'questit-template-memory-clear') {
        write({});
      }
    });
  })();</script>`;
}

function readTemplateMemoryEntries(storageKey) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Object.entries(parsed).map(([memory_key, record]) => ({
      memory_key,
      memory_value: record && typeof record === 'object' && 'value' in record ? record.value : record,
      updated_at: record?.updated_at || null
    }));
  } catch (error) {
    return [];
  }
}

export default function TemplateDetailPage() {
  const { id = '' } = useParams();
  const { collections, status, error } = useTemplateLibrary({ fetchRemote: true });
  const template = useMemo(() => getTemplateById(id, collections), [id, collections]);
  const { selectedTheme, resolvedMode } = useThemeManager(DEFAULT_THEME_KEY);
  const [copyState, setCopyState] = useState('idle');
  const iframeRef = useRef(null);
  const templateSlug = template?.slug || id;
  const templateToolId = templateSlug ? `template-${templateSlug}` : null;
  const storageKey = templateToolId ? `${LOCAL_MEMORY_PREFIX}${templateToolId}` : null;
  const [memoryEntries, setMemoryEntries] = useState([]);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return `https://questit.cc/templates/${encodeURIComponent(id)}`;
    const origin = window.location.origin.replace(/\/$/, '');
    return `${origin}/templates/${encodeURIComponent(id)}`;
  }, [id]);

  const iframeDoc = useMemo(() => {
    if (!template?.preview) return '';
    const memoryScript = templateToolId ? buildTemplateMemoryBootstrap(templateToolId) : '';
    return buildIframeHTML(
      {
        html: template.preview.html || '',
        css: template.preview.css || '',
        js: template.preview.js || ''
      },
      selectedTheme || DEFAULT_THEME_KEY,
      resolvedMode || 'light',
      { bodyScripts: memoryScript }
    );
  }, [template, templateToolId, selectedTheme, resolvedMode]);

  const structuredData = useMemo(() => {
    if (!template) return null;
    const url = shareUrl;
    const keywords = Array.isArray(template.tags) ? template.tags.filter(Boolean).join(', ') : undefined;
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: `${template.title} Template`,
      headline: template.title,
      description: template.summary,
      keywords,
      url,
      isPartOf: {
        '@type': 'Collection',
        name: 'Questit Templates',
        url: (typeof window !== 'undefined' ? `${window.location.origin}` : 'https://questit.cc') + '/templates'
      }
    };
  }, [template, shareUrl]);

  const syncMemoryEntries = useCallback(() => {
    if (!storageKey) {
      setMemoryEntries([]);
      return;
    }
    setMemoryEntries(readTemplateMemoryEntries(storageKey));
  }, [storageKey]);

  useEffect(() => {
    syncMemoryEntries();
  }, [syncMemoryEntries]);

  useEffect(() => {
    if (!storageKey) return undefined;
    const handleStorage = (event) => {
      if (event.key === storageKey) {
        syncMemoryEntries();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [storageKey, syncMemoryEntries]);

  useEffect(() => {
    const handleMessage = (event) => {
      const data = event?.data;
      if (!data || data.toolId !== templateToolId) return;
      if (data.type === 'questit-template-memory-sync' && Array.isArray(data.entries)) {
        setMemoryEntries(data.entries);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [templateToolId]);

  const handleClearMemory = useCallback(() => {
    if (!storageKey) return;
    try {
      window.localStorage.removeItem(storageKey);
    } catch (error) {
      // ignore
    }
    setMemoryEntries([]);
    try {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'questit-template-memory-clear', toolId: templateToolId },
        '*'
      );
    } catch (error) {
      // ignore
    }
  }, [storageKey, templateToolId]);

  useSeoMetadata(
    template
      ? {
          title: `${template.title} Template · Questit`,
          description: template.summary,
          url: shareUrl,
          canonical: shareUrl,
          image: `/og/templates/${encodeURIComponent(id)}.svg`,
          type: 'article',
          robots: 'index,follow',
          keywords: Array.isArray(template.tags) ? template.tags.filter(Boolean).join(', ') : undefined,
          structuredData
        }
      : {
          title: 'Template not found · Questit',
          description: 'We could not find this template.',
          url: shareUrl,
          canonical: shareUrl,
          robots: 'noindex,nofollow'
        }
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2000);
    }
  };

  if (!template && status === 'loading') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="py-10">
          <Shell className="flex items-center justify-center">
            <Surface muted className="w-full max-w-xl space-y-4 p-8 text-center">
              <h1 className="text-xl font-semibold tracking-tight">Loading template…</h1>
              <p className="text-sm text-muted-foreground">Fetching the latest template bundle.</p>
            </Surface>
          </Shell>
        </main>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="py-10">
          <Shell className="flex items-center justify-center">
            <Surface muted className="w-full max-w-xl space-y-4 p-8 text-center">
              <h1 className="text-xl font-semibold tracking-tight">Template not found</h1>
              <p className="text-sm text-muted-foreground">
                {error
                  ? 'We were unable to load this template from Supabase. Showing curated samples instead.'
                  : `We couldn't find a template for “${id}”. It may have been renamed.`}
              </p>
              <div className="flex items-center justify-center gap-2">
                <Link to="/templates">
                  <Button size="sm" variant="outline">Browse templates</Button>
                </Link>
                <Link to="/build">
                  <Button size="sm">Open workbench</Button>
                </Link>
              </div>
            </Surface>
          </Shell>
        </main>
      </div>
    );
  }

  const { title, summary, audience = [], tags = [] } = template;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <Shell className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Template
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            {summary ? (
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{summary}</p>
            ) : null}
            <div className="flex flex-wrap gap-2 pt-2">
              {audience.map((label) => (
                <Badge key={label} variant="secondary" size="xs">{label}</Badge>
              ))}
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs text-foreground/80">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/build?template=${encodeURIComponent(id)}`}>
              <Button size="sm" className="gap-2">Open in Workbench</Button>
            </Link>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
              {copyState === 'copied' ? 'Link copied' : 'Copy link'}
            </Button>
          </div>
        </Shell>
      </header>

      <main className="py-10">
        <Shell className="space-y-8">
          <Surface muted className="space-y-4 p-6">
            <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-muted/40">
              {iframeDoc ? (
                <iframe
                  ref={iframeRef}
                  title={`${title} template preview`}
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
            <div className="flex flex-wrap gap-2">
              <Link to={`/build?template=${encodeURIComponent(id)}`}>
                <Button size="sm">Use this template</Button>
              </Link>
              <Link to="/templates">
                <Button size="sm" variant="outline">Browse more templates</Button>
              </Link>
            </div>
          </Surface>
          <Surface muted className="space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  Local memory
                </p>
                <p className="text-sm text-muted-foreground">
                  Data from this preview stays on this device so you can experience questit.kit.memory.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={handleClearMemory} disabled={!memoryEntries.length}>
                Clear data
              </Button>
            </div>
            {memoryEntries.length ? (
              <ul className="space-y-3 text-sm text-muted-foreground">
                {memoryEntries.map((entry) => (
                  <li
                    key={entry.memory_key}
                    className="rounded-2xl border border-border/40 bg-background/60 px-4 py-3"
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-muted-foreground">
                      <span>{entry.memory_key}</span>
                      <span>{entry.updated_at ? new Date(entry.updated_at).toLocaleString() : ''}</span>
                    </div>
                    <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-sm text-foreground">
                      {JSON.stringify(entry.memory_value, null, 2)}
                    </pre>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Interact with the template to capture data. Entries will appear here automatically.
              </p>
            )}
          </Surface>
        </Shell>
      </main>
    </div>
  );
}
