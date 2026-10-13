import { Link } from 'react-router';
import { ChevronRight, Package, Truck, Store } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { formatDateTime, formatMoney } from '@/shared/lib/formatters';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { OrderSummary } from '../types/orders.types';

interface OrderCardProps {
  order: OrderSummary;
}

export function OrderCard({ order }: OrderCardProps) {
  const isDelivery = order.fulfillmentType === 'delivery';

  return (
    <Card className="hover:border-primary/40 hover:shadow-sm transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-base text-foreground tracking-tight">
              #{order.orderCode}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {formatDateTime(order.placedAt)}
            </span>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isDelivery ? (
                <>
                  <Truck className="w-4 h-4 text-primary" />
                  <span>Giao tận nơi</span>
                </>
              ) : (
                <>
                  <Store className="w-4 h-4 text-primary" />
                  <span>Lấy tại quán</span>
                </>
              )}
              <span>•</span>
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                <span>{order.itemCount} món</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-muted-foreground">Tổng tiền:</span>
              <span className="text-base font-bold text-primary">
                {formatMoney(order.totalAmount)}
              </span>
            </div>
          </div>

          <Button asChild variant="outline" size="sm" className="self-end sm:self-auto group">
            <Link to={`/orders/${order.orderCode}`} className="flex items-center gap-1">
              <span>Xem chi tiết</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
