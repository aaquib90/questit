import { forwardRef } from 'react';

import { Surface } from '@/components/layout';
import PromptComposer from '@/components/workbench/PromptComposer.jsx';

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
    saveStatus
  },
  ref
) {
  return (
    <Surface id="questit-composer" className="flex h-full flex-col space-y-6 p-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Tell us what you need
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
  );
});

export default WorkbenchComposerPanel;
