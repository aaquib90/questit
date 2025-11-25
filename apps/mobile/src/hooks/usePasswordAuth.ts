import { useCallback, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient, hasSupabaseConfig } from '../lib/supabase';

type AuthState = 'idle' | 'loading' | 'success' | 'error';

export interface AuthStatus {
  state: AuthState;
  message: string;
}

const DEFAULT_STATUS: AuthStatus = { state: 'idle', message: '' };

function hasErrorField(value: unknown): value is { error?: unknown } {
  return Boolean(value && typeof value === 'object' && 'error' in value);
}

function normalizeError(error: unknown) {
  if (!error) return 'Something went wrong. Try again.';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message || 'Something went wrong.';
  return 'Something went wrong. Try again.';
}

function requireSupabase(): SupabaseClient {
  if (!hasSupabaseConfig) {
    throw new Error('Supabase is not configured for this build.');
  }
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client is unavailable.');
  }
  return client;
}

export function usePasswordAuth() {
  const [status, setStatus] = useState<AuthStatus>(DEFAULT_STATUS);

  const execute = useCallback(
    async (
      actionLabel: string,
      successMessage: string,
      task: (client: SupabaseClient) => Promise<unknown>
    ) => {
      try {
        const client = requireSupabase();
        setStatus({ state: 'loading', message: actionLabel });
        const result = await task(client);
        if (hasErrorField(result) && result.error) {
          throw result.error;
        }
        setStatus({ state: 'success', message: successMessage });
        return result;
      } catch (error) {
        setStatus({ state: 'error', message: normalizeError(error) });
        return { error };
      }
    },
    []
  );

  const signInWithPassword = useCallback(
    (params: { email: string; password: string }) => {
      const trimmedEmail = (params.email || '').trim();
      if (!trimmedEmail || !params.password) {
        const error = new Error('Enter both email and password.');
        setStatus({ state: 'error', message: error.message });
        return Promise.resolve({ error });
      }
      return execute('Signing in…', 'Signed in.', (client) =>
        client.auth.signInWithPassword({
          email: trimmedEmail,
          password: params.password
        })
      );
    },
    [execute]
  );

  const signUpWithPassword = useCallback(
    (params: { email: string; password: string }) => {
      const trimmedEmail = (params.email || '').trim();
      if (!trimmedEmail || !params.password) {
        const error = new Error('Email and password are required.');
        setStatus({ state: 'error', message: error.message });
        return Promise.resolve({ error });
      }
      return execute('Creating your account…', 'Account created. Check your email to confirm.', (client) =>
        client.auth.signUp({
          email: trimmedEmail,
          password: params.password
        })
      );
    },
    [execute]
  );

  const sendPasswordReset = useCallback(
    (params: { email: string; redirectTo?: string }) => {
      const trimmedEmail = (params.email || '').trim();
      if (!trimmedEmail) {
        const error = new Error('Enter the email tied to your account.');
        setStatus({ state: 'error', message: error.message });
        return Promise.resolve({ error });
      }
      const fallbackRedirect = params.redirectTo || 'questit://auth/reset';
      return execute('Sending reset instructions…', 'Password reset email sent.', (client) =>
        client.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: fallbackRedirect
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

