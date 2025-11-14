import { createElement, forwardRef } from 'react';

import { cn } from '@/lib/utils.js';

const PillTray = forwardRef(({ as: Component = 'div', className, ...props }, ref) =>
  createElement(Component, {
    ref,
    className: cn('questit-pill-tray', className),
    ...props
  })
);

PillTray.displayName = 'PillTray';

export default PillTray;
