import { cn } from '@/lib/utils.js';

export function Section({ as: Component = 'section', tight = false, className = '', ...props }) {
  const Element = Component;
  return (
    <Element
      className={cn('questit-section', tight && 'questit-section--tight', className)}
      {...props}
    />
  );
}

