import { useToast } from '@/components/ui/use-toast';

export function useToast() {
  return {
    toast: (props: { title?: string; description?: string; variant?: 'default' | 'destructive' }) => {
      console.log(`Toast: ${props.title} - ${props.description}`);
    },
  };
}