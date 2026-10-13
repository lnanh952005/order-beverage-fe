import * as React from 'react';
import {
  Clock,
  CheckCircle2,
  Coffee,
  PackageCheck,
  Truck,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { ORDER_STATUS_MAP, type OrderStatus } from '@/shared/constants/order-status';
import { cn } from '@/shared/lib/utils';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
  showIcon?: boolean;
}

const STATUS_ICONS: Record<OrderStatus, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  confirmed: CheckCircle2,
  preparing: Coffee,
  ready: PackageCheck,
  delivering: Truck,
  completed: CheckCircle,
  cancelled: XCircle,
};

export function OrderStatusBadge({
  status,
  className,
  showIcon = true,
}: OrderStatusBadgeProps) {
  const config = ORDER_STATUS_MAP[status] || {
    label: status,
    variant: 'secondary' as const,
    description: '',
  };
  const Icon = STATUS_ICONS[status];

  return (
    <Badge
      variant={config.variant}
      className={cn('inline-flex items-center gap-1.5 font-medium px-2.5 py-1', className)}
    >
      {showIcon && Icon && <Icon className="w-3.5 h-3.5" />}
      <span>{config.label}</span>
    </Badge>
  );
}
