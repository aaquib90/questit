import { cn } from '@/lib/utils.js';

export function Chip({ as: Component = 'span', className = '', ...props }) {
  const Element = Component;
  return <Element className={cn('questit-chip', className)} {...props} />;
}

