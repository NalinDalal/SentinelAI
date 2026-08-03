import * as React from 'react';
import { ToastClose } from '@radix-ui/react-toast';
import { cn } from '@/lib/utils';

const ToastClose = React.forwardRef<React.ElementRef<typeof ToastClose>, React.ComponentPropsWithoutRef<typeof ToastClose>>(
  ({ className, ...props }, ref) => (
    <ToastClose ref={ref} className={cn('absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100', className)} {...props} />
  ),
);
ToastClose.displayName = 'ToastClose';

export { ToastClose };