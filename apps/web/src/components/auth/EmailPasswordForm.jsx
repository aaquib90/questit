import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils.js';
import { usePasswordAuth } from '@/lib/usePasswordAuth.js';

const MODES = {
  SIGN_IN: 'sign-in',
  SIGN_UP: 'sign-up'
};

export default function EmailPasswordForm({
  heading = 'Sign in to Questit',
  description = 'Use your email and password to access saved tools and creator settings.',
  defaultMode = MODES.SIGN_IN,
  redirectTo,
  className,
  onAuthSuccess,
  idPrefix = 'auth'
}) {
  const [mode, setMode] = useState(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { status, resetStatus, signInWithPassword, signUpWithPassword, sendPasswordReset, hasSupabaseConfig } =
    usePasswordAuth();

  const disabled = status.state === 'loading';
  const submitLabel = mode === MODES.SIGN_IN ? 'Sign in' : 'Create account';

  const helperText = useMemo(() => {
    if (!hasSupabaseConfig) {
      return 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
    }
    return status.message;
  }, [hasSupabaseConfig, status.message]);

  const helperVariant = !hasSupabaseConfig ? 'error' : status.state;

  const handleModeToggle = useCallback(
    (nextMode) => {
      if (mode === nextMode) return;
      setMode(nextMode);
      resetStatus();
    },
    [mode, resetStatus]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!hasSupabaseConfig) {
      return;
    }
    const action =
      mode === MODES.SIGN_IN
        ? signInWithPassword
        : signUpWithPassword;
    const result = await action({ email, password });
    if (!result?.error) {
      onAuthSuccess?.(mode);
    }
  };

  const handlePasswordReset = async () => {
    if (!hasSupabaseConfig) return;
    await sendPasswordReset({ email, redirectTo });
  };

  const emailInputId = `${idPrefix}-email`;
  const passwordInputId = `${idPrefix}-password`;

  return (
    <div className={cn('space-y-4', className)}>
      {(heading || description) ? (
        <div className="space-y-2">
          {heading ? <h2 className="text-xl font-semibold text-foreground">{heading}</h2> : null}
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
      ) : null}
      <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/40 p-1 text-xs font-medium text-muted-foreground">
        <button
          type="button"
          className={cn(
            'rounded-full px-3 py-1 transition',
            mode === MODES.SIGN_IN ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
          )}
          onClick={() => handleModeToggle(MODES.SIGN_IN)}
        >
          Sign in
        </button>
        <button
          type="button"
          className={cn(
            'rounded-full px-3 py-1 transition',
            mode === MODES.SIGN_UP ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
          )}
          onClick={() => handleModeToggle(MODES.SIGN_UP)}
        >
          Create account
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={emailInputId}>Email address</Label>
          <Input
            id={emailInputId}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={passwordInputId}>Password</Label>
          <div className="flex gap-2">
            <Input
              id={passwordInputId}
              type={showPassword ? 'text' : 'password'}
              autoComplete={mode === MODES.SIGN_IN ? 'current-password' : 'new-password'}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={disabled}
            />
            <Button
              type="button"
              variant="outline"
              className="shrink-0 text-xs"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={disabled}
            >
              {showPassword ? 'Hide' : 'Show'}
            </Button>
          </div>
        </div>
        {helperText ? (
          <p
            className={cn(
              'text-sm',
              helperVariant === 'error'
                ? 'text-destructive'
                : helperVariant === 'success'
                  ? 'text-emerald-500'
                  : 'text-muted-foreground'
            )}
          >
            {helperText}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="submit" disabled={disabled || !hasSupabaseConfig}>
            {disabled ? 'Working…' : submitLabel}
          </Button>
          <button
            type="button"
            className="text-sm font-semibold text-primary hover:underline"
            onClick={handlePasswordReset}
            disabled={disabled || !email}
          >
            Forgot password?
          </button>
        </div>
      </form>
    </div>
  );
}

