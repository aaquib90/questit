import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shell, Surface } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTemplateById } from '@/data/templates.js';
import { useSeoMetadata } from '@/lib/seo.js';
import { buildIframeHTML, DEFAULT_THEME_KEY, useThemeManager } from '@/lib/themeManager.js';

export default function TemplateDetailPage() {
  const { id = '' } = useParams();
  const template = useMemo(() => getTemplateById(id), [id]);
  const { selectedTheme, resolvedMode } = useThemeManager(DEFAULT_THEME_KEY);
  const [copyState, setCopyState] = useState('idle');

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return `https://questit.cc/templates/${encodeURIComponent(id)}`;
    const origin = window.location.origin.replace(/\/$/, '');
    return `${origin}/templates/${encodeURIComponent(id)}`;
  }, [id]);

  const iframeDoc = useMemo(() => {
    if (!template?.preview) return '';
    return buildIframeHTML(
      {
        html: template.preview.html || '',
        css: template.preview.css || '',
        js: template.preview.js || ''
      },
      selectedTheme || DEFAULT_THEME_KEY,
      resolvedMode || 'light'
    );
  }, [template, selectedTheme, resolvedMode]);

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

  if (!template) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="py-10">
          <Shell className="flex items-center justify-center">
            <Surface muted className="w-full max-w-xl space-y-4 p-8 text-center">
              <h1 className="text-xl font-semibold tracking-tight">Template not found</h1>
              <p className="text-sm text-muted-foreground">
                We couldn't find a template for “{id}”. It may have been renamed.
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
        </Shell>
      </main>
    </div>
  );
}


