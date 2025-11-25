import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env';

let supabaseClient: SupabaseClient | null = null;

export const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export function getSupabaseClient(): SupabaseClient | null {
  if (!hasSupabaseConfig) {
    return null;
  }
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        detectSessionInUrl: false,
        autoRefreshToken: true
      }
    });
  }
  return supabaseClient;
}
