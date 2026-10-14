import { useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import {
  Search,
  RefreshCw,
  Eye,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Receipt,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { EmptyState, ErrorState, Skeleton } from '@/shared/components/feedback';
import { formatDateTime, formatMoney } from '@/shared/lib/formatters';
import { ROUTE_PATHS } from '@/shared/constants/routes';
import {
  PaymentStatusBadge,
  PaymentDetailDialog,
  RefundPaymentDialog,
} from '../../components';
import { useAdminPayments } from '../../hooks/useAdminPayments';
import type { PaymentAdminDetail, PaymentStatus } from '../../types/payments.types';

export function AdminPaymentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const status = (searchParams.get('status') as PaymentStatus) || undefined;
  const method = searchParams.get('method') || undefined;
  const orderIdStr = searchParams.get('orderId') || '';
  const orderId = orderIdStr ? Number(orderIdStr) : undefined;
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [selectedPayment, setSelectedPayment] = useState<PaymentAdminDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [refundTarget, setRefundTarget] = useState<PaymentAdminDetail | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useAdminPayments({
    status,
    method,
    orderId,
    page,
    limit: 15,
  });

  const payments = data?.data || [];
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

  const handleOpenDetail = (payment: PaymentAdminDetail) => {
    setSelectedPayment(payment);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            <span>Quản lý thanh toán & giao dịch</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Theo dõi, tra cứu trạng thái giao dịch VNPay, COD và xử lý hoàn tiền cho khách hàng
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Filter by Order ID */}
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="number"
                placeholder="Lọc theo Order ID..."
                value={orderIdStr}
                onChange={(e) => handleFilterChange('orderId', e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            {/* Filter by Status */}
            <div>
              <Select
                value={status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="text-xs"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="paid">Đã thanh toán (Paid)</option>
                <option value="unpaid">Chưa thanh toán (Unpaid)</option>
                <option value="pending">Đang xử lý (Pending)</option>
                <option value="refunded">Đã hoàn tiền (Refunded)</option>
                <option value="failed">Thất bại (Failed)</option>
              </Select>
            </div>

            {/* Filter by Method */}
            <div>
              <Select
                value={method || 'all'}
                onChange={(e) => handleFilterChange('method', e.target.value)}
                className="text-xs"
              >
                <option value="all">Tất cả phương thức</option>
                <option value="vnpay">Cổng VNPay</option>
                <option value="cod">Tiền mặt (COD)</option>
                <option value="card">Thẻ (ATM / Visa)</option>
                <option value="e_wallet">Ví điện tử</option>
                <option value="bank_transfer">Chuyển khoản VietQR</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Không thể tải danh sách thanh toán"
          message="Đã có lỗi xảy ra trong quá trình truy vấn dữ liệu từ hệ thống."
          onRetry={() => refetch()}
        />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<Receipt className="w-10 h-10 text-muted-foreground/60" />}
          title="Không tìm thấy giao dịch nào"
          description="Hiện không có giao dịch thanh toán nào phù hợp với bộ lọc tìm kiếm của bạn."
        />
      ) : (
        <div className="space-y-4">
          <div className="border border-border/80 rounded-lg overflow-hidden bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border/80 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Đơn hàng</th>
                    <th className="py-3 px-4">Khách hàng</th>
                    <th className="py-3 px-4">Phương thức</th>
                    <th className="py-3 px-4">Số tiền</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4">Mã GD Cổng</th>
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {payments.map((p) => {
                    const orderCode = p.order?.orderCode;
                    return (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-foreground">
                          #{p.id}
                        </td>
                        <td className="py-3 px-4">
                          {orderCode ? (
                            <Link
                              to={ROUTE_PATHS.ADMIN_ORDER_DETAIL(orderCode)}
                              className="font-bold text-primary hover:underline"
                            >
                              #{orderCode}
                            </Link>
                          ) : (
                            <span className="font-mono text-muted-foreground">
                              Order #{p.orderId}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">
                            {p.order?.recipientName || '—'}
                          </div>
                          {p.order?.recipientPhone && (
                            <div className="text-[11px] text-muted-foreground">
                              {p.order.recipientPhone}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold uppercase tracking-wider text-muted-foreground">
                            {p.method}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-foreground">
                          {formatMoney(p.amount)}
                        </td>
                        <td className="py-3 px-4">
                          <PaymentStatusBadge status={p.status} />
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                          {p.providerTxnId || '—'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {formatDateTime(p.paidAt || p.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDetail(p)}
                              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline ml-1">Chi tiết</span>
                            </Button>

                            {p.status === 'paid' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRefundTarget(p)}
                                className="h-7 px-2 text-xs border-purple-500/40 text-purple-700 dark:text-purple-400 hover:bg-purple-500/10"
                                title="Hoàn tiền"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline ml-1">Hoàn tiền</span>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 pt-2">
              <span className="text-xs text-muted-foreground">
                Trang {meta.page} / {meta.totalPages} ({meta.total} giao dịch)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="h-8 px-2.5 text-xs flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Trước</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= meta.totalPages}
                  className="h-8 px-2.5 text-xs flex items-center gap-1"
                >
                  <span>Sau</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details dialog */}
      <PaymentDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        payment={selectedPayment}
      />

      {/* Direct refund dialog */}
      {refundTarget && (
        <RefundPaymentDialog
          open={Boolean(refundTarget)}
          onOpenChange={(open) => !open && setRefundTarget(null)}
          paymentId={refundTarget.id}
          orderCode={refundTarget.order?.orderCode}
          maxAmount={refundTarget.amount}
          onSuccess={() => {
            setRefundTarget(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
