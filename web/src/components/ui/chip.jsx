import { cn } from '@/lib/utils.js';

export function Chip({ as: As = 'span', className = '', ...props }) {
  return <As className={cn('questit-chip', className)} {...props} />;
}


