import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '@/components/layout/SiteHeader.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Surface } from '@/components/layout';
import { hasSupabaseConfig, supabase } from '@/lib/supabaseClient';
import { useSeoMetadata } from '@/lib/seo.js';
import { Badge } from '@/components/ui/badge';

function formatDate(iso) {
  if (!iso) return 'Recently updated';
  try {
    const date = new Date(iso);
    return `Updated ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  } catch {
    return 'Recently updated';
  }
}

export default function MyToolsPage() {
  useSeoMetadata({
    title: 'Questit · My tools',
    description: 'View saved Questit tools, re-open them in the workbench, and get ready to publish.',
    url: typeof window !== 'undefined' ? window.location.href : 'https://questit.cc/my-tools'
  });

  const [user, setUser] = useState(null);
  const [tools, setTools] = useState([]);
  const [loadingTools, setLoadingTools] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authStatus, setAuthStatus] = useState({ state: 'idle', message: '' });

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

  const loadTools = useCallback(() => {
    if (!hasSupabaseConfig || !user) return;
    setLoadingTools(true);
    setErrorMessage('');

    supabase
      .from('user_tools')
      .select('id,title,public_summary,updated_at,created_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(24)
      .then(({ data, error }) => {
        if (error) {
          setErrorMessage(error.message || 'Unable to load your tools right now.');
          setTools([]);
        } else {
          setTools(Array.isArray(data) ? data : []);
        }
        setLoadingTools(false);
      })
      .catch((error) => {
        setErrorMessage(error.message || 'Unable to load your tools right now.');
        setTools([]);
        setLoadingTools(false);
      });
  }, [user]);

  useEffect(() => {
    loadTools();
  }, [loadTools]);

  const handleSignIn = async (event) => {
    event.preventDefault();
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

  const headerSubtitle = useMemo(() => {
    if (!hasSupabaseConfig) {
      return 'Connect Supabase to enable account features.';
    }
    if (!user) {
      return 'Sign in with a magic link to see your saved and published tools.';
    }
    return 'Review your Questit tools and keep track of what you have shared.';
  }, [user]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader ctaLabel="Start Building" ctaHref="/build" />
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-10 space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">My Tools</h1>
          <p className="text-base text-muted-foreground">{headerSubtitle}</p>
        </header>

        {!hasSupabaseConfig ? (
          <Surface className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center text-sm text-muted-foreground">
            Configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to enable profile features.
          </Surface>
        ) : null}

        {hasSupabaseConfig && !user ? (
          <Surface className="space-y-4 rounded-2xl border border-border/50 bg-background/80 p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Sign in with a magic link</h2>
            <form onSubmit={handleSignIn} className="space-y-4">
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
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Saved tools</h2>
                <p className="text-sm text-muted-foreground">
                  {loadingTools
                    ? 'Loading…'
                    : tools.length
                      ? `You have ${tools.length} saved ${tools.length === 1 ? 'tool' : 'tools'}.`
                      : 'Save a tool from the workbench to see it here.'}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/build">Open the workbench</Link>
              </Button>
            </div>
            {errorMessage ? (
              <Surface className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                {errorMessage}
              </Surface>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              {tools.map((tool) => (
                <Surface
                  key={tool.id}
                  className="flex h-full flex-col justify-between rounded-2xl border border-border/50 bg-background/80 p-5 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">Saved</Badge>
                      <span>{formatDate(tool.updated_at || tool.created_at)}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{tool.title || 'Untitled tool'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tool.public_summary || 'No summary yet—open in the workbench to add one.'}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    <Button asChild size="sm">
                      <Link to={`/build?tool=${encodeURIComponent(tool.id)}`}>Edit</Link>
                    </Button>
                    <Button asChild size="sm" variant="secondary">
                      <Link to={`/tools?highlight=${encodeURIComponent(tool.id)}`}>Publish or share</Link>
                    </Button>
                  </div>
                </Surface>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
