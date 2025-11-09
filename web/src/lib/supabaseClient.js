import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

function buildClient() {
  if (hasSupabaseConfig) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  const notConfiguredError = () =>
    new Error('Supabase environment variables are not configured.');

  return {
    auth: {
      async signInWithOtp() {
        return { data: null, error: notConfiguredError() };
      },
      async signOut() {
        return { error: notConfiguredError() };
      },
      async getSession() {
        return { data: { session: null }, error: notConfiguredError() };
      },
      onAuthStateChange() {
        return {
          data: {
            subscription: {
              unsubscribe() {
                // noop
              }
            }
          }
        };
      }
    },
    from() {
      return {
        async insert() {
          return { data: null, error: notConfiguredError() };
        }
      };
    }
  };
}

export const supabase = buildClient();

export const supabaseProjectInfo = {
  url: supabaseUrl,
  anonKey: supabaseAnonKey
};
