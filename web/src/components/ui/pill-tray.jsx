import { cn } from '@/lib/utils.js';

export function PillTray({ as: Component = 'div', className = '', ...props }) {
  const Element = Component;
  return <Element className={cn('questit-pill-tray', className)} {...props} />;
}

