import { Surface } from '@/components/layout';

const SUGGESTIONS = [
  {
    id: 'shopping-categories',
    icon: '🛍️',
    text: 'A shopping list with categories',
    prompt:
      'Create a shopping list app where I can add items under categories like Produce, Dairy, and Snacks, with checkboxes.'
  },
  {
    id: 'pomodoro',
    icon: '⏱️',
    text: 'A Pomodoro timer for focus',
    prompt:
      'Build a Pomodoro timer with start/pause, a round counter, and configurable focus/break durations.'
  },
  {
    id: 'palette',
    icon: '🎨',
    text: 'A color palette generator',
    prompt:
      'Create a color palette generator that suggests harmonious colors and lets me copy hex codes.'
  }
];

export default function PrePromptPreview({ onUsePrompt }) {
  return (
    <div className="relative isolate overflow-hidden rounded-2xl border border-violet-300/40 bg-gradient-to-b from-white via-violet-50/60 to-white p-8 text-center dark:from-slate-900 dark:via-violet-950/30 dark:to-slate-900">
      <div className="mx-auto max-w-md space-y-4">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-100 text-2xl shadow-sm dark:bg-violet-900/40">
          ✨
        </div>
        <h3 className="text-2xl font-semibold text-violet-700 dark:text-violet-300">
          Ready to Create Magic?
        </h3>
        <p className="text-sm text-muted-foreground">
          Describe your idea, and I&apos;ll bring it to life in seconds. No coding needed!
        </p>

        <div className="flex flex-wrap justify-center gap-2 pt-1">
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium shadow-sm ring-1 ring-violet-200/60 dark:bg-slate-900/60 dark:ring-violet-900/40">
            ⚡ Lightning Fast
          </span>
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium shadow-sm ring-1 ring-violet-200/60 dark:bg-slate-900/60 dark:ring-violet-900/40">
            🎨 Beautiful Design
          </span>
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium shadow-sm ring-1 ring-violet-200/60 dark:bg-slate-900/60 dark:ring-violet-900/40">
            💪 Easy to Use
          </span>
        </div>

        <p className="pt-4 text-xs text-muted-foreground">Try something like:</p>

        <div className="space-y-3">
          {SUGGESTIONS.map((s) => (
            <Surface
              key={s.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-violet-200/60 bg-white/80 px-4 py-3 text-left shadow-sm transition hover:bg-white dark:border-violet-900/40 dark:bg-slate-900/60 dark:hover:bg-slate-900"
              onClick={() => onUsePrompt?.(s.prompt)}
            >
              <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-violet-100 text-base dark:bg-violet-900/50">
                {s.icon}
              </span>
              <div className="text-sm text-foreground">{s.text}</div>
            </Surface>
          ))}
        </div>

        <p className="pt-4 text-xs text-muted-foreground">
          <span className="mr-1">⌨️</span> Start typing on the left to begin
        </p>
      </div>
    </div>
  );
}


