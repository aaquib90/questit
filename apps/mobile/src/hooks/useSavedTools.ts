import { useQuery } from '@tanstack/react-query';
import { getSupabaseClient, hasSupabaseConfig } from '../lib/supabase';

export interface SavedTool {
  id: string;
  title: string;
  summary?: string | null;
  share_slug?: string | null;
  created_at?: string | null;
  theme?: string | null;
  color_mode?: string | null;
}

export interface SavedToolsResult {
  tools: SavedTool[];
  source: 'remote' | 'unauthenticated' | 'unavailable';
  requiresAuth?: boolean;
  error?: string;
}

async function fetchSavedTools(): Promise<SavedToolsResult> {
  if (!hasSupabaseConfig) {
    return {
      tools: [],
      source: 'unavailable',
      error: 'Supabase is not configured for this build.'
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      tools: [],
      source: 'unavailable',
      error: 'Supabase client is unavailable.'
    };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData?.session) {
    return {
      tools: [],
      source: 'unauthenticated',
      requiresAuth: true,
      error: 'Sign in to see your saved tools.'
    };
  }

  const { data, error } = await supabase
    .from('user_tools')
    .select('id,title,summary,share_slug,created_at,theme,color_mode')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return {
      tools: [],
      source: 'remote',
      error: error.message
    };
  }

  return {
    tools: Array.isArray(data) ? data : [],
    source: 'remote'
  };
}

export function useSavedTools() {
  return useQuery({
    queryKey: ['saved-tools'],
    queryFn: fetchSavedTools,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10
  });
}
