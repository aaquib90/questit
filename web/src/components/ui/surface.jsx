import { cn } from '@/lib/utils.js';

export function Surface({ as: Component = 'div', muted = false, className = '', ...props }) {
  const Element = Component;
  return (
    <Element
      className={cn(muted ? 'questit-surface-muted' : 'questit-surface', className)}
      {...props}
    />
  );
}

