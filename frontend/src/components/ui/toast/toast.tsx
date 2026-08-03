import * as React from 'react';
import { cn } from '@/lib/utils';

const Toast = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'destructive' }>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-top-full data-[state=closed]:slide-out-to-right-full sm:data-[state=open]:slide-in-from-bottom-full sm:data-[state=closed]:slide-out-to-bottom-full',
        variant === 'destructive'
          ? 'border-destructive bg-destructive text-destructive-foreground'
          : 'border-background bg-background text-foreground',
        className,
      )}
      {...props}
    />
  ),
);
Toast.displayName = 'Toast';

export { Toast };