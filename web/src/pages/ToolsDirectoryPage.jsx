import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '@/components/layout/SiteHeader.jsx';
import { Surface } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { hasSupabaseConfig, supabase } from '@/lib/supabaseClient';
import { useSeoMetadata } from '@/lib/seo.js';
import { useThemeManager } from '@/lib/themeManager.js';
import ToolPreviewDialog from '@/components/tool-viewer/ToolPreviewDialog.jsx';

const FALLBACK_TOOLS = [
  {
    slug: 'mood-journal-demo',
    title: 'Mood Journal',
    summary: 'Track how you feel each day with friendly emoji prompts.',
    view_count: 1240
  },
  {
    slug: 'recipe-scaler-demo',
    title: 'Recipe Scaler',
    summary: 'Resize any recipe for the servings you actually need.',
    view_count: 980
  },
  {
    slug: 'quick-timer-demo',
    title: 'Quick Timer',
    summary: 'One-tap countdown timer with 5, 10, 15, and 30 minute presets.',
    view_count: 612
  }
];

export default function ToolsDirectoryPage() {
  const { colorMode, setColorMode } = useThemeManager();
  useSeoMetadata({
    title: 'Questit Tools · Explore published creations',
    description: 'Discover community-built Questit tools and launch them instantly.',
    url: typeof window !== 'undefined' ? window.location.href : 'https://questit.cc/tools'
  });

  const [tools, setTools] = useState(FALLBACK_TOOLS);
  const [loading, setLoading] = useState(hasSupabaseConfig);
  const [preview, setPreview] = useState({ open: false, slug: '', title: '', summary: '' });

  useEffect(() => {
    if (!hasSupabaseConfig) return;

    let cancelled = false;
    setLoading(true);

    supabase
      .from('published_tools')
      .select('slug,title,summary,view_count,updated_at,owner_id,tags')
      .eq('visibility', 'public')
      .order('view_count', { ascending: false })
      .limit(30)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !Array.isArray(data) || data.length === 0) {
          setTools(FALLBACK_TOOLS);
          setLoading(false);
          return;
        }
        const mapped = data.map((tool) => ({
          slug: tool.slug,
          title: tool.title || 'Questit Tool',
          summary: tool.summary || tool.public_summary || 'Open to explore this Questit tool.',
          view_count: Number(tool.view_count || 0),
          updated_at: tool.updated_at,
          tags: Array.isArray(tool.tags) ? tool.tags.filter(Boolean) : []
        }));
        setTools(mapped);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setTools(FALLBACK_TOOLS);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const headline = useMemo(() => {
    if (loading) return 'Loading public tools…';
    if (tools.length === 0) return 'No public tools yet';
    return 'Featured public tools';
  }, [loading, tools.length]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader
        colorMode={colorMode}
        onToggleColorMode={() => setColorMode((mode) => (mode === 'dark' ? 'light' : 'dark'))}
      />
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-12 space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Questit Tools</h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            Explore what the community is building with Questit. Remix any tool in the workbench.
          </p>
        </header>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">{headline}</h2>
            <Button variant="outline" asChild>
              <Link to="/build">Create your own</Link>
            </Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Surface
                key={tool.slug}
                muted
                className="flex h-full flex-col justify-between rounded-2xl border border-border/40 bg-background/80 p-6 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{tool.tags?.[0] || 'Questit tool'}</span>
                    {tool.view_count ? <span>{tool.view_count.toLocaleString()} views</span> : null}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{tool.title}</h3>
                  <p className="text-sm text-muted-foreground">{tool.summary}</p>
                </div>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    shape="pill"
                    className="w-full px-5 sm:w-auto"
                    onClick={() =>
                      setPreview({
                        open: true,
                        slug: tool.slug,
                        title: tool.title,
                        summary: tool.summary
                      })
                    }
                  >
                    See how it looks
                  </Button>
                  <Button asChild size="sm">
                    <Link to={`/build?remix=${encodeURIComponent(tool.slug)}`}>Remix in Workbench</Link>
                  </Button>
                </div>
              </Surface>
            ))}
          </div>
        </section>
      </main>
      <ToolPreviewDialog
        open={preview.open}
        onOpenChange={(open) => setPreview((prev) => ({ ...prev, open }))}
        slug={preview.slug}
        title={preview.title}
        summary={preview.summary}
      />
    </div>
  );
}
