import * as React from 'react';
import { ToastAction } from '@radix-ui/react-toast';
import { cn } from '@/lib/utils';

const ToastAction = React.forwardRef<React.ElementRef<typeof ToastAction>, React.ComponentPropsWithoutRef<typeof ToastAction>>(
  ({ className, ...props }, ref) => (
    <ToastAction ref={ref} className={cn('inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50', className)} {...props} />
  ),
);
ToastAction.displayName = 'ToastAction';

export { ToastAction };