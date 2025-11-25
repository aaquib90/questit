import { cn } from '@/lib/utils.js';
import { CheckCircle2, Loader2, TriangleAlert } from 'lucide-react';

function iconForState(state) {
  switch (state) {
    case 'loading':
      return Loader2;
    case 'error':
      return TriangleAlert;
    case 'success':
      return CheckCircle2;
    default:
      return null;
  }
}

export default function SyncBanner({ state = 'idle', message = '', className = '' }) {
  if (state === 'idle' && !message) return null;
  const Icon = iconForState(state);
  const tone =
    state === 'error'
      ? 'border-rose-300/70 bg-rose-50/70 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300'
      : state === 'success'
        ? 'border-emerald-300/70 bg-emerald-50/70 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300'
        : 'border-amber-300/70 bg-amber-50/70 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300';

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'mt-2 flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs shadow-sm',
        tone,
        className
      )}
    >
      {Icon ? (
        <Icon className={cn('h-3.5 w-3.5', state === 'loading' && 'animate-spin')} aria-hidden />
      ) : null}
      <span className="font-medium">
        {message ||
          (state === 'loading'
            ? 'Syncing…'
            : state === 'success'
              ? 'All changes synced'
              : 'Pending changes')}
      </span>
    </div>
  );
}


