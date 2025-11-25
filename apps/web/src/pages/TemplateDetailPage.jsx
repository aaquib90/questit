import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shell, Surface } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTemplateById } from '@questit/toolkit/templates';
import { useSeoMetadata } from '@/lib/seo.js';
import { DEFAULT_THEME_KEY, useThemeManager } from '@/lib/themeManager.js';
import { useTemplateLibrary } from '@/hooks/useTemplateLibrary.js';
import { hasSupabaseConfig, supabase } from '@/lib/supabaseClient.js';
import { buildVariantTitle, resolveTemplateDescriptor } from '@/lib/templateUtils.js';
import { useToast } from '@/hooks/useToast.js';
import PreviewStage from '@/components/preview/PreviewStage.jsx';

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
  } catch {
    return [];
  }
}

export default function TemplateDetailPage() {
  const { id = '' } = useParams();
  const { collections, status } = useTemplateLibrary({ fetchRemote: true });
  const template = useMemo(() => getTemplateById(id, collections), [id, collections]);
  const [remoteTemplate, setRemoteTemplate] = useState(null);
  const [remoteStatus, setRemoteStatus] = useState('idle');
  const resolvedTemplate = template || remoteTemplate;
  const { resolvedMode } = useThemeManager(DEFAULT_THEME_KEY);
  const [copyState, setCopyState] = useState('idle');
  const iframeRef = useRef(null);
  const templateSlug = resolvedTemplate?.slug || id;
  const templateToolId = templateSlug ? `template-${templateSlug}` : null;
  const storageKey = templateToolId ? `${LOCAL_MEMORY_PREFIX}${templateToolId}` : null;
  const [memoryEntries, setMemoryEntries] = useState([]);
  const { push } = useToast();

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return `https://questit.cc/templates/${encodeURIComponent(id)}`;
    const origin = window.location.origin.replace(/\/$/, '');
    return `${origin}/templates/${encodeURIComponent(id)}`;
  }, [id]);

  useEffect(() => {
    if (template || !id || !hasSupabaseConfig) {
      setRemoteTemplate(null);
      setRemoteStatus(template ? 'success' : 'idle');
      return undefined;
    }

    let isActive = true;
    setRemoteStatus('loading');

    const mapRow = (data) => ({
      ...data,
      id: data.slug || data.id || data.template_key,
      preview: {
        html: data.preview_html || data.html || '',
        css: data.preview_css || data.css || '',
        js: data.preview_js || data.js || ''
      },
      tags: Array.isArray(data.tags) ? data.tags : [],
      audience: Array.isArray(data.audience) ? data.audience : [],
      quickTweaks: Array.isArray(data.quick_tweaks) ? data.quick_tweaks : []
    });

    const fetchBySlug = () =>
      supabase
        .from('template_library')
        .select(
          'id, slug, template_key, name, descriptor, summary, category, category_description, tags, audience, prompt, html, css, js, preview_html, preview_css, preview_js, popularity, hero_image, quick_tweaks, model_provider, model_name, status'
        )
        .eq('slug', id)
        .maybeSingle();

    const fetchByName = () => {
      const nameGuess = id.replace(/-[a-z0-9]{4,}$/i, ' ').replace(/[-_/]/g, ' ').trim();
      if (!nameGuess) {
        return Promise.resolve({ data: null, error: null });
      }
      return supabase
        .from('template_library')
        .select(
          'id, slug, template_key, name, descriptor, summary, category, category_description, tags, audience, prompt, html, css, js, preview_html, preview_css, preview_js, popularity, hero_image, quick_tweaks, model_provider, model_name, status'
        )
        .ilike('name', `${nameGuess}%`)
        .limit(1)
        .then(({ data, error }) => ({
          data: Array.isArray(data) ? data[0] || null : data,
          error
        }));
    };

    fetchBySlug()
      .then(async ({ data, error: queryError }) => {
        if (!isActive) return;
        if (!queryError && data) {
          setRemoteTemplate(mapRow(data));
          setRemoteStatus('success');
          return;
        }
        const fallback = await fetchByName();
        if (!isActive) return;
        if (fallback.data) {
          setRemoteTemplate(mapRow(fallback.data));
          setRemoteStatus('success');
        } else {
          setRemoteTemplate(null);
          setRemoteStatus('error');
        }
      })
      .catch(() => {
        if (!isActive) return;
        setRemoteTemplate(null);
        setRemoteStatus('error');
      });

    return () => {
      isActive = false;
    };
  }, [id, template]);

  const descriptor = resolveTemplateDescriptor(resolvedTemplate);
  const variantTitle = resolvedTemplate ? buildVariantTitle(resolvedTemplate) : 'Template';
  const announceTemplateApply = useCallback(() => {
    if (!resolvedTemplate) return;
    push({
      title: `${variantTitle} loading…`,
      description: 'Opening in the workbench.'
    });
  }, [push, resolvedTemplate, variantTitle]);

  const previewHtml = resolvedTemplate?.preview?.html || resolvedTemplate?.html || '';
  const previewCss = resolvedTemplate?.preview?.css || resolvedTemplate?.css || '';
  const previewJs = resolvedTemplate?.preview?.js || resolvedTemplate?.js || '';
  const hasPreview = Boolean(previewHtml || previewCss || previewJs);
  const memoryScript = useMemo(
    () => (templateToolId ? buildTemplateMemoryBootstrap(templateToolId) : ''),
    [templateToolId]
  );

  const structuredData = useMemo(() => {
    if (!resolvedTemplate) return null;
    const url = shareUrl;
    const keywords = Array.isArray(resolvedTemplate.tags)
      ? resolvedTemplate.tags.filter(Boolean).join(', ')
      : undefined;
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: `${resolvedTemplate.title} Template`,
      headline: resolvedTemplate.title,
      description: resolvedTemplate.summary,
      keywords,
      url,
      isPartOf: {
        '@type': 'Collection',
        name: 'Questit Templates',
        url: (typeof window !== 'undefined' ? `${window.location.origin}` : 'https://questit.cc') + '/templates'
      }
    };
  }, [resolvedTemplate, shareUrl]);

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
    } catch {
      // ignore
    }
    setMemoryEntries([]);
    try {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'questit-template-memory-clear', toolId: templateToolId },
        '*'
      );
    } catch {
      // ignore
    }
  }, [storageKey, templateToolId]);

  useSeoMetadata(
    resolvedTemplate
      ? {
          title: `${resolvedTemplate.title} Template · Questit`,
          description: resolvedTemplate.summary,
          url: shareUrl,
          canonical: shareUrl,
          image: `/og/templates/${encodeURIComponent(id)}.svg`,
          type: 'article',
          robots: 'index,follow',
          keywords: Array.isArray(resolvedTemplate.tags)
            ? resolvedTemplate.tags.filter(Boolean).join(', ')
            : undefined,
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

  if (!resolvedTemplate && (status === 'loading' || remoteStatus === 'loading')) {
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

  if (!resolvedTemplate) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="py-10">
          <Shell className="flex items-center justify-center">
            <Surface muted className="w-full max-w-xl space-y-4 p-8 text-center">
              <h1 className="text-xl font-semibold tracking-tight">Template not found</h1>
              <p className="text-sm text-muted-foreground">
                {status === 'error' || remoteStatus === 'error'
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

  const { summary, audience = [], tags = [] } = resolvedTemplate;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <Shell className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Template
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{variantTitle}</h1>
            {descriptor ? (
              <p className="text-sm font-medium text-primary">{descriptor}</p>
            ) : null}
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
            <Link to={`/build?template=${encodeURIComponent(id)}`} onClick={announceTemplateApply}>
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
              {hasPreview ? (
                <PreviewStage
                  html={previewHtml}
                  css={previewCss}
                  js={previewJs}
                  bodyScripts={memoryScript}
                  iframeRef={iframeRef}
                  height={620}
                  className="rounded-none border-none bg-transparent"
                  iframeTitle={`${variantTitle} template preview`}
                  title={variantTitle}
                  subtitle="Template preview"
                  statusLabel="Interactive"
                  mode={resolvedMode || 'light'}
                />
              ) : (
                <div className="flex h-[520px] items-center justify-center text-muted-foreground">
                  Preview unavailable.
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={`/build?template=${encodeURIComponent(id)}`} onClick={announceTemplateApply}>
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
