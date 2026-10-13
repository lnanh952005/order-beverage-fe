import * as React from 'react';
import { useParams, Link } from 'react-router';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Truck,
  Store,
  FileText,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ErrorState, Skeleton } from '@/shared/components/feedback';
import { formatDateTime, formatMoney } from '@/shared/lib/formatters';
import {
  CancelOrderDialog,
  OrderStatusBadge,
  OrderTimeline,
} from '../components';
import { useOrder } from '../hooks/useOrder';
import { useCancelOrder } from '../hooks/useCancelOrder';

export function OrderDetailPage() {
  const { orderCode } = useParams<{ orderCode: string }>();
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);

  const { data: order, isLoading, isError, refetch, isFetching } = useOrder(orderCode);
  const cancelOrderMutation = useCancelOrder(orderCode ?? '');

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="container mx-auto max-w-2xl py-16 px-4">
        <ErrorState
          onRetry={() => refetch()}
          title="Không tìm thấy đơn hàng"
          message={`Không thể tải thông tin đơn hàng #${orderCode}. Vui lòng kiểm tra lại mã đơn hàng hoặc kết nối mạng.`}
        />
        <div className="text-center mt-6">
          <Button asChild variant="outline">
            <Link to="/orders">Quay lại danh sách đơn hàng</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Customer cancellation rule: only pending or confirmed
  const canCustomerCancel = order.status === 'pending' || order.status === 'confirmed';
  const isDelivery = order.fulfillmentType === 'delivery';
  const latestPayment = order.payments?.[order.payments.length - 1];

  const handleConfirmCancel = async (reason?: string) => {
    await cancelOrderMutation.mutateAsync({ reason });
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 space-y-6">
      {/* Top navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground">
          <Link to="/orders" className="flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại lịch sử đơn</span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-xs text-muted-foreground flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </Button>
      </div>

      {/* Order Header Card */}
      <Card className="border border-border/80 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  Đơn hàng #{order.orderCode}
                </h1>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Đặt lúc: {formatDateTime(order.placedAt)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <OrderStatusBadge status={order.status} />

              {canCustomerCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelDialogOpen(true)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  <span>Hủy đơn</span>
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
            <div>
              <span className="text-muted-foreground block mb-0.5">Hình thức:</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                {isDelivery ? <Truck className="w-3.5 h-3.5 text-primary" /> : <Store className="w-3.5 h-3.5 text-primary" />}
                {isDelivery ? 'Giao tận nơi' : 'Lấy tại quán'}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block mb-0.5">Thanh toán:</span>
              <span className="font-semibold text-foreground uppercase">
                {order.payments?.[0]?.method || 'cod'}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block mb-0.5">Trạng thái TT:</span>
              <Badge
                variant={latestPayment?.status === 'paid' ? 'success' : 'secondary'}
                className="text-[11px] px-2 py-0.5"
              >
                {latestPayment?.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </Badge>
            </div>

            <div>
              <span className="text-muted-foreground block mb-0.5">Tổng thanh toán:</span>
              <span className="font-bold text-sm text-primary">
                {formatMoney(order.totalAmount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Timeline */}
      <OrderTimeline order={order} />

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recipient & Fulfillment info */}
        <Card className="border border-border/80 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 pb-2 border-b border-border/60">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Thông tin nhận hàng</span>
            </h3>

            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>
                <strong className="text-foreground">Người nhận:</strong> {order.recipientName} ({order.recipientPhone})
              </p>
              {isDelivery ? (
                <p className="leading-relaxed">
                  <strong className="text-foreground">Địa chỉ giao:</strong>{' '}
                  {order.deliveryAddress || 'Chưa cung cấp'}
                </p>
              ) : (
                <p className="leading-relaxed text-primary">
                  <strong>Nhận tại cửa hàng:</strong> 123 Đường Trà Sữa, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                </p>
              )}
            </div>

            {order.note && (
              <div className="pt-2 border-t border-border/60 text-xs text-muted-foreground flex items-start gap-1.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-foreground">Ghi chú:</strong> {order.note}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card className="border border-border/80 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 pb-2 border-b border-border/60">
              <CreditCard className="w-4 h-4 text-primary" />
              <span>Chi tiết thanh toán</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính</span>
                <span className="font-medium text-foreground">{formatMoney(order.subtotal)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Giảm giá</span>
                  <span className="font-medium">-{formatMoney(order.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Phí vận chuyển</span>
                <span className="font-medium text-foreground">
                  {order.shippingFee === 0 ? 'Miễn phí' : formatMoney(order.shippingFee)}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-border/60 text-sm">
                <span className="font-bold text-foreground">Tổng cộng</span>
                <span className="font-extrabold text-base text-primary">
                  {formatMoney(order.totalAmount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ordered Items List */}
      <Card className="border border-border/80 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-base text-foreground pb-3 border-b border-border/60">
            Danh sách món đã đặt ({order.items.reduce((s, i) => s + i.quantity, 0)} món)
          </h3>

          <div className="divide-y divide-border/60">
            {order.items.map((item) => (
              <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {item.productName}
                    </span>
                    {item.sizeName && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                        Size {item.sizeName}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground font-mono">
                      ×{item.quantity}
                    </span>
                  </div>

                  {item.options && item.options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {item.options.map((opt) => (
                        <span
                          key={opt.id}
                          className="text-[11px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded"
                        >
                          {opt.optionName}
                          {opt.priceDelta > 0 && ` (+${formatMoney(opt.priceDelta)})`}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-sm text-foreground">
                    {formatMoney(item.totalPrice)}
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    {formatMoney(item.unitPrice)} / ly
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <CancelOrderDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        orderCode={order.orderCode}
        onConfirm={handleConfirmCancel}
        isLoading={cancelOrderMutation.isPending}
      />
    </div>
  );
}
