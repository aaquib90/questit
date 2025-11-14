import { cn } from '@/lib/utils.js';

export function PillTray({ as: As = 'div', className = '', ...props }) {
  return <As className={cn('questit-pill-tray', className)} {...props} />;
}


