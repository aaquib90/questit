import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Surface } from '@/components/layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import SiteHeader from '@/components/layout/SiteHeader.jsx';
import TemplateCard from '@/components/templates/TemplateCard.jsx';
import TemplatePreviewDialog from '@/components/templates/TemplatePreviewDialog.jsx';
import { TEMPLATE_COLLECTIONS } from '@/data/templates.js';
import { useSeoMetadata } from '@/lib/seo.js';
import { useMemo, useState } from 'react';

const HOW_IT_WORKS_STEPS = [
  {
    title: 'Tell Us Your Idea',
    description: 'Describe the workflow you want in plain language. We take it from there.'
  },
  {
    title: 'Watch the Magic Happen',
    description: 'Questit builds a working micro-tool for you in seconds—no code required.'
  },
  {
    title: 'Try It & Refine',
    description: 'Test your tool instantly and ask Questit to tweak anything you need.'
  },
  {
    title: 'Save & Share',
    description: 'Publish with one click, share the link, or keep iterating in the workbench.'
  }
];

const VALUE_PROPS = [
  {
    title: 'Your Data Stays Private',
    description: 'Questit tools run in your browser first, with optional cloud sync on your terms.'
  },
  {
    title: 'Describe, Don’t Configure',
    description: 'Plain-language prompts become working tools with validation and UI included.'
  },
  {
    title: 'Works Instantly Anywhere',
    description: 'Desktop, tablet, or phone—tools load fast and offline-friendly once generated.'
  },
  {
    title: 'Make It Yours',
    description: 'Pick from polished themes, tweak copy, and publish with your own branding.'
  },
  {
    title: 'Share on Your Terms',
    description: 'Keep tools private, gate with passphrases, or publish to the world in a click.'
  },
  {
    title: 'Built to Scale',
    description: 'Edge-hosted previews and CDN caching keep tools snappy for you and your audience.'
  }
];

const MEMORY_PAIN_POINTS = [
  'You enter the same data every time you reopen a tool.',
  'Settings reset whenever you refresh or switch devices.',
  'You lose history, trends, and progress the moment the session ends.'
];

const MEMORY_SOLUTIONS = [
  'Questit tools can remember locally on your device or securely in your account.',
  'Preferences, entries, and history persist—even after closing the tab.',
  'Switch devices and pick up right where you left off when you sign in.'
];

const BUILD_CATEGORIES = [
  {
    title: 'Trackers',
    examples: ['Habit tracker', 'Water log', 'Spending journal']
  },
  {
    title: 'Planners',
    examples: ['Meal planner', 'Study schedule', 'Weekly sprint plan']
  },
  {
    title: 'Utilities',
    examples: ['Recipe scaler', 'Quick timer', 'Word counter']
  },
  {
    title: 'Generators',
    examples: ['Random idea prompts', 'Password helper', 'Color palette builder']
  },
  {
    title: 'Workflows',
    examples: ['Client onboarding checklist', 'Bug triage board', 'Content calendar']
  }
];

const FAQ_ITEMS = [
  {
    question: 'Do I need an account to try Questit?' ,
    answer:
      'No. You can open the workbench or any template instantly. Create an account only if you want to save tools or sync memory across devices.'
  },
  {
    question: 'Where is my data stored?' ,
    answer:
      'By default data stays in your browser. You can opt into device memory or signed-in memory powered by Supabase, which you control.'
  },
  {
    question: 'Can I share the tools I build?' ,
    answer:
      'Yes. Publish with a public link, require a passphrase, or keep it private for yourself. You can unpublish at any time.'
  },
  {
    question: 'What does it cost?' ,
    answer:
      'Questit is free while we build out early access. Paid plans with unlimited tools and cloud sync are coming soon.'
  }
];

function selectFeaturedTemplates(limit = 6) {
  const templates = [];
  for (const collection of TEMPLATE_COLLECTIONS) {
    templates.push(...collection.templates);
    if (templates.length >= limit) break;
  }
  return templates.slice(0, limit);
}

