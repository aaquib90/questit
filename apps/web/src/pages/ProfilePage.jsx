import { useEffect, useMemo, useState } from 'react';
import SiteHeader from '@/components/layout/SiteHeader.jsx';
import { Surface } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CreatorPortal from '@/components/account/CreatorPortal.jsx';
import { hasSupabaseConfig, supabase } from '@/lib/supabaseClient';
import { useSeoMetadata } from '@/lib/seo.js';
import { getThemeOptions, useThemeManager } from '@/lib/themeManager.js';
import EmailPasswordForm from '@/components/auth/EmailPasswordForm.jsx';

export default function ProfilePage() {
  useSeoMetadata({
    title: 'Questit · Profile',
    description: 'Manage your Questit account, billing preferences, and creator tools.',
    url: typeof window !== 'undefined' ? window.location.href : 'https://questit.cc/profile'
  });

  const [user, setUser] = useState(null);
  const [toolsError] = useState('');
  const { selectedTheme, setSelectedTheme, colorMode, setColorMode } = useThemeManager();
  const themeOptions = getThemeOptions();

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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.warn('Unable to sign out.', error);
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
      <SiteHeader
        ctaLabel="Open Workbench"
        ctaHref="/build"
        colorMode={colorMode}
        onToggleColorMode={() => setColorMode((mode) => (mode === 'dark' ? 'light' : 'dark'))}
        user={user}
        onLogin={() => {
          const emailField = document.getElementById('profile-auth-email');
          emailField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          emailField?.focus();
        }}
        onLogout={handleSignOut}
      />
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
            <EmailPasswordForm
              heading="Access your Questit profile"
              description="Use your email and password to manage themes, billing, and creator tools."
              idPrefix="profile-auth"
              onAuthSuccess={() => {
                // no-op; Supabase listener will refresh the UI
              }}
            />
          </Surface>
        ) : null}

        {hasSupabaseConfig && user ? (
          <CreatorPortal
            user={user}
            userLabel={userLabel}
            toolsError={toolsError}
            hasSupabaseConfig={hasSupabaseConfig}
            sessionEntries={[]}
          />
        ) : null}

        {hasSupabaseConfig && user ? (
          <Surface className="mt-8 space-y-3 rounded-2xl border border-border/50 bg-background/80 p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Appearance</h2>
            <p className="text-sm text-muted-foreground">
              Choose a theme for the Questit workbench and published tools. Changes apply immediately.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <span className="text-sm font-medium text-foreground">Color theme</span>
                <p className="text-xs text-muted-foreground">
                  Currently using <strong>{themeOptions.find((option) => option.value === selectedTheme)?.label || selectedTheme}</strong>.
                </p>
              </div>
              <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent align="end">
                  {themeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Surface>
        ) : null}
      </main>
    </div>
  );
}
