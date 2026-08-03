import * as React from 'react';
import { ToastProvider as Provider, ToastViewport as Viewport } from '@/components/ui/toast';

export function Toaster() {
  return (
    <Provider>
      <Viewport />
    </Provider>
  );
}