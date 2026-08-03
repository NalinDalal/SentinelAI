import * as React from 'react';
import { cn } from '@/lib/utils';

const ToastDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
);
ToastDescription.displayName = 'ToastDescription';

export { ToastDescription };