import { useMemo, useState } from 'react';

import { Link } from 'react-router-dom';
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
  errorMessage = '',
  onRetry = null
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
  const hasActiveFilters =
    Boolean(query.trim()) ||
    category !== 'all' ||
    phoneOnly ||
    Boolean(descriptionQuery.trim()) ||
    Boolean(aiFilters.keywords.length || aiFilters.categories.length || aiFilters.tags.length);

  const curatedSections = useMemo(() => {
    if (!flatTemplates.length) return [];
    const usedIds = new Set();
    const byPopularity = [...flatTemplates].sort(
      (a, b) => (b.popularity || b.popularityScore || 0) - (a.popularity || a.popularityScore || 0)
    );
    const pick = (source, count) => {
      const results = [];
      for (const template of source) {
        if (results.length >= count) break;
        if (usedIds.has(template.id)) continue;
        usedIds.add(template.id);
        results.push(template);
      }
      return results;
    };
    const favorites = pick(byPopularity, 6);
    const trending = pick(byPopularity.filter((template) => !usedIds.has(template.id)), 6);
    const fresh = pick([...flatTemplates].reverse(), 6);
    return [
      {
        id: 'favorites',
        title: 'Community Favorites',
        subtitle: 'Most loved by Questit builders this week.',
        badge: 'Most loved',
        templates: favorites
      },
      {
        id: 'trending',
        title: 'Trending Now',
        subtitle: 'Hot templates people are remixing right now.',
        badge: 'Trending',
        templates: trending
      },
      {
        id: 'fresh',
        title: 'Fresh Drops',
        subtitle: 'New additions to the Questit library.',
        badge: 'Just added',
        templates: fresh
      }
    ].filter((section) => section.templates.length >= 3);
  }, [flatTemplates]);

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
      <Surface muted className="space-y-6 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-8 shadow-xl shadow-primary/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">
              Browse Templates ✨
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Start with a proven template and remix it in seconds
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Describe what you need or pick a community favorite. Questit templates already include UI, logic, and memory helpers so you can focus on tweaks instead of blank canvases.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>🔁 Remix-friendly</span>
              <span>🧠 Memory-ready</span>
              <span>⚡ Instant preview</span>
            </div>
          </div>
          {templateOfTheDay ? (
            <Surface className="rounded-2xl border border-white/30 bg-white/70 p-4 text-sm text-foreground shadow-lg backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Template of the day
              </p>
              <p className="mt-2 text-lg font-semibold">{templateOfTheDay.title}</p>
              <p className="text-xs text-muted-foreground">{templateOfTheDay.summary}</p>
              <Button size="sm" className="mt-4 w-full" onClick={() => handleApply(templateOfTheDay)}>
                Load into workbench
              </Button>
            </Surface>
          ) : null}
        </div>

        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/70 p-4 shadow-inner shadow-primary/10 backdrop-blur">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
            <Input
              placeholder="Search templates (e.g. budget, stand-up, subscriber hub)…"
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
              {isLoading
                ? 'Loading templates…'
                : totalFiltered === 0
                  ? 'No templates match yet'
                  : `Showing ${totalFiltered} template${totalFiltered === 1 ? '' : 's'}`}
            </span>
          </div>
          <div className="space-y-3 rounded-2xl border border-border/60 bg-background/80 p-4">
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
              placeholder="e.g., A recipe planner that balances macros and tracks leftovers"
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
            <div className="flex items-center gap-3 text-xs">
              <p className="font-medium text-destructive" role="alert">
                {errorMessage}
              </p>
              {typeof onRetry === 'function' ? (
                <Button size="sm" variant="outline" onClick={onRetry}>
                  Try again
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </Surface>

      <div className="sticky top-16 z-20 bg-background/80 py-2 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto pb-1 text-sm">
          {[
            { id: 'all', title: 'All Tools', emoji: '✨' },
            ...availableCategories.slice(0, 8).map((cat) => ({
              id: cat.id,
              title: cat.title,
              emoji: '🧩'
            }))
          ].map((pill) => (
            <Button
              key={pill.id}
              size="sm"
              variant={category === pill.id ? 'default' : 'outline'}
              className="rounded-full px-3"
              onClick={() => setCategory(pill.id)}
            >
              <span className="mr-2">{pill.emoji}</span>
              {pill.title}
            </Button>
          ))}
        </div>
      </div>

      {!hasActiveFilters && curatedSections.length
        ? curatedSections.map((section) => (
            <section key={section.id} className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    {section.badge}
                  </p>
                  <h2 className="text-2xl font-semibold text-foreground">{section.title}</h2>
                  <p className="text-sm text-muted-foreground">{section.subtitle}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={{ ...template, collectionTitle: template.collectionTitle || section.title }}
                    highlightBadge={section.badge}
                    onPreview={handlePreview}
                    onUse={handleApply}
                  />
                ))}
              </div>
            </section>
          ))
        : null}

      <Surface muted className="rounded-3xl border border-border/60 bg-muted/40 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { title: 'Pick', description: 'Browse templates or search by vibe.', emoji: '🧠' },
            { title: 'Remix', description: 'Load into the workbench and tweak the prompt.', emoji: '⚡' },
            { title: 'Preview', description: 'See it running instantly with local memory.', emoji: '👀' },
            { title: 'Ship', description: 'Publish a share link or embed in your flow.', emoji: '🚀' }
          ].map((step) => (
            <Surface key={step.title} className="space-y-1 rounded-2xl border border-border/50 bg-background/70 p-4 text-sm">
              <p className="text-xl">{step.emoji}</p>
              <p className="text-base font-semibold">{step.title}</p>
              <p className="text-muted-foreground">{step.description}</p>
            </Surface>
          ))}
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

      <Surface muted className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Let’s make something sick 🚀</p>
        <h2 className="mt-3 text-3xl font-semibold text-foreground">Thousands of people are already building with Questit</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
          Remix a template, wire it into your workflow, and publish a share link in minutes. No engineering sprint required.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" className="px-8" asChild>
            <Link to="/build">Open the workbench</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/templates">Browse more templates</Link>
          </Button>
        </div>
      </Surface>

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
