import { useEffect, useMemo, useState } from 'react';

import { TEMPLATE_COLLECTIONS } from '@/data/templates.js';
import { hasSupabaseConfig, supabase } from '@/lib/supabaseClient.js';

const FALLBACK_COLLECTIONS = TEMPLATE_COLLECTIONS;

const CATEGORY_SLUG = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'general';

function normaliseRow(row) {
  if (!row) return null;
  const categoryTitle = row.category || 'General';
  return {
    raw: row,
    categoryId: CATEGORY_SLUG(categoryTitle),
    categoryTitle,
    categoryDescription: row.category_description || '',
    template: {
      id: row.slug || row.id || row.template_key,
      slug: row.slug || row.id || row.template_key,
      title: row.name || 'Untitled Template',
      descriptor: row.descriptor || null,
      summary: row.summary || row.description || '',
      prompt: row.prompt || '',
      html: row.html || '',
      css: row.css || '',
      js: row.js || '',
      preview: {
        html: row.preview_html || row.html || '',
        css: row.preview_css || row.css || '',
        js: row.preview_js || row.js || ''
      },
      audience: Array.isArray(row.audience) ? row.audience : [],
      tags: Array.isArray(row.tags) ? row.tags : [],
      heroImage: row.hero_image || null,
      popularity: typeof row.popularity === 'number' ? row.popularity : 0,
      quickTweaks: Array.isArray(row.quick_tweaks) ? row.quick_tweaks : [],
      modelProvider: row.model_provider || null,
      modelName: row.model_name || null
    }
  };
}

function mapRowsToCollections(rows = []) {
  if (!rows.length) return FALLBACK_COLLECTIONS;
  const byCategory = new Map();

  rows.forEach((rawRow) => {
    const normalised = normaliseRow(rawRow);
    if (!normalised) return;
    const existing = byCategory.get(normalised.categoryId);
    if (!existing) {
      byCategory.set(normalised.categoryId, {
        id: normalised.categoryId,
        title: normalised.categoryTitle,
        description: normalised.categoryDescription,
        templates: [normalised.template]
      });
    } else {
      existing.templates.push(normalised.template);
    }
  });

  return Array.from(byCategory.values())
    .map((collection) => ({
      ...collection,
      templates: collection.templates.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    }))
    .sort((a, b) => (b.templates.length || 0) - (a.templates.length || 0));
}

export function useTemplateLibrary({ fetchRemote = true } = {}) {
  const [collections, setCollections] = useState(FALLBACK_COLLECTIONS);
  const [status, setStatus] = useState(fetchRemote && hasSupabaseConfig ? 'loading' : 'idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!fetchRemote || !hasSupabaseConfig) {
      setStatus('idle');
      return undefined;
    }

    let isMounted = true;
    setStatus('loading');
    setError('');

    supabase
      .from('template_library')
      .select(
        'id, slug, template_key, name, descriptor, summary, category, category_description, tags, audience, prompt, html, css, js, preview_html, preview_css, preview_js, popularity, hero_image, quick_tweaks, model_provider, model_name, status'
      )
      .eq('status', 'published')
      .order('popularity', { ascending: false })
      .then(({ data, error: queryError }) => {
        if (!isMounted) return;
        if (queryError) {
          console.warn('Failed to fetch templates from Supabase:', queryError.message);
          setStatus('error');
          setError('Unable to load live templates. Showing a curated sample instead.');
          setCollections(FALLBACK_COLLECTIONS);
          return;
        }
        const mapped = mapRowsToCollections(Array.isArray(data) ? data : []);
        setCollections(mapped.length ? mapped : FALLBACK_COLLECTIONS);
        setStatus('success');
      })
      .catch((unexpectedError) => {
        if (!isMounted) return;
        console.warn('Unexpected template fetch error:', unexpectedError);
        setStatus('error');
        setError('Unable to load live templates. Showing a curated sample instead.');
        setCollections(FALLBACK_COLLECTIONS);
      });

    return () => {
      isMounted = false;
    };
  }, [fetchRemote]);

  const flattened = useMemo(() => collections ?? FALLBACK_COLLECTIONS, [collections]);

  return {
    collections: flattened,
    status,
    error
  };
}
