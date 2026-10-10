import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface SpinnerProps {
  className?: string;
  size?: number;
}

export function Spinner({ className, size = 24 }: SpinnerProps) {
  return (
    <Loader2
      size={size}
      className={cn('animate-spin text-primary', className)}
      aria-label="Đang tải..."
    />
  );
}
