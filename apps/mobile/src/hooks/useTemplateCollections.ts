import { useQuery } from '@tanstack/react-query';
import {
  TEMPLATE_COLLECTIONS,
  mapRowsToCollections
} from '@questit/toolkit/templates';
import type { TemplateCollection } from '@questit/toolkit/templates';
import { getSupabaseClient, hasSupabaseConfig } from '../lib/supabase';

const TEMPLATE_SELECT =
  'id, slug, template_key, name, descriptor, summary, category, category_description, tags, audience, prompt, html, css, js, preview_html, preview_css, preview_js, popularity, hero_image, quick_tweaks, model_provider, model_name, status';

export interface TemplateCollectionsResult {
  collections: TemplateCollection[];
  source: 'remote' | 'fallback';
  error?: string;
}

async function fetchTemplateCollections(): Promise<TemplateCollectionsResult> {
  if (!hasSupabaseConfig) {
    return {
      collections: TEMPLATE_COLLECTIONS,
      source: 'fallback'
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      collections: TEMPLATE_COLLECTIONS,
      source: 'fallback',
      error: 'Supabase client not initialised'
    };
  }

  const { data, error } = await supabase
    .from('template_library')
    .select(TEMPLATE_SELECT)
    .eq('status', 'published')
    .order('popularity', { ascending: false });

  if (error) {
    return {
      collections: TEMPLATE_COLLECTIONS,
      source: 'fallback',
      error: error.message
    };
  }

  return {
    collections: mapRowsToCollections(
      Array.isArray(data) ? data : [],
      TEMPLATE_COLLECTIONS
    ),
    source: 'remote'
  };
}

export function useTemplateCollections() {
  return useQuery({
    queryKey: ['template-collections'],
    queryFn: fetchTemplateCollections,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30
  });
}
