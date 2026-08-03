import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px]',
      variant === 'destructive'
        ? 'border-danger/50 text-danger-foreground bg-danger/10'
        : 'border-border bg-background text-foreground',
      className,
    )}
    {...props}
  />
));
Alert.displayName = 'Alert';

export { Alert };