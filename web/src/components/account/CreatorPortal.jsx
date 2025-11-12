import {
  ArrowRight,
  BookOpen,
  CreditCard,
  Layers,
  Monitor,
  Palette,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Users,
  Zap
} from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function formatTokenLabel(token) {
  return token ? token.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : '—';
}

function CreatorPortal({
  user,
  userLabel,
  onLogin,
  onRefreshTools,
  isLoadingTools,
  toolsError,
  hasSupabaseConfig,
  myTools = [],
  selectedTheme,
  colorMode,
  selectedModelLabel,
  sessionEntries = [],
  onUsePrompt,
  onOpenDocs
}) {
  if (!user) {
    return (
      <section className="space-y-6">
        <Card className="border border-primary/20 bg-muted/40">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">Sign in to access the Creator Portal</CardTitle>
            <CardDescription>
              Connect with a magic link to view account insights, manage integrations, and access
              upcoming creator tooling.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <Button size="lg" onClick={onLogin}>
              Send magic link
            </Button>
            <p className="text-xs text-muted-foreground">
              You can still generate tools without signing in, but portal insights require an
              account.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  const totalSavedTools = myTools.length;
  const lastSession = sessionEntries.at(-1) ?? null;
  const recentPrompts = sessionEntries.slice(-5).reverse();

  const lastSignIn = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString()
    : 'Not recorded';

  const displayName =
    user.user_metadata?.full_name ||
    (user.email ? user.email.split('@')[0] : userLabel || 'Creator');

  const metrics = [
    {
      label: 'Saved micro-tools',
      value: totalSavedTools,
      hint: hasSupabaseConfig ? 'Synced from Supabase' : 'Enable Supabase to start syncing',
      icon: Layers
    },
    {
      label: 'Latest model',
      value: selectedModelLabel,
      hint: lastSession?.modelLabel ? `Used in: ${lastSession.modelLabel}` : 'Model picker default',
      icon: Sparkles
    },
    {
      label: 'Active theme',
      value: formatTokenLabel(selectedTheme),
      hint: 'Applied to workbench + share shell',
      icon: Palette
    },
    {
      label: 'Color mode',
      value: formatTokenLabel(colorMode),
      hint: 'System preference respected',
      icon: Monitor
    }
  ];

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-background/70 via-background/60 to-primary/10 p-6 shadow-[0_45px_140px_-60px_rgba(56,189,248,0.55)] backdrop-blur-xl sm:p-8 lg:p-10">
        <div className="absolute -left-24 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-32 -top-20 h-[360px] w-[360px] rounded-full bg-accent/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <Badge className="w-fit rounded-full bg-primary/15 px-3 py-1 text-primary">
              Creator portal
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Welcome back, {displayName}
              </h1>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                Track your Questit footprint, manage integrations, and preview upcoming automation
                tools built for creators who ship micro-apps at the edge.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                size="lg"
                className="w-full gap-2 sm:w-auto"
                onClick={onRefreshTools}
                disabled={isLoadingTools || !hasSupabaseConfig}
              >
                <RefreshCcw className={isLoadingTools ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} aria-hidden />
                {isLoadingTools ? 'Syncing saved tools…' : 'Sync saved tools'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 w-full sm:w-auto"
                onClick={onOpenDocs}
              >
                <BookOpen className="h-4 w-4" aria-hidden />
                View playbook
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>

          <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-primary/20 bg-background/70 p-6 shadow-lg backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold uppercase text-primary">
                {displayName.slice(0, 2)}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{userLabel}</p>
                <span className="text-xs text-muted-foreground">Last sign-in: {lastSignIn}</span>
              </div>
            </div>
            <Separator className="bg-border/60" />
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[11px] uppercase tracking-wide">
                  {hasSupabaseConfig ? 'Supabase linked' : 'Supabase pending'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Plan</span>
                <span className="font-medium text-foreground">Edge Starter (Free)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Workspace tools</span>
                <span className="font-medium text-foreground">{totalSavedTools}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, hint, icon }) => {
          const MetricIcon = icon;
          return (
            <Card key={label} className="border border-border/70 bg-card">
              <CardHeader className="space-y-1.5">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <MetricIcon className="h-4 w-4 text-primary" aria-hidden />
                  {label}
                </CardTitle>
                <CardDescription>{hint}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{value || '—'}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {toolsError ? (
        <Alert variant="destructive" className="border border-destructive/40 bg-destructive/10">
          <AlertDescription>{toolsError}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-muted/70">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            <Card className="border border-border/70 bg-card">
              <CardHeader className="space-y-1.5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                  Identity & security
                </CardTitle>
                <CardDescription>
                  Manage the credentials tied to your Questit creator workspace.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Email</span>
                  <p className="font-medium text-foreground">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Workspace label</span>
                  <p className="font-medium text-foreground">{userLabel}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Supabase linkage</span>
                  <p className="font-medium text-foreground">
                    {hasSupabaseConfig
                      ? 'Ready — magic link sign-ins and saved tools are available.'
                      : 'Connect Supabase environment variables to enable saving tools and portal insights.'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onOpenDocs}
                >
                  Review integration guide
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-border/70 bg-card">
              <CardHeader className="space-y-1.5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Layers className="h-4 w-4 text-primary" aria-hidden />
                  Workspace defaults
                </CardTitle>
                <CardDescription>
                  Current experience settings that apply to the workbench and shared shells.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Theme</span>
                  <p className="font-medium text-foreground">{formatTokenLabel(selectedTheme)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Color preference</span>
                  <p className="font-medium text-foreground">{formatTokenLabel(colorMode)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Model routing</span>
                  <p className="font-medium text-foreground">{selectedModelLabel}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Recent prompt</span>
                  <p className="font-medium text-foreground">
                    {lastSession?.prompt?.slice(0, 80) || 'No prompts yet'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team">
          <Card className="border border-border/70 bg-card">
            <CardHeader className="space-y-1.5">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" aria-hidden />
                Team workspace
              </CardTitle>
              <CardDescription>
                Upcoming collaborative features streamline review, publishing, and remixing across
                teammates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Shared folders, reviewer roles, and per-tool permissions are on the roadmap. Invite
                collaborators to preview updates as they ship.
              </p>
              <Button variant="outline" className="w-full sm:w-auto" disabled>
                Team invites coming soon
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card className="border border-border/70 bg-card">
            <CardHeader className="space-y-1.5">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-primary" aria-hidden />
                Billing & plans
              </CardTitle>
              <CardDescription>
                The Edge Starter plan keeps generation free while we roll out premium controls.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground">Current plan</span>
                <p className="font-medium text-foreground">Edge Starter — $0 / month</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">Usage snapshot</span>
                <p className="font-medium text-foreground">
                  {sessionEntries.length} prompt{sessionEntries.length === 1 ? '' : 's'} this week
                </p>
              </div>
              <p className="text-muted-foreground">
                Usage-based billing with higher bundle limits, private share-shell branding, and team
                seats is under active development. Join the waitlist to get early access.
              </p>
              <Button variant="outline" className="w-full sm:w-auto" onClick={onOpenDocs}>
                Join billing waitlist
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card className="border border-border/70 bg-card">
            <CardHeader className="space-y-1.5">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-primary" aria-hidden />
                Prompt templates
              </CardTitle>
              <CardDescription>
                Save high-signal prompts from recent sessions and jump back into the workbench.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPrompts.length ? (
                recentPrompts.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">
                          {new Date(entry.createdAt || Date.now()).toLocaleString()}
                        </span>
                        <p className="text-sm leading-relaxed text-foreground">
                          {entry.prompt}
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-2 w-full sm:mt-0 sm:w-auto"
                        onClick={() => onUsePrompt?.(entry.prompt)}
                      >
                        Open in workbench
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Prompt history is empty. Generate a tool to start capturing reusable templates.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card className="border border-border/70 bg-card">
            <CardHeader className="space-y-1.5">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-primary" aria-hidden />
                Automation studio
              </CardTitle>
              <CardDescription>
                Wires upcoming workflows that auto-publish, run self-tests, and notify your team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex flex-col gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 text-primary">
                <span className="text-xs font-semibold uppercase tracking-wide">
                  In development
                </span>
                <p className="text-sm text-primary">
                  Scheduled publish windows, regression guardrails, and PostHog webhooks are on the
                  roadmap. Stay tuned — the portal will light up as features land.
                </p>
              </div>
              <p>
                Want to influence the roadmap? Share what automations would unblock your workflow
                from the workbench.
              </p>
              <Button variant="outline" className="w-full sm:w-auto" onClick={onOpenDocs}>
                Share feedback
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}

export default CreatorPortal;
