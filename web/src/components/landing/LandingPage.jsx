import {
  ArrowRight,
  Bolt,
  Layers,
  Palette,
  ShieldCheck,
  Sparkles,
  Timer,
  Wand2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PillTray, Section, Surface } from '@/components/layout';

const FEATURE_PILLS = [
  { icon: Sparkles, label: 'AI-orchestrated builders' },
  { icon: Bolt, label: 'Runs on Cloudflare edge' },
  { icon: ShieldCheck, label: 'Security scan & guardrails' },
  { icon: Palette, label: 'Shadcn-aligned theming' }
];

const VALUE_CARDS = [
  {
    icon: Wand2,
    title: 'Create in seconds',
    copy:
      'Describe the outcome you want. Questit scopes the request, fetches starter code, and assembles a working tool instantly.'
  },
  {
    icon: Layers,
    title: 'Iterate with context',
    copy:
      'Send follow-up prompts that keep state. Each revision understands prior feedback, so refinements stack without rework.'
  },
  {
    icon: Timer,
    title: 'Publish when ready',
    copy:
      'Ship to Cloudflare Workers for Platforms with a click, or share the sandboxed preview to collect feedback before launch.'
  }
];

const TEMPLATE_CHIPS = [
  {
    label: 'Shopping List',
    description: 'Track what you need to buy this week.',
    prompt: 'Create a simple shopping list where I can add, reorder, and check off items.'
  },
  {
    label: 'Mood Journal',
    description: 'Log daily feelings with quick prompts.',
    prompt:
      'Build a mood journal that lets me pick an emoji for how I feel, add a short note, and view a weekly timeline.'
  },
  {
    label: 'Recipe Scaler',
    description: 'Adjust servings with smart math.',
    prompt:
      'Make a recipe scaler that recalculates ingredient amounts when I change the number of servings.'
  },
  {
    label: 'Standup Notes',
    description: 'Summarise yesterday / today / blockers.',
    prompt:
      'Generate a lightweight team standup tracker with sections for yesterday, today, and blockers, plus export to Markdown.'
  },
  {
    label: 'Content Planner',
    description: 'Plan posts with status tracking.',
    prompt:
      'Draft a social content planner that tracks platform, copy, assets, and approval status with inline editing.'
  }
];

const TRUSTED_LOGOS = ['OpenAI', 'Supabase', 'Vercel', 'Cursor', 'Cloudflare'];

function LandingPage({
  onStart,
  onSeeTemplates,
  onSelectTemplate,
  onNavigate,
  onLogin,
  onSignOut,
  user,
  userLabel
}) {
  const isAuthenticated = Boolean(user);

  return (
    <div className="space-y-16 lg:space-y-20">
      <div className="questit-landing-header flex flex-col gap-6 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => onNavigate?.('landing')}
          className="questit-logo border-none bg-transparent p-0 text-left outline-none transition hover:opacity-90"
        >
          Questit
        </button>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-4 text-sm"
            onClick={() => onNavigate?.('workbench')}
          >
            Workbench
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-4 text-sm"
            onClick={() => onNavigate?.('my-tools')}
            disabled={!isAuthenticated}
          >
            My Tools
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-4 text-sm"
            onClick={() => onNavigate?.('creator-portal')}
            disabled={!isAuthenticated}
          >
            Creator Portal
          </Button>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                {userLabel}
              </Badge>
              <Button variant="outline" size="sm" className="rounded-full px-4 text-sm" onClick={onSignOut}>
                Sign out
              </Button>
            </div>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="rounded-full px-5 text-sm"
              onClick={onLogin}
            >
              Log in
            </Button>
          )}
        </div>
      </div>

      <Section className="gap-14 lg:gap-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-xs font-medium">
              Generate, iterate, publish
            </Badge>
            <h1>Turn ideas into working micro-tools, without leaving the browser.</h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              Questit finds the right starter snippets, adapts them with AI, and deploys to the edge in
              minutes. Explain the problem once and keep iterating until it is ready to share.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={onStart} className="gap-2">
                Start creating
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onSeeTemplates}
                className="gap-2 border-dashed"
              >
                Browse starter templates
              </Button>
            </div>
            <PillTray>
              {FEATURE_PILLS.map(({ icon: Icon, label }) => (
                <span key={label} className="questit-chip">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                  {label}
                </span>
              ))}
            </PillTray>
          </div>
          <Surface className="flex-1 overflow-hidden border border-border/50 p-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/90 p-6 shadow-lg shadow-primary/10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    Prompt
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    “Draft a budgeting dashboard for freelance designers.”
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
                  12s to generate
                </Badge>
              </div>
              <div className="grid gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Preview
                </span>
                <div className="grid gap-2 rounded-lg border border-border/60 bg-background p-3 text-sm shadow-inner">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Status</span>
                    <span className="font-medium text-emerald-500">All checks passed</span>
                  </div>
                  <div className="rounded-md border border-border/50 bg-surface p-3 text-sm leading-relaxed shadow-sm">
                    Income vs expenses, category breakdowns, and quick self-test hooks appear instantly.
                    Tweak the prompt and the preview updates with history intact.
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Scoped to 4 files • Security scan clean</span>
                <span className="font-medium text-primary">Publish to Workers →</span>
              </div>
            </div>
          </Surface>
        </div>
      </Section>

      <Section tight className="gap-6 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Trusted by builders at
        </span>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-muted-foreground md:gap-8">
          {TRUSTED_LOGOS.map((logo) => (
            <span key={logo}>{logo}</span>
          ))}
        </div>
      </Section>

      <Section className="gap-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {VALUE_CARDS.map(({ icon: Icon, title, copy }) => (
            <Surface key={title} muted className="h-full border border-border/40 p-6 shadow-sm">
              <div className="flex h-full flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" aria-hidden />
                  </span>
                  <h3 className="text-lg font-semibold leading-tight">{title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{copy}</p>
              </div>
            </Surface>
          ))}
        </div>
      </Section>

      <Section className="gap-6">
        <div className="space-y-2 text-left">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Or try a ready-made idea
          </h2>
          <p className="text-sm text-muted-foreground">
            Click any card to prefill the generator. You can customise the prompt before sending it to
            Questit.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATE_CHIPS.map(({ label, description, prompt }) => (
            <button
              key={label}
              type="button"
              onClick={() => onSelectTemplate?.(prompt)}
              className="questit-surface-muted flex flex-col gap-2 rounded-2xl border border-border/40 p-4 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-base font-semibold text-foreground">{label}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              <span className="text-xs text-muted-foreground/80">Prefills the composer</span>
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

export default LandingPage;
