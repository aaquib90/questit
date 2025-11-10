import { Sparkles, Rocket, ShieldCheck, Repeat, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const stats = [
  { label: 'Browser-native', value: '100%' },
  { label: 'Model choices', value: 'OpenAI · Gemini' },
  { label: 'Publish-ready', value: 'Edge deployed' }
];

export function WorkbenchHero({ onNavigateDocs }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-background/60 via-background/40 to-primary/5 p-10 shadow-[0_35px_120px_-45px_rgba(56,189,248,0.45)] backdrop-blur-xl">
      <div className="absolute -left-24 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-24 -top-20 h-[320px] w-[320px] rounded-full bg-accent/10 blur-3xl" />

      <div className="relative flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-6">
          <Badge className="rounded-full bg-primary/15 px-3 py-1 text-primary">
            <Sparkles className="mr-2 h-3 w-3" aria-hidden />
            Cloudflare-first • Supabase-ready
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Generate polished micro-tools from natural language
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              Questit transforms your prompts into production-ready HTML/CSS/JS bundles,
              styled to match the shadcn workbench. Iterate live, preview instantly, and publish to Workers on tap.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="group gap-2">
              <Rocket className="h-4 w-4" aria-hidden />
              Start generating
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Button>
            <Button variant="outline" size="lg" className="gap-2" onClick={onNavigateDocs}>
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Read the playbook
            </Button>
          </div>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-primary/15 bg-background/60 p-6 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
            <Repeat className="h-4 w-4" aria-hidden />
            Edge-native workflow
          </div>
          <p className="text-sm text-muted-foreground">
            Prompt, iterate, preview, and publish to a Questit user worker in one flow. Slice between OpenAI and Gemini models and keep everything browser-safe.
          </p>
          <dl className="grid gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1 rounded-xl border border-border/60 bg-background/80 p-3 shadow-inner">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</dt>
                <dd className="text-lg font-semibold text-foreground">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export default WorkbenchHero;
