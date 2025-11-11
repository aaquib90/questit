import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle2, Clock, Loader2, Undo2 } from 'lucide-react';

function statusConfig(status) {
  switch (status) {
    case 'pending':
      return { icon: Loader2, label: 'Generating', tone: 'text-primary', spin: true };
    case 'error':
      return { icon: AlertCircle, label: 'Failed', tone: 'text-destructive', spin: false };
    case 'success':
      return { icon: CheckCircle2, label: 'Ready', tone: 'text-emerald-500', spin: false };
    default:
      return { icon: Clock, label: 'Draft', tone: 'text-muted-foreground', spin: false };
  }
}

function PromptTimeline({ entries, onUsePrompt, onRetry }) {
  if (!entries?.length) {
    return (
      <div className="rounded-xl border border-dashed border-primary/20 bg-muted/20 p-6 text-sm text-muted-foreground">
        Prompts you send appear here with their status. Use the composer below to start a new
        session.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => {
        const { icon: StatusIcon, label, tone, spin } = statusConfig(entry.status);
        const createdAt = entry.createdAt ? new Date(entry.createdAt) : null;
        const timestamp = createdAt ? createdAt.toLocaleTimeString() : '';
        return (
          <div
            key={entry.id}
            className="space-y-3 rounded-xl border border-primary/20 bg-background/70 p-4 shadow-sm shadow-primary/5"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[11px] font-semibold uppercase tracking-wide">
                  Step {index + 1}
                </Badge>
                {timestamp ? (
                  <span className="text-[11px] text-muted-foreground">{timestamp}</span>
                ) : null}
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${tone}`}>
                <StatusIcon className={`h-3.5 w-3.5 ${spin ? 'animate-spin' : ''}`} aria-hidden />
                {label}
              </div>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {entry.prompt}
            </p>

            {entry.responseSummary ? (
              <p className="text-xs text-muted-foreground">{entry.responseSummary}</p>
            ) : null}

            {entry.error ? <p className="text-xs text-destructive">{entry.error}</p> : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={() => onUsePrompt?.(entry.prompt)}
                >
                  <Undo2 className="h-3.5 w-3.5" aria-hidden />
                  Use prompt
                </Button>
                {entry.status === 'error' ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={() => onRetry?.(entry)}
                  >
                    <Loader2 className="h-3.5 w-3.5" aria-hidden />
                    Retry
                  </Button>
                ) : null}
              </div>
              {entry.modelLabel ? (
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {entry.modelLabel}
                </span>
              ) : null}
            </div>

            {index < entries.length - 1 ? <Separator className="bg-border/60" /> : null}
          </div>
        );
      })}
    </div>
  );
}

export default PromptTimeline;
