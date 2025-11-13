import { forwardRef } from 'react';

import { cn } from '@/lib/utils.js';

const Surface = forwardRef(({ muted = false, className, ...props }, ref) => (
  <div ref={ref} className={cn(getSurfaceClass(muted), className)} {...props} />
));

Surface.displayName = 'Surface';

function getSurfaceClass(muted) {
  return muted ? 'questit-surface-muted' : 'questit-surface';
}

export default Surface;
