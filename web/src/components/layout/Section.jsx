import { forwardRef } from 'react';

import { cn } from '@/lib/utils.js';

const Section = forwardRef(
  ({ as: Component = 'section', tight = false, className, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn('questit-section', tight && 'questit-section--tight', className)}
      {...props}
    />
  )
);

Section.displayName = 'Section';

export default Section;

