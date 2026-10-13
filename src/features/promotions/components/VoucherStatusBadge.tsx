import { cn } from '@/shared/lib/utils';
import type { Voucher } from '../types/promotions.types';

interface VoucherStatusBadgeProps {
  voucher: Pick<Voucher, 'isActive' | 'startsAt' | 'endsAt' | 'usageLimit' | 'usedCount'>;
  className?: string;
}

export function VoucherStatusBadge({ voucher, className }: VoucherStatusBadgeProps) {
  const now = new Date();
  const startsAt = new Date(voucher.startsAt);
  const endsAt = new Date(voucher.endsAt);

  if (!voucher.isActive) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border',
          className,
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
        Tạm dừng
      </span>
    );
  }

  if (!isNaN(endsAt.getTime()) && now > endsAt) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20',
          className,
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Hết hạn
      </span>
    );
  }

  if (
    voucher.usageLimit !== null &&
    voucher.usageLimit !== undefined &&
    voucher.usedCount >= voucher.usageLimit
  ) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
          className,
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Hết lượt dùng
      </span>
    );
  }

  if (!isNaN(startsAt.getTime()) && now < startsAt) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20',
          className,
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        Sắp diễn ra
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25',
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Đang diễn ra
    </span>
  );
}
