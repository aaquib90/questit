import { createElement, forwardRef } from 'react';

import { cn } from '@/lib/utils.js';

const Shell = forwardRef(({ as: Component = 'div', className, ...props }, ref) =>
  createElement(Component, {
    ref,
    className: cn('questit-shell', className),
    ...props
  })
);

Shell.displayName = 'Shell';

export default Shell;
