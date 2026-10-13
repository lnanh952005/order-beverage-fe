import { useSearchParams, Link } from 'react-router';
import {
  Search,
  RefreshCw,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Truck,
  Store,
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { EmptyState, ErrorState, Skeleton } from '@/shared/components/feedback';
import { formatDateTime, formatMoney } from '@/shared/lib/formatters';
import { AdminOrderStatusActions, OrderStatusBadge } from '../../components';
import { useAdminOrders } from '../../hooks/useAdminOrders';
import { useUpdateOrderStatus } from '../../hooks/useUpdateOrderStatus';
import { useCancelOrder } from '../../hooks/useCancelOrder';
import type {
  AdminOrderSummary,
  FulfillmentType,
  OrderStatus,
} from '../../types/orders.types';

export function AdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const status = (searchParams.get('status') as OrderStatus) || undefined;
  const fulfillmentType = (searchParams.get('type') as FulfillmentType) || undefined;
  const q = searchParams.get('q') || '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const { data, isLoading, isError, refetch, isFetching } = useAdminOrders({
    status,
    fulfillmentType,
    q: q || undefined,
    page,
    limit: 15,
  });

  const orders = data?.data || [];
  const meta = data?.meta;

  const handleFilterChange = (key: string, val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!val || val === 'all') {
        next.delete(key);
      } else {
        next.set(key, val);
      }
      next.delete('page');
      return next;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(newPage));
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Điều phối đơn hàng (Orders Board)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Quản lý, điều phối và cập nhật tiến độ đơn hàng thời gian thực (tự động làm mới mỗi 15s)
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </Button>
      </div>

      {/* Filter toolbar */}
      <Card className="border border-border/80 shadow-xs">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Tìm mã đơn, SĐT..."
                defaultValue={q}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFilterChange('q', (e.target as HTMLInputElement).value.trim());
                  }
                }}
                className="pl-9 text-xs"
              />
            </div>

            {/* Status select */}
            <div>
              <select
                value={status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full h-9 px-3 py-1 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="preparing">Đang pha chế</option>
                <option value="ready">Sẵn sàng</option>
                <option value="delivering">Đang giao</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            {/* Fulfillment type */}
            <div>
              <select
                value={fulfillmentType || 'all'}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full h-9 px-3 py-1 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">Tất cả hình thức</option>
                <option value="delivery">Giao tận nơi</option>
                <option value="pickup">Lấy tại quán</option>
              </select>
            </div>

            {/* Clear filters */}
            {(status || fulfillmentType || q) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchParams(new URLSearchParams())}
                className="h-9 text-xs text-muted-foreground hover:text-foreground"
              >
                <Filter className="w-3.5 h-3.5 mr-1" />
                <span>Xóa bộ lọc</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
        </div>
      ) : isError ? (
        <ErrorState
          onRetry={() => refetch()}
          title="Không thể tải danh sách đơn hàng"
        />
      ) : orders.length === 0 ? (
        <EmptyState
          title="Không có đơn hàng nào"
          description="Không tìm thấy đơn hàng phù hợp với điều kiện tìm kiếm hiện tại."
        />
      ) : (
        <Card className="border border-border/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border/80 text-muted-foreground uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Mã đơn</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Hình thức</th>
                  <th className="py-3 px-4">Số lượng</th>
                  <th className="py-3 px-4">Tổng tiền</th>
                  <th className="py-3 px-4">Trạng thái đơn</th>
                  <th className="py-3 px-4">Thanh toán</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {orders.map((order) => (
                  <AdminOrderRow key={order.orderCode} order={order} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="p-4 flex items-center justify-between border-t border-border/60 text-xs">
              <span className="text-muted-foreground">
                Trang {meta.page} / {meta.totalPages} ({meta.total} đơn)
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={meta.page <= 1}
                  className="h-7 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                  <span>Trước</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={meta.page >= meta.totalPages}
                  className="h-7 text-xs"
                >
                  <span>Sau</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function AdminOrderRow({ order }: { order: AdminOrderSummary }) {
  const updateStatusMutation = useUpdateOrderStatus(order.orderCode);
  const cancelMutation = useCancelOrder(order.orderCode);

  const isDelivery = order.fulfillmentType === 'delivery';

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="py-3.5 px-4 font-mono font-bold text-foreground">
        <Link
          to={`/admin/orders/${order.orderCode}`}
          className="hover:underline text-primary"
        >
          #{order.orderCode}
        </Link>
        <span className="block text-[11px] text-muted-foreground font-sans font-normal mt-0.5">
          {formatDateTime(order.placedAt)}
        </span>
      </td>

      <td className="py-3.5 px-4">
        <span className="font-semibold text-foreground block">
          {order.recipientName || 'Khách vãng lai'}
        </span>
        <span className="text-[11px] text-muted-foreground font-mono">
          {order.recipientPhone}
        </span>
      </td>

      <td className="py-3.5 px-4">
        <span className="inline-flex items-center gap-1 text-[11px]">
          {isDelivery ? (
            <>
              <Truck className="w-3.5 h-3.5 text-primary" />
              <span>Giao tận nơi</span>
            </>
          ) : (
            <>
              <Store className="w-3.5 h-3.5 text-primary" />
              <span>Lấy tại quán</span>
            </>
          )}
        </span>
      </td>

      <td className="py-3.5 px-4 font-medium">{order.itemCount} món</td>

      <td className="py-3.5 px-4 font-bold text-foreground">
        {formatMoney(order.totalAmount)}
      </td>

      <td className="py-3.5 px-4">
        <OrderStatusBadge status={order.status} showIcon={false} />
      </td>

      <td className="py-3.5 px-4">
        <Badge
          variant={order.paymentStatus === 'paid' ? 'success' : 'secondary'}
          className="text-[10px] px-1.5 py-0"
        >
          {order.paymentStatus === 'paid' ? 'Đã TT' : 'Chưa TT'}
        </Badge>
      </td>

      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <AdminOrderStatusActions
            orderCode={order.orderCode}
            status={order.status}
            fulfillmentType={order.fulfillmentType}
            onUpdateStatus={(newStatus, reason) =>
              updateStatusMutation.mutate({ status: newStatus, reason })
            }
            onCancel={(reason) => cancelMutation.mutate({ reason })}
            isLoading={updateStatusMutation.isPending || cancelMutation.isPending}
            size="sm"
          />

          <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Link to={`/admin/orders/${order.orderCode}`}>
              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="sr-only">Xem chi tiết</span>
            </Link>
          </Button>
        </div>
      </td>
    </tr>
  );
}