export default function LandingPage() {
  useSeoMetadata({
    title: 'Questit · Tools that remember you',
    description:
      'Questit instantly builds personal tools that remember your data, preferences, and history. Describe it once, use it forever.',
    url: typeof window !== 'undefined' ? window.location.href : 'https://questit.cc/'
  });

  const featuredTemplates = useMemo(() => selectFeaturedTemplates(6), []);
  const templatesCount = useMemo(() => {
    let count = 0;
    for (const collection of TEMPLATE_COLLECTIONS) {
      count += collection.templates.length;
    }
    return count;
  }, []);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 py-16 sm:px-6 sm:py-20">
        <section className="text-center">
          <Badge variant="outline" className="mx-auto mb-6 flex w-fit items-center gap-2">
            <span className="text-sm">✨ Powered by Questit AI</span>
            <span className="text-xs text-muted-foreground">{templatesCount}+ real templates</span>
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Tools That Remember You
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Create personal tools that save your data, preferences, and history. Describe it once, come back anytime, and pick up right where you left off.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/build">Try It Now – No Signup Required</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/templates">Explore Templates</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
            {featuredTemplates.slice(0, 4).map((template) => (
              <Button
                key={template.id}
                variant="secondary"
                size="sm"
                className="rounded-full"
                onClick={() => setPreviewTemplate(template)}
              >
                {template.title}
              </Button>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight">How It Works</h2>
            <p className="mt-2 text-base text-muted-foreground">
              From idea to working tool in less than a minute
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <Surface
                key={step.title}
                muted
                className="flex h-full flex-col gap-3 rounded-2xl border border-border/40 bg-background/80 p-6 shadow-sm"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                  {index + 1}
                </span>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </Surface>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <Surface className="flex h-full flex-col gap-4 rounded-3xl border border-destructive/20 bg-destructive/5 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-destructive">Why most tools fail you</h2>
            <p className="text-sm text-muted-foreground">
              You launch a tool, fill it out, and the next time you open it everything is gone. Sound familiar?
            </p>
            <ul className="space-y-3 text-sm text-destructive">
              {MEMORY_PAIN_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span aria-hidden>✖</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </Surface>
          <Surface className="flex h-full flex-col gap-4 rounded-3xl border border-primary/20 bg-primary/5 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-primary">How Questit is different</h2>
            <p className="text-sm text-muted-foreground">
              Every Questit tool can remember what matters—without you wiring up databases or auth.
            </p>
            <ul className="space-y-3 text-sm text-foreground">
              {MEMORY_SOLUTIONS.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span aria-hidden>✔</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <div>
              <Button asChild>
                <Link to="/tools">See published examples</Link>
              </Button>
            </div>
          </Surface>
        </section>

        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight">See the memory in action</h2>
            <p className="mt-2 text-base text-muted-foreground">
              Watch a tool remember entries across refreshes—no setup required.
            </p>
          </div>
          <Surface className="relative overflow-hidden rounded-3xl border border-border/40 bg-background/80 shadow-lg">
            <div className="aspect-video w-full bg-muted">
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                <span className="text-base font-medium text-foreground">Memory demo coming soon</span>
                <span className="text-xs">We’re recording a walkthrough to showcase tool persistence.</span>
              </div>
            </div>
          </Surface>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-3 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Try One of These Ideas</h2>
            <p className="text-base text-muted-foreground">
              Click any card to start building instantly—no signup required.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onPreview={() => setPreviewTemplate(template)}
                onUse={() => {
                  window.location.href = `/build?template=${encodeURIComponent(template.id)}`;
                }}
              />
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Why People Love Questit</h2>
            <p className="mt-2 text-base text-muted-foreground">
              Simple to use, powerful enough for anything
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VALUE_PROPS.map((item) => (
              <Surface
                key={item.title}
                muted
                className="flex h-full flex-col gap-3 rounded-2xl border border-border/40 bg-background/80 p-6 shadow-sm"
              >
                <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </Surface>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight">What people build</h2>
            <p className="mt-2 text-base text-muted-foreground">
              Questit works for personal habits, team workflows, and everything in between.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BUILD_CATEGORIES.map((category) => (
              <Surface
                key={category.title}
                muted
                className="flex h-full flex-col gap-3 rounded-2xl border border-border/40 bg-background/80 p-6 shadow-sm"
              >
                <h3 className="text-base font-semibold text-foreground">{category.title}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {category.examples.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span aria-hidden>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Surface>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Transparent pricing</h2>
            <p className="mt-2 text-base text-muted-foreground">
              We’re in early access—here’s what you get today and what’s coming next.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Surface className="flex h-full flex-col gap-4 rounded-2xl border border-border/50 bg-background/80 p-6 shadow-sm">
              <div>
                <Badge variant="outline" className="mb-3">Free</Badge>
                <h3 className="text-xl font-semibold">Starter</h3>
                <p className="text-sm text-muted-foreground">Try Questit with no credit card required.</p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Build up to 5 personal tools</li>
                <li>• Local device memory included</li>
                <li>• Publish via share links</li>
              </ul>
              <div className="mt-auto text-2xl font-semibold">$0</div>
            </Surface>
            <Surface className="flex h-full flex-col gap-4 rounded-2xl border border-primary/40 bg-primary/10 p-6 shadow-sm">
              <div>
                <Badge className="mb-3">Early Access</Badge>
                <h3 className="text-xl font-semibold">Personal</h3>
                <p className="text-sm text-muted-foreground">
                  Unlimited tools, cloud sync, and priority support—launching soon.
                </p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Unlimited personal tools</li>
                <li>• Cross-device memory with Supabase</li>
                <li>• Advanced publish analytics</li>
              </ul>
              <div className="mt-auto text-sm text-muted-foreground">Join the waitlist to lock in founder pricing.</div>
              <Button variant="secondary" disabled>
                Waitlist coming soon
              </Button>
            </Surface>
          </div>
        </section>

        <section>
          <Surface className="rounded-3xl border border-primary/20 bg-primary/10 p-10 text-center shadow-lg">
            <h2 className="text-2xl font-semibold text-primary-foreground dark:text-primary-foreground/90">
              Ready to Create Something?
            </h2>
            <p className="mt-3 text-base text-primary-foreground/80 dark:text-primary-foreground/70">
              Join thousands of people bringing their ideas to life. Start building in seconds.
            </p>
            <div className="mt-6 flex justify-center">
              <Button size="lg" asChild>
                <Link to="/build">Get Started Free</Link>
              </Button>
            </div>
          </Surface>
        </section>

        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Questions?</h2>
            <p className="mt-2 text-base text-muted-foreground">Here’s what people ask before they start.</p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item) => (
              <AccordionItem key={item.question} value={item.question} className="border border-border/40">
                <AccordionTrigger className="px-4 text-left text-base font-semibold text-foreground">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>

      <TemplatePreviewDialog
        template={previewTemplate}
        open={Boolean(previewTemplate)}
        onOpenChange={(open) => {
          if (!open) setPreviewTemplate(null);
        }}
      />
    </div>
  );
}
