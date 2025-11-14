import { cn } from '@/lib/utils.js';

export function Surface({ as: As = 'div', muted = false, className = '', ...props }) {
  return (
    <As className={cn(muted ? 'questit-surface-muted' : 'questit-surface', className)} {...props} />
  );
}


