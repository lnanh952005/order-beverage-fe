import { cn } from '@/shared/lib/utils';

interface VoucherUsageProgressProps {
  usedCount: number;
  usageLimit?: number | null;
  className?: string;
}

export function VoucherUsageProgress({
  usedCount,
  usageLimit,
  className,
}: VoucherUsageProgressProps) {
  if (usageLimit === null || usageLimit === undefined || usageLimit === 0) {
    return (
      <div className={cn('flex items-center gap-1.5 text-xs', className)}>
        <span className="font-semibold text-foreground">{usedCount}</span>
        <span className="text-muted-foreground">lượt (vô hạn)</span>
      </div>
    );
  }

  const percent = Math.min(100, Math.round((usedCount / usageLimit) * 100));
  const isNearlyFull = percent >= 85 && percent < 100;
  const isFull = percent >= 100;

  return (
    <div className={cn('space-y-1 min-w-[120px]', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">
          {usedCount} <span className="text-muted-foreground font-normal">/ {usageLimit}</span>
        </span>
        <span
          className={cn(
            'text-[10px] font-semibold',
            isFull
              ? 'text-rose-600 dark:text-rose-400'
              : isNearlyFull
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-muted-foreground',
          )}
        >
          {percent}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-300 rounded-full',
            isFull
              ? 'bg-rose-500'
              : isNearlyFull
                ? 'bg-amber-500'
                : 'bg-primary',
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
