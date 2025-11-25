import { CreditCard, ShieldCheck } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmailPasswordForm from '@/components/auth/EmailPasswordForm.jsx';

function CreatorPortal({ user, userLabel, toolsError, hasSupabaseConfig, sessionEntries = [] }) {
  if (!user) {
    return (
      <section className="space-y-6">
        <Card className="border border-primary/20 bg-muted/40">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">Sign in to access the Creator Portal</CardTitle>
            <CardDescription>
              Use your email and password to view account insights, manage integrations, and access
              upcoming creator tooling.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailPasswordForm
              heading=""
              description=""
              idPrefix="creator-portal-auth"
              onAuthSuccess={() => {
                // Supabase auth listener in parent will refresh UI
              }}
            />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              You can still generate tools without signing in, but portal insights require an account.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  const displayName =
    user.user_metadata?.full_name ||
    (user.email ? user.email.split('@')[0] : userLabel || 'Creator');

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-background/70 via-background/60 to-primary/10 p-6 shadow-[0_45px_140px_-60px_rgba(56,189,248,0.55)] backdrop-blur-xl sm:p-8 lg:p-10">
        <div className="absolute -left-24 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-32 -top-20 h-[360px] w-[360px] rounded-full bg-accent/10 blur-3xl" />

        <div className="relative flex flex-col gap-6">
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
          </div>

        </div>
      </div>

      {toolsError ? (
        <Alert variant="destructive" className="border border-destructive/40 bg-destructive/10">
          <AlertDescription>{toolsError}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/70">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
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
                    ? 'Ready — email + password sign-ins and saved tools are available.'
                    : 'Connect Supabase environment variables to enable saving tools and portal insights.'}
                </p>
              </div>
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
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                data-tally-open="b559Z7"
                data-tally-emoji-text="👋"
                data-tally-emoji-animation="wave"
              >
                Join billing waitlist
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation tab removed per latest design */}
      </Tabs>
    </section>
  );
}

export default CreatorPortal;
