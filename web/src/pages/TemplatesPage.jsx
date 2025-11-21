import { useNavigate } from 'react-router-dom';
import SiteHeader from '@/components/layout/SiteHeader.jsx';
import { useSeoMetadata } from '@/lib/seo.js';
import { useThemeManager } from '@/lib/themeManager.js';
import { useTemplateLibrary } from '@/hooks/useTemplateLibrary.js';
import TemplatesView from '@/components/templates/TemplatesView.jsx';

export default function TemplatesPage() {
  const { colorMode, setColorMode } = useThemeManager();
  const { collections, status, error, retry } = useTemplateLibrary({ fetchRemote: true });
  useSeoMetadata({
    title: 'Questit Templates · Jumpstart your next tool',
    description: 'Browse curated Questit templates to remix or publish instantly.',
    url: typeof window !== 'undefined' ? window.location.href : 'https://questit.cc/templates'
  });

  const navigate = useNavigate();
  const isLoading = status === 'loading';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader
        colorMode={colorMode}
        onToggleColorMode={() => setColorMode((mode) => (mode === 'dark' ? 'light' : 'dark'))}
      />
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-12 space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Templates</h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            Jumpstart a new tool with ready-made prompts. Open any template in the Questit workbench to customize in seconds.
          </p>
        </header>

        {error ? (
          <p className="mb-6 text-center text-sm text-destructive">{error}</p>
        ) : null}
        <TemplatesView
          collections={collections}
          onApplyTemplate={(template) => navigate(`/build?template=${encodeURIComponent(template.id)}`)}
          isLoading={isLoading}
          errorMessage={error || ''}
          onRetry={retry}
        />
      </main>
    </div>
  );
}
