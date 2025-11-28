import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';

import { Shell, Surface } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils.js';
import { hasSupabaseConfig, supabase } from '@/lib/supabaseClient.js';
import { useSeoMetadata } from '@/lib/seo.js';

const VIEW_STATES = {
  LOADING: 'loading',
  ERROR: 'error',
  SIGNUP_CONFIRMED: 'signup-confirmed',
  RESET_FORM: 'reset-form',
  SUCCESS: 'success'
};

const RESET_REDIRECT_TIMEOUT = 2000;

function parseAuthParams() {
  if (typeof window === 'undefined') {
    return {};
  }
  const hash = window.location.hash?.replace(/^#/, '') || '';
  const hashParams = new URLSearchParams(hash);
  const searchParams = new URLSearchParams(window.location.search);

  const params = new URLSearchParams();
  hashParams.forEach((value, key) => params.set(key, value));
  searchParams.forEach((value, key) => params.set(key, value));

  return {
    type: params.get('type') || null,
    accessToken: params.get('access_token') || null,
    refreshToken: params.get('refresh_token') || null,
    errorDescription: params.get('error_description') || null
  };
}

function clearAuthParamsFromUrl() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.hash = '';
  ['type', 'access_token', 'refresh_token', 'error_description'].forEach((param) => {
    url.searchParams.delete(param);
  });
  window.history.replaceState({}, document.title, url.toString());
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState({
    stage: VIEW_STATES.LOADING,
    message: 'Verifying your secure link…'
  });
  const [linkType, setLinkType] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formStatus, setFormStatus] = useState({ state: 'idle', message: '' });

  useSeoMetadata({
    title: 'Reset your Questit password',
    description: 'Use this page to finish resetting your Questit password from a secure email link.'
  });

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setViewState({
        stage: VIEW_STATES.ERROR,
        message: 'Password reset is unavailable because Supabase is not configured.'
      });
      return;
    }

    let isMounted = true;

    async function bootstrap() {
      setViewState({
        stage: VIEW_STATES.LOADING,
        message: 'Verifying your secure link…'
      });
      const params = parseAuthParams();

      if (params.errorDescription) {
        setViewState({
          stage: VIEW_STATES.ERROR,
          message: params.errorDescription
        });
        return;
      }

      try {
        let session = null;
        if (params.accessToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: params.accessToken,
            refresh_token: params.refreshToken
          });
          if (error) throw error;
          session = data.session;
          clearAuthParamsFromUrl();
        } else {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          session = data.session;
        }

        if (!session) {
          throw new Error('This link has expired. Please request a new reset email.');
        }

        if (!isMounted) return;
        const type = params.type || 'recovery';
        setLinkType(type);
        if (type === 'signup') {
          setViewState({
            stage: VIEW_STATES.SIGNUP_CONFIRMED,
            message:
              'Your email is confirmed. You can set a password below or head straight back to the workbench.'
          });
        } else {
          setViewState({
            stage: VIEW_STATES.RESET_FORM,
            message: ''
          });
        }
      } catch (error) {
        if (!isMounted) return;
        setViewState({
          stage: VIEW_STATES.ERROR,
          message:
            error?.message ||
            'This reset link is invalid or has expired. Request a fresh password reset email.'
        });
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (viewState.stage !== VIEW_STATES.SUCCESS) return undefined;
    const timeout = window.setTimeout(() => {
      navigate('/build', { replace: true });
    }, RESET_REDIRECT_TIMEOUT);
    return () => window.clearTimeout(timeout);
  }, [viewState.stage, navigate]);

  const isResetForm = viewState.stage === VIEW_STATES.RESET_FORM;
  const isLoading = viewState.stage === VIEW_STATES.LOADING;
  const isError = viewState.stage === VIEW_STATES.ERROR;
  const isSignupConfirmed = viewState.stage === VIEW_STATES.SIGNUP_CONFIRMED;
  const isSuccess = viewState.stage === VIEW_STATES.SUCCESS;

  const helperText = useMemo(() => {
    if (!formStatus.message) return '';
    return formStatus.message;
  }, [formStatus.message]);

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    if (!hasSupabaseConfig) return;

    if (password.length < 8) {
      setFormStatus({ state: 'error', message: 'Passwords must be at least 8 characters long.' });
      return;
    }
    if (password !== confirmPassword) {
      setFormStatus({ state: 'error', message: 'Passwords must match.' });
      return;
    }

    setFormStatus({ state: 'loading', message: 'Updating your password…' });
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setFormStatus({ state: 'error', message: error.message });
      return;
    }
    setFormStatus({ state: 'success', message: 'Password updated. Redirecting…' });
    setViewState({
      stage: VIEW_STATES.SUCCESS,
      message: 'Password updated. We are redirecting you to the workbench…'
    });
  };

  const handleGoToWorkbench = () => {
    navigate('/build', { replace: true });
  };

  const showResetCta = isSignupConfirmed || isSuccess;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Shell className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-16">
        <Surface className="space-y-6 p-8 shadow-xl">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Reset your Questit password</h1>
            <p className="text-sm text-muted-foreground">
              Finish resetting your password using the secure link we emailed you.
            </p>
          </header>

          {isLoading ? (
            <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
              <p>{viewState.message}</p>
            </div>
          ) : null}

          {isError ? (
            <div className="space-y-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldAlert className="h-4 w-4" aria-hidden />
                Something went wrong
              </div>
              <p>{viewState.message}</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" onClick={handleGoToWorkbench}>
                  Back to workbench
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link to="/build?login=1">Request a new reset email</Link>
                </Button>
              </div>
            </div>
          ) : null}

          {isSignupConfirmed ? (
            <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-50">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                Email verified
              </div>
              <p>{viewState.message}</p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" onClick={() => setViewState({ stage: VIEW_STATES.RESET_FORM, message: '' })}>
                  Set a password now
                </Button>
                <Button variant="outline" size="sm" onClick={handleGoToWorkbench}>
                  Go to workbench
                </Button>
              </div>
            </div>
          ) : null}

          {isResetForm ? (
            <form onSubmit={handlePasswordUpdate} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter a strong password"
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  minLength={8}
                />
              </div>
              {helperText ? (
                <p
                  className={cn(
                    'text-sm',
                    formStatus.state === 'error'
                      ? 'text-destructive'
                      : formStatus.state === 'success'
                        ? 'text-emerald-600'
                        : 'text-muted-foreground'
                  )}
                >
                  {helperText}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={formStatus.state === 'loading'}>
                  {formStatus.state === 'loading' ? 'Saving…' : 'Update password'}
                </Button>
                <Button type="button" variant="ghost" onClick={handleGoToWorkbench}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}

          {isSuccess ? (
            <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-100/40 p-5 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-50">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                Password updated
              </div>
              <p>{viewState.message}</p>
              <Button size="sm" onClick={handleGoToWorkbench}>
                Continue now
              </Button>
            </div>
          ) : null}

          {showResetCta && viewState.stage !== VIEW_STATES.ERROR ? (
            <div className="text-sm text-muted-foreground">
              Not you?{' '}
              <Button asChild variant="link" className="p-0 text-sm">
                <Link to="/build?login=1">Return to the sign-in screen</Link>
              </Button>
            </div>
          ) : null}
        </Surface>
      </Shell>
    </div>
  );
}

