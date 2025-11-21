import { useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Surface } from '@/components/layout';
import { flattenTemplates } from '@/data/templates.js';
import { resolveApiBase } from '@/lib/api.js';
import { Loader2, Sparkles } from 'lucide-react';

import TemplateCard from './TemplateCard.jsx';
import TemplatePreviewDialog from './TemplatePreviewDialog.jsx';
import TemplateCarousel from './TemplateCarousel.jsx';

const PHONE_FRIENDLY_FLAG = 'Phone-friendly';

const DEFAULT_AI_PROXY = 'https://questit.cc/api/ai/proxy';

const slugify = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'general';

function resolveAiProxyUrl() {
  const searchParamEndpoint =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('endpoint')
      : null;
  const envEndpoint = import.meta.env.VITE_AI_PROXY_ENDPOINT;
  const candidate = searchParamEndpoint || envEndpoint || DEFAULT_AI_PROXY;
  const base = resolveApiBase(candidate);
  return `${base.replace(/\/$/, '')}/ai/proxy`;
}

async function fetchAiFilters(description, { categories, tags }) {
  const endpoint = resolveAiProxyUrl();
  const contextCategories = categories.map((category) => category.title).join(', ');
  const contextTags = tags.join(', ');
  const systemPrompt = `You are Questit's template concierge. Given a user description, map it to our known categories and tags.
Known categories: ${contextCategories || 'general'}
Known tags: ${contextTags || 'none'}
Return JSON with keys: keywords (array of 1-5 short phrases), categories (array of existing category names), tags (array of existing tags).
Only choose from the provided categories and tags. If unsure, return empty arrays.`;

  const body = {
    system: systemPrompt,
    input: description,
    provider: 'openai',
    options: {
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.2
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const message = `AI request failed (${response.status})`;
    throw new Error(message);
  }

  const result = await response.json();
  if (result?.error) {
    throw new Error(result.error?.message || 'AI response error');
  }

  const normalized = typeof result === 'string' ? JSON.parse(result) : result;
  return {
    keywords: Array.isArray(normalized.keywords) ? normalized.keywords.slice(0, 5) : [],
    categories: Array.isArray(normalized.categories) ? normalized.categories.slice(0, 5) : [],
    tags: Array.isArray(normalized.tags) ? normalized.tags.slice(0, 5) : []
  };
}

function filterTemplates(collections, { query, category, phoneOnly, aiFilters }) {
  const normalizedQuery = query.trim().toLowerCase();
  const aiKeywords = (aiFilters?.keywords || []).map((keyword) => keyword.toLowerCase());
  const aiCategories = (aiFilters?.categories || []).map((value) => slugify(value));
  const aiTags = (aiFilters?.tags || []).map((tag) => tag.toLowerCase());

  return collections
    .map((collection) => {
      const filteredTemplates = collection.templates.filter((template) => {
        if (category !== 'all' && collection.id !== category) return false;
        if (phoneOnly && !(template.audience || []).includes(PHONE_FRIENDLY_FLAG)) return false;

        const haystackFragments = [
          template.title,
          template.summary,
          template.description,
          template.prompt,
          ...(template.tags || []),
          ...(template.audience || [])
        ].filter(Boolean);
        const haystack = haystackFragments.join(' ').toLowerCase();
        const matchesQuery = normalizedQuery ? haystack.includes(normalizedQuery) : true;

        const matchesAiKeywords = aiKeywords.length
          ? aiKeywords.some((keyword) => haystack.includes(keyword))
          : true;

        const templateCategorySlug = slugify(template.category || collection.id);
        const matchesAiCategories = aiCategories.length
          ? aiCategories.some((slug) => slug === templateCategorySlug)
          : true;

        const templateTags = (template.tags || []).map((tag) => tag.toLowerCase());
        const matchesAiTags = aiTags.length
          ? aiTags.some((tag) => templateTags.includes(tag))
          : true;

        return matchesQuery && matchesAiKeywords && matchesAiCategories && matchesAiTags;
      });

      return { ...collection, templates: filteredTemplates };
    })
    .filter((collection) => collection.templates.length > 0);
}

export default function TemplatesView({
  collections = [],
  onApplyTemplate,
  externalPreviewTemplate = null,
  onPreviewChange,
  isLoading = false,
  errorMessage = ''
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [phoneOnly, setPhoneOnly] = useState(false);
  const [descriptionQuery, setDescriptionQuery] = useState('');
  const [aiFilters, setAiFilters] = useState({ keywords: [], categories: [], tags: [] });
  const [aiStatus, setAiStatus] = useState('idle');
  const [aiError, setAiError] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(externalPreviewTemplate);

  const safeCollections = Array.isArray(collections) ? collections : [];

  const flatTemplates = useMemo(() => flattenTemplates(safeCollections), [safeCollections]);
  const templateOfTheDay = flatTemplates[0];

  const availableCategories = useMemo(
    () => safeCollections.map((collection) => ({ id: collection.id, title: collection.title })),
    [safeCollections]
  );

  const availableTags = useMemo(() => {
    const tagSet = new Set();
    safeCollections.forEach((collection) => {
      (collection.templates || []).forEach((template) => {
        (template.tags || []).forEach((tag) => tagSet.add(tag));
      });
    });
    return Array.from(tagSet);
  }, [safeCollections]);

  const filteredCollections = useMemo(
    () => filterTemplates(safeCollections, { query, category, phoneOnly, aiFilters }),
    [safeCollections, query, category, phoneOnly, aiFilters]
  );
  const totalFiltered = filteredCollections.reduce(
    (sum, collection) => sum + collection.templates.length,
    0
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
    setDescriptionQuery('');
    setAiFilters({ keywords: [], categories: [], tags: [] });
    setAiStatus('idle');
    setAiError('');
  };

  const handleDescribeSearch = async () => {
    const description = descriptionQuery.trim();
    if (!description) {
      setAiFilters({ keywords: [], categories: [], tags: [] });
      setAiStatus('idle');
      setAiError('');
      return;
    }
    setAiStatus('loading');
    setAiError('');
    try {
      const result = await fetchAiFilters(description, {
        categories: availableCategories,
        tags: availableTags
      });
      setAiFilters(result);
      setAiStatus('success');
    } catch (error) {
      setAiStatus('error');
      setAiError(error?.message || 'Unable to refine search automatically.');
    }
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
                {safeCollections.map((collection) => (
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
              {isLoading ? 'Loading templates…' : `Showing ${totalFiltered} template${totalFiltered === 1 ? '' : 's'}`}
            </span>
          </div>
          <div className="space-y-3 rounded-2xl border border-border/60 bg-background/70 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                Describe what you need
              </p>
              {aiStatus === 'success' ? (
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <Sparkles className="h-3.5 w-3.5" /> Tuned suggestions
                </span>
              ) : null}
            </div>
            <Textarea
              placeholder="e.g., A client intake form with progress tracker and auto reminders"
              value={descriptionQuery}
              onChange={(event) => setDescriptionQuery(event.target.value)}
              rows={3}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={handleDescribeSearch} disabled={!descriptionQuery.trim() || aiStatus === 'loading'}>
                {aiStatus === 'loading' ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                )}
                Find templates
              </Button>
              {aiFilters.keywords.length || aiFilters.categories.length || aiFilters.tags.length ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setAiFilters({ keywords: [], categories: [], tags: [] });
                    setAiStatus('idle');
                    setAiError('');
                  }}
                >
                  Clear AI filters
                </Button>
              ) : null}
              {aiError ? (
                <span className="text-xs text-destructive">{aiError}</span>
              ) : null}
            </div>
            {(aiFilters.keywords.length || aiFilters.categories.length || aiFilters.tags.length) ? (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {aiFilters.keywords.map((keyword) => (
                  <span key={`kw-${keyword}`} className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                    {keyword}
                  </span>
                ))}
                {aiFilters.categories.map((cat) => (
                  <span key={`cat-${cat}`} className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                    {cat}
                  </span>
                ))}
                {aiFilters.tags.map((tag) => (
                  <span key={`tag-${tag}`} className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          {errorMessage ? (
            <p className="text-xs font-medium text-destructive" role="alert">
              {errorMessage}
            </p>
          ) : null}
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
            {isLoading
              ? 'Loading templates…'
              : 'No templates match those filters yet. Try a different keyword or reset the filters.'}
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
