import { useEffect, useMemo, useState } from 'react';
import SiteHeader from '@/components/layout/SiteHeader.jsx';
import { Surface } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CreatorPortal from '@/components/account/CreatorPortal.jsx';
import { hasSupabaseConfig, supabase } from '@/lib/supabaseClient';
import { useSeoMetadata } from '@/lib/seo.js';

export default function ProfilePage() {
  useSeoMetadata({
    title: 'Questit · Profile',
    description: 'Manage your Questit account, billing preferences, and creator tools.',
    url: typeof window !== 'undefined' ? window.location.href : 'https://questit.cc/profile'
  });

  const [user, setUser] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authStatus, setAuthStatus] = useState({ state: 'idle', message: '' });
  const [toolsError, setToolsError] = useState('');

  useEffect(() => {
    if (!hasSupabaseConfig) return undefined;

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (mounted) setUser(data.session?.user ?? null);
      })
      .catch((error) => {
        console.warn('Failed to load session', error);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  const handleSendMagicLink = async (event) => {
    event?.preventDefault?.();
    if (!hasSupabaseConfig) {
      setAuthStatus({
        state: 'error',
        message: 'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      });
      return;
    }
    const email = authEmail.trim();
    if (!email) {
      setAuthStatus({ state: 'error', message: 'Enter an email address to continue.' });
      return;
    }
    setAuthStatus({ state: 'loading', message: 'Sending magic link…' });
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setAuthStatus({ state: 'error', message: error.message });
    } else {
      setAuthStatus({ state: 'success', message: 'Check your inbox for the magic link.' });
    }
  };

  const userLabel = useMemo(() => {
    if (!user) return 'Creator';
    return (
      user.user_metadata?.full_name ||
      (user.email ? user.email.split('@')[0] : 'Creator')
    );
  }, [user]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader ctaLabel="Open Workbench" ctaHref="/build" />
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-10 space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">Your Questit Profile</h1>
          <p className="text-base text-muted-foreground">
            Manage subscription details, creator settings, and upcoming integrations.
          </p>
        </header>

        {!hasSupabaseConfig ? (
          <Surface className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center text-sm text-muted-foreground">
            Configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to enable profile features.
          </Surface>
        ) : null}

        {hasSupabaseConfig && !user ? (
          <Surface className="space-y-4 rounded-2xl border border-border/50 bg-background/80 p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Sign in with a magic link</h2>
            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="profile-email" className="text-sm font-medium text-foreground">
                  Email address
                </label>
                <Input
                  id="profile-email"
                  type="email"
                  placeholder="you@example.com"
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  required
                />
              </div>
              {authStatus.message ? (
                <p
                  className={`text-sm ${
                    authStatus.state === 'error'
                      ? 'text-destructive'
                      : authStatus.state === 'success'
                        ? 'text-emerald-500'
                        : 'text-muted-foreground'
                  }`}
                >
                  {authStatus.message}
                </p>
              ) : null}
              <Button type="submit" disabled={authStatus.state === 'loading'}>
                {authStatus.state === 'loading' ? 'Sending…' : 'Send magic link'}
              </Button>
            </form>
          </Surface>
        ) : null}

        {hasSupabaseConfig && user ? (
          <CreatorPortal
            user={user}
            userLabel={userLabel}
            onLogin={handleSendMagicLink}
            toolsError={toolsError}
            hasSupabaseConfig={hasSupabaseConfig}
            sessionEntries={[]}
          />
        ) : null}
      </main>
    </div>
  );
}
