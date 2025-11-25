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
  scopeDecisionLabel,
  scopeDecisionClasses,
  scopeReasons,
  scopeMetrics
}) {
  return (
    <div className="flex flex-col gap-6">
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

      {/* Progress summary surface removed per latest design */}
    </div>
  );
}
