import { useEffect, useMemo, useState } from 'react';

import { TEMPLATE_COLLECTIONS, mapRowsToCollections } from '@questit/toolkit/templates';
import { hasSupabaseConfig, supabase } from '@/lib/supabaseClient.js';

const FALLBACK_COLLECTIONS = TEMPLATE_COLLECTIONS;

export function useTemplateLibrary({ fetchRemote = true } = {}) {
  const [collections, setCollections] = useState(FALLBACK_COLLECTIONS);
  const [status, setStatus] = useState(fetchRemote && hasSupabaseConfig ? 'loading' : 'idle');
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

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
  }, [fetchRemote, retryKey]);

  const flattened = useMemo(() => collections ?? FALLBACK_COLLECTIONS, [collections]);

  return {
    collections: flattened,
    status,
    error,
    retry: () => setRetryKey((value) => value + 1)
  };
}
