import {
  Clock,
  CheckCircle2,
  Coffee,
  PackageCheck,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { formatDateTime } from '@/shared/lib/formatters';
import { cn } from '@/shared/lib/utils';
import type { OrderDetail, OrderStatus } from '../types/orders.types';

interface OrderTimelineProps {
  order: OrderDetail;
}

interface TimelineStep {
  status: OrderStatus;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const isCancelled = order.status === 'cancelled';
  const isDelivery = order.fulfillmentType === 'delivery';

  // Steps definition based on fulfillment type
  const steps: TimelineStep[] = [
    {
      status: 'pending',
      title: 'Đặt đơn hàng',
      description: 'Chờ quán xác nhận',
      icon: Clock,
    },
    {
      status: 'confirmed',
      title: 'Đã xác nhận',
      description: 'Quán đã tiếp nhận đơn',
      icon: CheckCircle2,
    },
    {
      status: 'preparing',
      title: 'Đang pha chế',
      description: 'Món đang được chuẩn bị',
      icon: Coffee,
    },
    {
      status: 'ready',
      title: 'Sẵn sàng',
      description: isDelivery ? 'Chờ tài xế lấy món' : 'Sẵn sàng để khách nhận',
      icon: PackageCheck,
    },
    ...(isDelivery
      ? [
          {
            status: 'delivering' as const,
            title: 'Đang giao hàng',
            description: 'Tài xế đang giao đến bạn',
            icon: Truck,
          },
        ]
      : []),
    {
      status: 'completed',
      title: 'Hoàn thành',
      description: 'Đơn hàng đã giao thành công',
      icon: CheckCircle,
    },
  ];

  // Helper to determine step status
  const statusOrder: OrderStatus[] = [
    'pending',
    'confirmed',
    'preparing',
    'ready',
    ...(isDelivery ? (['delivering'] as OrderStatus[]) : []),
    'completed',
  ];

  const currentStatusIndex = statusOrder.indexOf(order.status);

  // Map history by toStatus to show timestamps
  const historyMap = new Map<OrderStatus, { createdAt: string; reason?: string | null }>();
  (order.statusHistory || []).forEach((sh) => {
    historyMap.set(sh.toStatus, { createdAt: sh.createdAt, reason: sh.reason });
  });

  return (
    <Card className="border border-border/80 shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <h3 className="font-semibold text-base mb-6 text-foreground flex items-center justify-between">
          <span>Tiến trình đơn hàng</span>
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <span className="flex items-center gap-1.5 text-xs font-normal text-primary animate-pulse">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Đang cập nhật trực tiếp...
            </span>
          )}
        </h3>

        {isCancelled ? (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3 text-destructive">
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-sm">Đơn hàng này đã bị hủy</p>
              {order.cancelReason && (
                <p className="text-sm opacity-90">Lý do: {order.cancelReason}</p>
              )}
              {historyMap.get('cancelled')?.createdAt && (
                <p className="text-xs opacity-75">
                  Thời gian hủy: {formatDateTime(historyMap.get('cancelled')!.createdAt)}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {steps.map((step, idx) => {
              const isPassed = currentStatusIndex > idx;
              const isCurrent = currentStatusIndex === idx;
              const historyItem = historyMap.get(step.status);
              const Icon = step.icon;

              return (
                <div key={step.status} className="relative flex items-start gap-4 group">
                  {/* Icon circle */}
                  <div
                    className={cn(
                      'absolute -left-6 sm:-left-8 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all duration-300',
                      isPassed &&
                        'bg-primary border-primary text-primary-foreground shadow-sm',
                      isCurrent &&
                        'bg-background border-primary text-primary ring-4 ring-primary/20 animate-pulse',
                      !isPassed &&
                        !isCurrent &&
                        'bg-background border-muted text-muted-foreground',
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>

                  {/* Step content */}
                  <div className="flex-1 space-y-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <p
                        className={cn(
                          'text-sm font-semibold transition-colors',
                          isCurrent && 'text-primary font-bold',
                          isPassed && 'text-foreground',
                          !isPassed && !isCurrent && 'text-muted-foreground',
                        )}
                      >
                        {step.title}
                      </p>
                      {historyItem?.createdAt && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {formatDateTime(historyItem.createdAt)}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">{step.description}</p>

                    {historyItem?.reason && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 w-fit">
                        <AlertCircle className="w-3 h-3 text-muted-foreground/70" />
                        <span>{historyItem.reason}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
