import * as React from 'react';
import {
  CheckCircle2,
  Coffee,
  PackageCheck,
  Truck,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { CancelOrderDialog } from './CancelOrderDialog';
import type { FulfillmentType, OrderStatus } from '../types/orders.types';

interface AdminOrderStatusActionsProps {
  orderCode: string;
  status: OrderStatus;
  fulfillmentType: FulfillmentType;
  onUpdateStatus: (newStatus: OrderStatus, reason?: string) => Promise<void> | void;
  onCancel: (reason?: string) => Promise<void> | void;
  isLoading?: boolean;
  size?: 'sm' | 'default';
  showCancel?: boolean;
}

export function AdminOrderStatusActions({
  orderCode,
  status,
  fulfillmentType,
  onUpdateStatus,
  onCancel,
  isLoading = false,
  size = 'default',
  showCancel = true,
}: AdminOrderStatusActionsProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);

  if (status === 'completed' || status === 'cancelled') {
    return null;
  }

  // Determine next step
  let nextStatus: OrderStatus | null = null;
  let nextLabel = '';
  let NextIcon: React.ComponentType<{ className?: string }> = CheckCircle2;

  switch (status) {
    case 'pending':
      nextStatus = 'confirmed';
      nextLabel = 'Xác nhận đơn';
      NextIcon = CheckCircle2;
      break;
    case 'confirmed':
      nextStatus = 'preparing';
      nextLabel = 'Bắt đầu pha chế';
      NextIcon = Coffee;
      break;
    case 'preparing':
      nextStatus = 'ready';
      nextLabel = 'Sẵn sàng';
      NextIcon = PackageCheck;
      break;
    case 'ready':
      if (fulfillmentType === 'delivery') {
        nextStatus = 'delivering';
        nextLabel = 'Bắt đầu giao';
        NextIcon = Truck;
      } else {
        nextStatus = 'completed';
        nextLabel = 'Hoàn thành';
        NextIcon = CheckCircle;
      }
      break;
    case 'delivering':
      nextStatus = 'completed';
      nextLabel = 'Hoàn thành';
      NextIcon = CheckCircle;
      break;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {nextStatus && (
        <Button
          size={size}
          disabled={isLoading}
          onClick={() => onUpdateStatus(nextStatus!)}
          className="flex items-center gap-1.5 font-medium shadow-xs"
        >
          <NextIcon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          <span>{nextLabel}</span>
        </Button>
      )}

      {showCancel && (
        <>
          <Button
            size={size}
            variant="outline"
            disabled={isLoading}
            onClick={() => setCancelDialogOpen(true)}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
          >
            <XCircle className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
            <span>Hủy đơn</span>
          </Button>

          <CancelOrderDialog
            open={cancelDialogOpen}
            onOpenChange={setCancelDialogOpen}
            orderCode={orderCode}
            onConfirm={onCancel}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}
