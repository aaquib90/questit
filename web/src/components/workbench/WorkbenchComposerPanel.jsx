import { forwardRef } from 'react';

import { Surface } from '@/components/layout';
import PromptComposer from '@/components/workbench/PromptComposer.jsx';
import PromptTimeline from '@/components/workbench/PromptTimeline.jsx';
import { Badge } from '@/components/ui/badge';

const WorkbenchComposerPanel = forwardRef(function WorkbenchComposerPanel(
  {
    composerValue,
    setComposerValue,
    onSubmit,
    isGenerating,
    sessionStatus,
    hasHistory,
    hasGenerated,
    onResetSession,
    onSaveTool,
    user,
    saveStatus,
    sessionEntries,
    onUsePrompt,
    onRetryEntry
  },
  ref
) {
  const entryCount = sessionEntries.length;

  return (
    <div className="flex flex-col gap-6">
      <Surface id="questit-composer" className="space-y-6 p-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Tell us about the tool you need
          </h2>
          <p className="text-sm text-muted-foreground">
            Use friendly, everyday language. Mention what you want it to do and any important buttons or lists. Questit fills in the rest.
          </p>
        </div>
        <PromptComposer
          ref={ref}
          value={composerValue}
          onChange={setComposerValue}
          onSubmit={onSubmit}
          disabled={isGenerating}
          isWorking={isGenerating}
          status={sessionStatus}
          onReset={onResetSession}
          canReset={hasHistory || hasGenerated}
          onSave={onSaveTool}
          hasGenerated={hasGenerated}
          user={user}
          saveStatus={saveStatus}
          placeholder="For example: “Help me plan weekly meals with a spot for groceries.”"
          className="mt-2"
        />
      </Surface>

      <Surface muted className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.45em] text-muted-foreground">
            Conversation history
          </h3>
          {entryCount ? (
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
              {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
            </Badge>
          ) : null}
        </div>
        <div className="p-4">
          {entryCount ? (
            <PromptTimeline entries={sessionEntries} onUsePrompt={onUsePrompt} onRetry={onRetryEntry} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Each time you ask Questit to adjust something, the conversation will be saved here so you can revisit it.
            </p>
          )}
        </div>
      </Surface>
    </div>
  );
});

export default WorkbenchComposerPanel;
