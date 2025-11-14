import { cn } from '@/lib/utils.js';

export function Section({ as: As = 'section', tight = false, className = '', ...props }) {
  return (
    <As
      className={cn('questit-section', tight && 'questit-section--tight', className)}
      {...props}
    />
  );
}


