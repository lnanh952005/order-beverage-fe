import { useParams, Link } from 'react-router';
import {
  ArrowLeft,
  RefreshCw,
  User,
  CreditCard,
  Truck,
  Store,
  Clock,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ErrorState, Skeleton } from '@/shared/components/feedback';
import { formatDateTime, formatMoney } from '@/shared/lib/formatters';
import {
  AdminOrderStatusActions,
  OrderStatusBadge,
} from '../../components';
import { useOrder } from '../../hooks/useOrder';
import { useUpdateOrderStatus } from '../../hooks/useUpdateOrderStatus';
import { useCancelOrder } from '../../hooks/useCancelOrder';
import { PaymentStatusBadge, RefundPaymentDialog } from '@/features/payments';
import { useState } from 'react';

export function AdminOrderDetailPage() {
  const { orderCode } = useParams<{ orderCode: string }>();
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);

  const { data: order, isLoading, isError, refetch, isFetching } = useOrder(orderCode);
  const updateStatusMutation = useUpdateOrderStatus(orderCode ?? '');
  const cancelMutation = useCancelOrder(orderCode ?? '');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="py-12">
        <ErrorState
          onRetry={() => refetch()}
          title="Không tìm thấy đơn hàng"
          message={`Không thể tải thông tin đơn hàng #${orderCode}.`}
        />
        <div className="text-center mt-6">
          <Button asChild variant="outline">
            <Link to="/admin/orders">Quay lại danh sách đơn hàng</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isDelivery = order.fulfillmentType === 'delivery';
  const latestPayment = order.payments?.[order.payments.length - 1];

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground">
          <Link to="/admin/orders" className="flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh sách đơn hàng</span>
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>

          <AdminOrderStatusActions
            orderCode={order.orderCode}
            status={order.status}
            fulfillmentType={order.fulfillmentType}
            onUpdateStatus={(newStatus, reason) =>
              updateStatusMutation.mutate({ status: newStatus, reason })
            }
            onCancel={(reason) => cancelMutation.mutate({ reason })}
            isLoading={updateStatusMutation.isPending || cancelMutation.isPending}
          />
        </div>
      </div>

      {/* Overview header */}
      <Card className="border border-border/80 shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Đơn hàng #{order.orderCode}
                </h1>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Thời gian đặt: {formatDateTime(order.placedAt)} • Cập nhật cuối: {formatDateTime(order.updatedAt)}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Tổng tiền</span>
              <span className="text-xl font-black text-primary">
                {formatMoney(order.totalAmount)}
              </span>
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
              <PaymentStatusBadge
                status={latestPayment?.status || 'unpaid'}
                className="text-[11px] px-2 py-0.5"
              />
            </div>

            <div>
              <span className="text-muted-foreground block mb-0.5">Số món:</span>
              <span className="font-semibold text-foreground">
                {order.items.reduce((s, i) => s + i.quantity, 0)} món
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer & Fulfillment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 pb-2 border-b border-border/60">
              <User className="w-4 h-4 text-primary" />
              <span>Khách hàng & Giao nhận</span>
            </h3>

            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>
                <strong className="text-foreground">Người nhận:</strong> {order.recipientName}
              </p>
              <p>
                <strong className="text-foreground">Số điện thoại:</strong> {order.recipientPhone}
              </p>
              {isDelivery ? (
                <p className="leading-relaxed">
                  <strong className="text-foreground">Địa chỉ giao:</strong> {order.deliveryAddress || 'Chưa có'}
                </p>
              ) : (
                <p className="text-primary font-medium">Nhận trực tiếp tại cửa hàng</p>
              )}
            </div>

            {order.note && (
              <div className="pt-2 border-t border-border/60 text-xs text-muted-foreground flex items-start gap-1.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-foreground">Ghi chú của khách:</strong> {order.note}
                </p>
              </div>
            )}

            {order.cancelReason && (
              <div className="p-2.5 rounded bg-destructive/10 text-destructive text-xs space-y-0.5">
                <p className="font-bold">Lý do hủy đơn:</p>
                <p>{order.cancelReason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial info */}
        <Card className="border border-border/80 shadow-xs">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 pb-2 border-b border-border/60">
              <CreditCard className="w-4 h-4 text-primary" />
              <span>Hạch toán đơn hàng</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính (Subtotal)</span>
                <span className="font-medium text-foreground">{formatMoney(order.subtotal)}</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Giảm giá khuyến mãi</span>
                  <span className="font-medium">-{formatMoney(order.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Phí giao hàng (Shipping)</span>
                <span className="font-medium text-foreground">
                  {order.shippingFee === 0 ? 'Miễn phí' : formatMoney(order.shippingFee)}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-border/60 text-sm">
                <span className="font-bold text-foreground">Tổng thu</span>
                <span className="font-black text-base text-primary">
                  {formatMoney(order.totalAmount)}
                </span>
              </div>
            </div>

            {latestPayment?.status === 'paid' && (
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRefundDialogOpen(true)}
                  className="w-full text-xs h-8 border-purple-500/40 text-purple-700 dark:text-purple-400 hover:bg-purple-500/10 flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Hoàn tiền giao dịch</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card className="border border-border/80 shadow-xs">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-sm text-foreground pb-2 border-b border-border/60">
            Danh sách món
          </h3>

          <div className="divide-y divide-border/60">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">{item.productName}</span>
                    {item.sizeName && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0 font-normal">
                        Size {item.sizeName}
                      </Badge>
                    )}
                    <span className="text-muted-foreground font-mono">×{item.quantity}</span>
                  </div>

                  {item.options && item.options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {item.options.map((opt) => (
                        <span key={opt.id} className="text-[11px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded">
                          {opt.optionName} {opt.priceDelta > 0 && `(+${formatMoney(opt.priceDelta)})`}
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

      {/* Audit Log / Status History */}
      <Card className="border border-border/80 shadow-xs">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5 pb-2 border-b border-border/60">
            <Clock className="w-4 h-4 text-primary" />
            <span>Lịch sử trạng thái & Thao tác (Audit Trail)</span>
          </h3>

          {order.statusHistory && order.statusHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Thời gian</th>
                    <th className="py-2.5 px-3">Từ trạng thái</th>
                    <th className="py-2.5 px-3">Sang trạng thái</th>
                    <th className="py-2.5 px-3">Người thực hiện</th>
                    <th className="py-2.5 px-3">Ghi chú / Lý do</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {order.statusHistory.map((sh) => (
                    <tr key={sh.id} className="hover:bg-muted/20">
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">
                        {formatDateTime(sh.createdAt)}
                      </td>
                      <td className="py-2.5 px-3">
                        {sh.fromStatus ? (
                          <OrderStatusBadge status={sh.fromStatus} showIcon={false} />
                        ) : (
                          <span className="text-muted-foreground italic">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <OrderStatusBadge status={sh.toStatus} showIcon={false} />
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {sh.changedBy ? `User #${sh.changedBy}` : 'Hệ thống'}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {sh.reason || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Chưa có lịch sử trạng thái.</p>
          )}
        </CardContent>
      </Card>

      {/* Refund dialog */}
      {latestPayment && (
        <RefundPaymentDialog
          open={refundDialogOpen}
          onOpenChange={setRefundDialogOpen}
          paymentId={latestPayment.id}
          orderCode={order.orderCode}
          maxAmount={latestPayment.amount || order.totalAmount}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
