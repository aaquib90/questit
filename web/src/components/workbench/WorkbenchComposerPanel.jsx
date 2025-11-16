import { forwardRef, useMemo, useState } from 'react';

import { Surface } from '@/components/layout';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import AdvancedControlsDrawer from '@/components/workbench/AdvancedControlsDrawer.jsx';
import { BookmarkPlus, Sparkles, Settings2 } from 'lucide-react';

const WorkbenchComposerPanel = forwardRef(function WorkbenchComposerPanel(
  {
    composerValue,
    setComposerValue,
    onSubmit,
    isGenerating,
    hasGenerated,
    onSaveTool,
    modelId,
    setModelId,
    modelOptions,
    memorySettings,
    onChangeMemorySettings,
    memoryModeOptions,
    memoryRetentionOptions
  },
  ref
) {
  const [showSettings, setShowSettings] = useState(false);
  const canSaveTool = hasGenerated && typeof onSaveTool === 'function';

  const adaptivePlaceholder = useMemo(() => {
    return 'e.g., Create a password generator with options for length and special characters...';
  }, []);

  const INSPIRATIONS = [
    {
      id: 'shopping',
      icon: '🛒',
      title: 'Shopping list tracker',
      prompt:
        'Create a simple shopping list tracker where I can add items and check them off, grouped by store sections.'
    },
    {
      id: 'mood',
      icon: '😊',
      title: 'Mood journal',
      prompt:
        'Make a mood journal where I pick an emoji for each day and add a quick note, with a weekly trend.'
    },
    {
      id: 'recipe',
      icon: '🧪',
      title: 'Recipe scaler',
      prompt:
        'Create a recipe scaler that adjusts ingredient amounts up or down based on the number of servings.'
    },
    {
      id: 'caffeine',
      icon: '☕',
      title: 'Caffeine tracker',
      prompt:
        'Build a caffeine tracker that lets me log drinks and shows my intake for the day with a gentle limit warning.'
    },
    {
      id: 'gratitude',
      icon: '💖',
      title: 'Gratitude journal',
      prompt:
        'Design a gratitude journal that prompts me for three highlights each day and shows a weekly recap.'
    },
    {
      id: 'timer',
      icon: '⚡',
      title: 'Quick timer',
      prompt:
        'Make a quick timer with 5, 10, 15, and 30 minute presets and a gentle alert sound when time is up.'
    }
  ];

  return (
    <Surface id="questit-composer" className="flex h-full flex-col space-y-6 p-6">
      <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/30 p-4 sm:p-6">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">Your Idea</h2>
          <div className="space-y-2">
            <Label htmlFor="questit-composer-textarea" className="sr-only">
              Your idea
            </Label>
            <Textarea
              id="questit-composer-textarea"
              ref={ref}
              value={composerValue}
              onChange={(event) => setComposerValue(event.target.value)}
              placeholder={adaptivePlaceholder}
              className="min-h-[140px] resize-y text-sm leading-relaxed"
              disabled={isGenerating}
            />
            <p className="text-[11px] text-muted-foreground">
              <span className="mr-1">💡</span> Tip: Be specific about what you want—the more details, the
              better!
            </p>
          </div>
          <div className="pt-1 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              size="lg"
              disabled={isGenerating || !composerValue?.trim()}
              onClick={onSubmit}
              className="w-full gap-2 bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white hover:from-fuchsia-500/90 hover:to-violet-500/90"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              Generate Tool
            </Button>
            {canSaveTool ? (
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={onSaveTool}
                className="w-full gap-2 text-sm font-semibold"
              >
                <BookmarkPlus className="h-4 w-4" aria-hidden />
                Save tool
              </Button>
            ) : null}
          </div>
          <div className="flex items-center justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-2 text-xs"
              onClick={() => setShowSettings((v) => !v)}
            >
              <Settings2 className="h-3.5 w-3.5" aria-hidden />
              {showSettings ? 'Hide Settings' : 'Show Settings'}
            </Button>
          </div>
          {showSettings ? (
            <AdvancedControlsDrawer
              modelOptions={modelOptions}
              selectedModelId={modelId}
              onSelectModel={setModelId}
              memorySettings={memorySettings}
              onChangeMemorySettings={onChangeMemorySettings}
              memoryModeOptions={memoryModeOptions}
              memoryRetentionOptions={memoryRetentionOptions}
            />
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-center text-sm text-muted-foreground">
          Need some inspiration? Try one of these:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {INSPIRATIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-left shadow-sm transition hover:bg-background"
              onClick={() => setComposerValue(item.prompt)}
              title={item.title}
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-muted text-base">
                {item.icon}
              </span>
              <div>
                <div className="text-sm font-medium text-foreground">{item.title}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Surface>
  );
});

export default WorkbenchComposerPanel;
