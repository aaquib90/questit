import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Surface } from '@/components/layout';
import { cn } from '@/lib/utils.js';

function ScopeMetric({ label, value }) {
  return (
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <span className="font-medium text-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

export default function WorkbenchSidebar({
  modelId,
  setModelId,
  modelOptions,
  onResetSession,
  canReset,
  sessionStateLabel,
  sessionStateClass,
  sessionStepCount,
  selectedModelLabel,
  selectedTheme,
  colorMode,
  resolvedMode,
  scopeDecisionLabel,
  scopeDecisionClasses,
  scopeReasons,
  scopeMetrics
}) {
  return (
    <div className="flex flex-col gap-6">
      <Surface muted className="space-y-4 p-5">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
            Your progress
          </span>
          <p className="text-lg font-semibold text-foreground">Current tool</p>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className={cn('font-medium', sessionStateClass)}>{sessionStateLabel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Updates so far</span>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {sessionStepCount}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Helper</span>
            <span className="max-w-[140px] truncate text-right">{selectedModelLabel}</span>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="justify-start px-0 text-sm text-muted-foreground transition hover:text-foreground"
          onClick={onResetSession}
          disabled={!canReset}
        >
          Reset session
        </Button>
      </Surface>

      <Surface muted className="space-y-3 p-5">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Choose your assistant</h3>
          <p className="text-xs text-muted-foreground">
            Pick the AI helper you prefer. Each one understands plain language.
          </p>
        </div>
        <Select value={modelId} onValueChange={setModelId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {modelOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Surface>

      <Surface muted className="space-y-3 p-5">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Quick check</h3>
          <p className="text-xs text-muted-foreground">
            Questit double-checks your request to be sure it’s a good fit. If something looks too large, we’ll suggest a tweak.
          </p>
        </div>
        <Badge className={cn('w-fit rounded-full px-3 py-1 text-xs font-medium', scopeDecisionClasses)}>
          {scopeDecisionLabel}
        </Badge>
        <ul className="space-y-1 text-xs text-muted-foreground">
          {scopeReasons.length === 0 ? (
            <li>No concerns detected.</li>
          ) : (
            scopeReasons.map((reason) => <li key={reason}>• {reason}</li>)
          )}
        </ul>
        <div className="space-y-1 rounded-lg border border-border/40 bg-background/60 p-3 text-xs text-muted-foreground">
          <ScopeMetric label="Estimated size" value={`${scopeMetrics.predictedFileCount} parts`} />
          <ScopeMetric label="How busy it is" value={`${scopeMetrics.predictedLoC.toLocaleString()} steps`} />
          <ScopeMetric label="File size" value={`${(scopeMetrics.bundleBytes / 1024).toFixed(0)} KB`} />
          <ScopeMetric
            label="Needs internet?"
            value={scopeMetrics.requiresNetwork ? 'Probably' : 'No'}
          />
        </div>
      </Surface>

      <Surface muted className="space-y-3 p-5">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Save or share</h3>
          <p className="text-xs text-muted-foreground">
            Create the tool first, then you can save it for later or share with other people.
          </p>
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>• “Save” keeps your tool in a private list.</p>
          <p>• “Share” gives you a link anyone can open in their browser.</p>
        </div>
      </Surface>
    </div>
  );
}
