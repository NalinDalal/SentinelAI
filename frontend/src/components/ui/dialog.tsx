import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({ open: false, onOpenChange: () => {} });

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(({ className, children, open, onOpenChange, ...props }, ref) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open ?? internalOpen;

  return (
    <DialogContext.Provider value={{ open: isOpen, onOpenChange: onOpenChange ?? setInternalOpen }}>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" ref={ref} {...props}>
          <div className="relative bg-background rounded-lg shadow-lg border max-w-lg w-full mx-4">{children}</div>
        </div>
      )}
    </DialogContext.Provider>
  );
});
Dialog.displayName = 'Dialog';

const DialogHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-0', className)} {...props} />
));
DialogHeader.displayName = 'DialogHeader';

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
));
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
DialogDescription.displayName = 'DialogDescription';

const DialogContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6', className)} {...props} />
));
DialogContent.displayName = 'DialogContent';

export { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent };