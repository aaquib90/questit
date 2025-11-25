import { useCallback, useState } from 'react';
import { hasSupabaseConfig, supabase } from './supabaseClient';

const DEFAULT_STATUS = { state: 'idle', message: '' };

function normalizeError(error) {
  if (!error) return 'Something went wrong. Try again.';
  if (typeof error === 'string') return error;
  return error.message || 'Something went wrong. Try again.';
}

function requireSupabase() {
  if (!hasSupabaseConfig) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  if (!supabase) {
    throw new Error('Supabase client is unavailable.');
  }
  return supabase;
}

export function usePasswordAuth() {
  const [status, setStatus] = useState(DEFAULT_STATUS);

  const execute = useCallback(async (actionLabel, successMessage, task) => {
    try {
      const client = requireSupabase();
      setStatus({ state: 'loading', message: actionLabel });
      const result = await task(client);
      if (result?.error) {
        throw result.error;
      }
      setStatus({ state: 'success', message: successMessage });
      return result;
    } catch (error) {
      setStatus({ state: 'error', message: normalizeError(error) });
      return { error };
    }
  }, []);

  const signInWithPassword = useCallback(
    ({ email, password }) => {
      const trimmedEmail = (email || '').trim();
      if (!trimmedEmail || !password) {
        const error = new Error('Enter both email and password.');
        setStatus({ state: 'error', message: error.message });
        return Promise.resolve({ error });
      }
      return execute('Signing in…', 'Signed in. Redirecting…', (client) =>
        client.auth.signInWithPassword({ email: trimmedEmail, password })
      );
    },
    [execute]
  );

  const signUpWithPassword = useCallback(
    ({ email, password }) => {
      const trimmedEmail = (email || '').trim();
      if (!trimmedEmail || !password) {
        const error = new Error('Email and password are required.');
        setStatus({ state: 'error', message: error.message });
        return Promise.resolve({ error });
      }
      return execute('Creating your account…', 'Account created. Check your inbox to confirm.', (client) =>
        client.auth.signUp({
          email: trimmedEmail,
          password
        })
      );
    },
    [execute]
  );

  const sendPasswordReset = useCallback(
    ({ email, redirectTo }) => {
      const trimmedEmail = (email || '').trim();
      if (!trimmedEmail) {
        const error = new Error('Enter the email tied to your account.');
        setStatus({ state: 'error', message: error.message });
        return Promise.resolve({ error });
      }
      const fallbackRedirect =
        typeof window !== 'undefined' ? `${window.location.origin}/auth/reset` : undefined;
      return execute('Sending reset instructions…', 'Password reset email sent.', (client) =>
        client.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: redirectTo || fallbackRedirect
        })
      );
    },
    [execute]
  );

  const resetStatus = useCallback(() => setStatus(DEFAULT_STATUS), []);

  return {
    status,
    resetStatus,
    signInWithPassword,
    signUpWithPassword,
    sendPasswordReset,
    hasSupabaseConfig
  };
}

