import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteHeader from '@/components/layout/SiteHeader.jsx';
import TemplateCard from '@/components/templates/TemplateCard.jsx';
import TemplatePreviewDialog from '@/components/templates/TemplatePreviewDialog.jsx';
import { TEMPLATE_COLLECTIONS } from '@/data/templates.js';
import { useSeoMetadata } from '@/lib/seo.js';

function flattenTemplates() {
  const templates = [];
  for (const collection of TEMPLATE_COLLECTIONS) {
    templates.push(...collection.templates.map((template) => ({ ...template, collectionTitle: collection.title })));
  }
  return templates;
}

export default function TemplatesPage() {
  useSeoMetadata({
    title: 'Questit Templates · Jumpstart your next tool',
    description: 'Browse curated Questit templates to remix or publish instantly.',
    url: typeof window !== 'undefined' ? window.location.href : 'https://questit.cc/templates'
  });

  const navigate = useNavigate();
  const templates = useMemo(() => flattenTemplates(), []);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-12 space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Templates</h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            Jumpstart a new tool with ready-made prompts. Open any template in the Questit workbench to customize in seconds.
          </p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={() => setPreviewTemplate(template)}
              onUse={() => navigate(`/build?template=${encodeURIComponent(template.id)}`)}
            />
          ))}
        </div>
      </main>

      <TemplatePreviewDialog
        template={previewTemplate}
        open={Boolean(previewTemplate)}
        onOpenChange={(open) => {
          if (!open) setPreviewTemplate(null);
        }}
      />
    </div>
  );
}
