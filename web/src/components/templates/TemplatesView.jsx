import { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Surface } from '@/components/layout';
import { flattenTemplates } from '@/data/templates.js';

import TemplateCard from './TemplateCard.jsx';
import TemplatePreviewDialog from './TemplatePreviewDialog.jsx';
import TemplateCarousel from './TemplateCarousel.jsx';

const PHONE_FRIENDLY_FLAG = 'Phone-friendly';

function filterTemplates(collections, { query, category, phoneOnly }) {
  const normalizedQuery = query.trim().toLowerCase();

  return collections
    .map((collection) => {
      const filteredTemplates = collection.templates.filter((template) => {
        if (category !== 'all' && collection.id !== category) return false;
        if (phoneOnly && !(template.audience || []).includes(PHONE_FRIENDLY_FLAG)) return false;
        if (!normalizedQuery) return true;
        const haystack = [
          template.title,
          template.summary,
          ...(template.tags || []),
          ...(template.audience || [])
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      });

      return { ...collection, templates: filteredTemplates };
    })
    .filter((collection) => collection.templates.length > 0);
}

export default function TemplatesView({
  collections,
  onApplyTemplate,
  externalPreviewTemplate = null,
  onPreviewChange
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [phoneOnly, setPhoneOnly] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(externalPreviewTemplate);

  const flatTemplates = useMemo(() => flattenTemplates(collections), [collections]);
  const templateOfTheDay = flatTemplates[0];

  const filteredCollections = useMemo(
    () => filterTemplates(collections, { query, category, phoneOnly }),
    [collections, query, category, phoneOnly]
  );

  const handleApply = (template) => {
    onApplyTemplate?.(template);
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
    onPreviewChange?.(template);
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setPhoneOnly(false);
  };

  return (
    <div className="space-y-12">
      <Surface muted className="space-y-6 rounded-3xl border border-primary/30 bg-primary/5 p-8 shadow-xl shadow-primary/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">
              Templates
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Pick a starting point and make it yours
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              These templates are built for busy people who prefer to tweak rather than start from a blank page. Load any one into the workbench and adjust it using everyday language.
            </p>
          </div>
          {templateOfTheDay ? (
            <Button
              size="lg"
              shape="pill"
              className="shrink-0 px-6"
              onClick={() => handleApply(templateOfTheDay)}
            >
              Template of the day
            </Button>
          ) : null}
        </div>

        <div className="grid gap-4 rounded-2xl border border-white/20 bg-white/60 p-4 shadow-inner shadow-primary/10 backdrop-blur">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
            <Input
              placeholder="Search templates (e.g. budget, meals, stand-up)…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              shape="pill"
              variant={phoneOnly ? 'default' : 'outline'}
              className="px-4"
              onClick={() => setPhoneOnly((previous) => !previous)}
            >
              Phone-friendly only
            </Button>
            <Button
              type="button"
              size="sm"
              shape="pill"
              variant="outline"
              className="px-4"
              onClick={clearFilters}
            >
              Reset filters
            </Button>
            <span className="ml-auto text-xs text-muted-foreground" role="status" aria-live="polite">
              Showing {filteredCollections.reduce((sum, collection) => sum + collection.templates.length, 0)}{' '}
              {filteredCollections.length === 1 ? 'template' : 'templates'}
            </span>
          </div>
        </div>
      </Surface>

      <div className="space-y-10">
        {filteredCollections.map((collection) => (
          <section key={collection.id} className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">{collection.title}</h2>
              <p className="text-sm text-muted-foreground">{collection.description}</p>
            </div>
            <TemplateCarousel collection={collection} onPreview={handlePreview} onUse={handleApply} />
          </section>
        ))}
        {!filteredCollections.length ? (
          <Surface muted className="border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
            No templates match those filters yet. Try a different keyword or reset the filters.
          </Surface>
        ) : null}
      </div>

      <TemplatePreviewDialog
        open={Boolean(previewTemplate)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setPreviewTemplate(null);
            onPreviewChange?.(null);
          }
        }}
        template={previewTemplate}
      />
    </div>
  );
}
