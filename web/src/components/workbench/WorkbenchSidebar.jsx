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
            Session
          </span>
          <p className="text-lg font-semibold text-foreground">Current build</p>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className={cn('font-medium', sessionStateClass)}>{sessionStateLabel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Steps</span>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {sessionStepCount}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Model</span>
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
          <h3 className="text-sm font-semibold text-foreground">Model selection</h3>
          <p className="text-xs text-muted-foreground">
            Choose the provider powering new generations.
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
          <h3 className="text-sm font-semibold text-foreground">Scope guidance</h3>
          <p className="text-xs text-muted-foreground">
            Questit checks each prompt against lightweight limits before calling the AI.
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
          <ScopeMetric label="Files" value={scopeMetrics.predictedFileCount} />
          <ScopeMetric label="Lines" value={scopeMetrics.predictedLoC.toLocaleString()} />
          <ScopeMetric label="Bundle" value={`${(scopeMetrics.bundleBytes / 1024).toFixed(0)} KB`} />
          <ScopeMetric
            label="Network?"
            value={scopeMetrics.requiresNetwork ? 'Likely' : 'Not needed'}
          />
        </div>
      </Surface>

      <Surface muted className="space-y-3 p-5">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Save or publish</h3>
          <p className="text-xs text-muted-foreground">
            Generate at least once to unlock Supabase save and publish actions.
          </p>
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>• Save to Supabase stores the latest code bundle.</p>
          <p>• Publish deploys to Workers for Platforms with theming intact.</p>
        </div>
      </Surface>
    </div>
  );
}
