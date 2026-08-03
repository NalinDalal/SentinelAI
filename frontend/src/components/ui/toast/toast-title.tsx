import * as React from 'react';
import { cn } from '@/lib/utils';

const ToastTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
);
ToastTitle.displayName = 'ToastTitle';

export { ToastTitle };