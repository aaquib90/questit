import { forwardRef } from 'react';
import { Sparkles, RotateCcw, Database } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const statusVariantMap = {
  idle: 'secondary',
  loading: 'secondary',
  success: 'default',
  error: 'destructive'
};

const PromptComposer = forwardRef(function PromptComposer(
  {
    value,
    onChange,
    onSubmit,
    disabled,
    isWorking,
    status,
    placeholder,
    onReset,
    canReset,
    onSave,
    hasGenerated,
    user,
    saveStatus,
    className = ''
  },
  ref
) {
  const handleSubmit = (event) => {
    event.preventDefault();
    if (disabled || !value?.trim()) return;
    onSubmit?.();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      if (!disabled && value?.trim()) {
        onSubmit?.();
      }
    }
  };

  const statusState = status?.state || 'idle';
  const statusMessage = status?.message || '';
  const badgeVariant = statusVariantMap[statusState] || 'secondary';

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant={badgeVariant} className="text-xs font-medium">
            {statusState === 'loading'
              ? 'Generating…'
              : statusState === 'success'
                ? 'Ready'
                : statusState === 'error'
                  ? 'Needs attention'
                  : 'Idle'}
          </Badge>
          {canReset ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 gap-2 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Reset
            </Button>
          ) : null}
        </div>
        <Textarea
          ref={ref}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[160px] resize-y text-sm leading-relaxed"
          disabled={disabled}
        />
        <p className="text-[11px] text-muted-foreground">
          Press <span className="font-medium">⌘ / Ctrl + Enter</span> to submit quickly.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {statusMessage ? (
          <Alert
            variant={statusState === 'error' ? 'destructive' : 'secondary'}
            className="border border-primary/20 bg-background/80 text-xs"
          >
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            type="submit"
            size="lg"
            disabled={disabled || isWorking || !value?.trim()}
            className="w-full gap-2 sm:w-auto"
          >
            <Sparkles className={`h-4 w-4 ${isWorking ? 'animate-spin' : ''}`} aria-hidden />
            {isWorking ? 'Generating…' : 'Send to Questit'}
          </Button>
          {hasGenerated && onSave ? (
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={onSave}
              disabled={!user || saveStatus?.state === 'loading'}
              className="w-full gap-2 sm:w-auto"
            >
              <Database className="h-4 w-4" aria-hidden />
              {saveStatus?.state === 'loading' ? 'Saving…' : 'Save to Supabase'}
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  );
});

export default PromptComposer;
