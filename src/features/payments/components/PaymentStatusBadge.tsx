import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { PaymentStatus } from '../types/payments.types';

interface PaymentStatusBadgeProps {
  status: PaymentStatus | string;
  className?: string;
}

const STATUS_CONFIG: Record<
  PaymentStatus,
  {
    label: string;
    variant: 'success' | 'secondary' | 'warning' | 'destructive' | 'outline';
    customClass?: string;
  }
> = {
  paid: {
    label: 'Đã thanh toán',
    variant: 'success',
  },
  unpaid: {
    label: 'Chưa thanh toán',
    variant: 'secondary',
  },
  pending: {
    label: 'Đang xử lý',
    variant: 'warning',
  },
  failed: {
    label: 'Thất bại',
    variant: 'destructive',
  },
  refunded: {
    label: 'Đã hoàn tiền',
    variant: 'outline',
    customClass:
      'border-purple-500/40 bg-purple-500/15 text-purple-700 dark:text-purple-400 font-semibold',
  },
};

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const config =
    STATUS_CONFIG[status as PaymentStatus] ?? {
      label: status,
      variant: 'secondary',
    };

  return (
    <Badge
      variant={config.variant}
      className={cn(config.customClass, className)}
    >
      {config.label}
    </Badge>
  );
}
