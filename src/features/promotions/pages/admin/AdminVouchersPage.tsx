import { useState } from 'react';
import { Plus, Edit2, Eye, Power, Tag, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton, EmptyState, ErrorState } from '@/shared/components/feedback';
import { formatDate, formatMoney } from '@/shared/lib/formatters';
import { useAdminVouchers } from '../../hooks/useAdminVouchers';
import {
  useCreateVoucher,
  useUpdateVoucher,
  useToggleVoucherStatus,
} from '../../hooks/useVoucherMutations';
import { VoucherStatusBadge } from '../../components/VoucherStatusBadge';
import { VoucherUsageProgress } from '../../components/VoucherUsageProgress';
import { VoucherMetricsCards } from '../../components/VoucherMetricsCards';
import { VoucherSearchBar } from '../../components/VoucherSearchBar';
import { VoucherFormModal } from '../../components/VoucherFormModal';
import { VoucherDetailModal } from '../../components/VoucherDetailModal';
import type { Voucher } from '../../types/promotions.types';
import type { VoucherFormValues } from '../../schemas/promotions.schemas';

export function AdminVouchersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingVoucher, setViewingVoucher] = useState<Voucher | null>(null);

  // Copied code feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Queries & Mutations
  const isActiveParam = statusFilter === 'all' ? undefined : statusFilter === 'active';
  const { data, isLoading, isError, refetch } = useAdminVouchers({
    page,
    limit,
    q: searchQuery.trim() || undefined,
    isActive: isActiveParam,
  });

  const createMutation = useCreateVoucher();
  const updateMutation = useUpdateVoucher();
  const toggleMutation = useToggleVoucherStatus();

  const vouchers = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta ? Math.ceil(meta.total / limit) || 1 : 1;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenCreate = () => {
    setEditingVoucher(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setFormOpen(true);
  };

  const handleOpenDetail = (voucher: Voucher) => {
    setViewingVoucher(voucher);
    setDetailOpen(true);
  };

  const handleToggleStatus = async (voucher: Voucher) => {
    await toggleMutation.mutateAsync({
      id: voucher.id,
      isActive: !voucher.isActive,
    });
  };

  const handleFormSubmit = async (values: VoucherFormValues) => {
    if (editingVoucher) {
      await updateMutation.mutateAsync({
        id: editingVoucher.id,
        data: {
          code: values.code,
          description: values.description || null,
          discountType: values.discountType,
          discountValue: values.discountValue,
          maxDiscount: values.maxDiscount,
          minOrderValue: values.minOrderValue,
          usageLimit: values.usageLimit,
          startsAt: values.startsAt,
          endsAt: values.endsAt,
          isActive: values.isActive,
        },
      });
    } else {
      await createMutation.mutateAsync({
        code: values.code,
        description: values.description,
        discountType: values.discountType,
        discountValue: values.discountValue,
        maxDiscount: values.maxDiscount ?? undefined,
        minOrderValue: values.minOrderValue,
        usageLimit: values.usageLimit,
        startsAt: values.startsAt,
        endsAt: values.endsAt,
        isActive: values.isActive,
      });
    }
    setFormOpen(false);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Quản lý khuyến mãi & Voucher
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Thiết lập và theo dõi các mã giảm giá, chương trình ưu đãi đồ uống
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 rounded-xl cursor-pointer shrink-0">
          <Plus className="h-4 w-4" />
          <span>Thêm mã khuyến mãi</span>
        </Button>
      </div>

      {/* Metrics Summary Cards */}
      <VoucherMetricsCards vouchers={vouchers} totalFromMeta={meta?.total} />

      {/* Filter and Search Bar */}
      <VoucherSearchBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(status) => {
          setStatusFilter(status);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

      {/* Vouchers Table Container */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8">
            <ErrorState
              title="Không thể tải danh sách voucher"
              message="Đã có lỗi xảy ra trong quá trình lấy dữ liệu. Vui lòng thử lại."
              onRetry={refetch}
            />
          </div>
        ) : vouchers.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="Chưa có mã khuyến mãi nào"
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'Không tìm thấy voucher phù hợp với bộ lọc hiện tại.'
                  : 'Hãy tạo mã khuyến mãi đầu tiên để kích thích khách hàng đặt đồ uống!'
              }
              icon={<Tag className="h-8 w-8 text-muted-foreground" />}
              action={
                searchQuery || statusFilter !== 'all' ? (
                  <Button variant="outline" size="sm" onClick={handleResetFilters}>
                    Xóa bộ lọc
                  </Button>
                ) : (
                  <Button onClick={handleOpenCreate} size="sm">
                    Tạo voucher ngay
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Mã Voucher</th>
                  <th className="px-5 py-3.5">Mức giảm giá</th>
                  <th className="px-5 py-3.5">Đơn tối thiểu</th>
                  <th className="px-5 py-3.5">Tiến độ sử dụng</th>
                  <th className="px-5 py-3.5">Thời hạn</th>
                  <th className="px-5 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vouchers.map((voucher) => {
                  const isPercent = voucher.discountType === 'percent';
                  const isCopied = copiedCode === voucher.code;

                  return (
                    <tr
                      key={voucher.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Code & Description */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-sm tracking-wide text-primary">
                              {voucher.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(voucher.code)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                              title="Sao chép mã"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          {voucher.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                              {voucher.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Discount Value */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-foreground">
                            {isPercent
                              ? `${voucher.discountValue}%`
                              : formatMoney(Number(voucher.discountValue))}
                          </span>
                          {isPercent && voucher.maxDiscount && (
                            <p className="text-[11px] text-muted-foreground">
                              Tối đa {formatMoney(Number(voucher.maxDiscount))}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Min Order Value */}
                      <td className="px-5 py-4 text-xs">
                        {Number(voucher.minOrderValue) > 0 ? (
                          <span className="font-medium text-foreground">
                            {formatMoney(Number(voucher.minOrderValue))}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0 đ</span>
                        )}
                      </td>

                      {/* Usage Progress */}
                      <td className="px-5 py-4">
                        <VoucherUsageProgress
                          usedCount={voucher.usedCount}
                          usageLimit={voucher.usageLimit}
                        />
                      </td>

                      {/* Validity Period */}
                      <td className="px-5 py-4 text-xs text-muted-foreground space-y-0.5">
                        <div>
                          <span className="text-[10px] text-muted-foreground/70">Từ: </span>
                          <span>{formatDate(voucher.startsAt)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground/70">Đến: </span>
                          <span className="text-foreground font-medium">
                            {formatDate(voucher.endsAt)}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4">
                        <VoucherStatusBadge voucher={voucher} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetail(voucher)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(voucher)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Chỉnh sửa voucher"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(voucher)}
                            disabled={toggleMutation.isPending}
                            className={`h-8 w-8 p-0 cursor-pointer ${
                              voucher.isActive
                                ? 'text-emerald-600 hover:text-rose-600 hover:bg-rose-500/10'
                                : 'text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10'
                            }`}
                            title={voucher.isActive ? 'Tạm dừng voucher' : 'Kích hoạt voucher'}
                          >
                            <Power className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {meta && meta.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-border bg-card text-xs text-muted-foreground">
            <div>
              Hiển thị{' '}
              <span className="font-semibold text-foreground">
                {(page - 1) * limit + 1} - {Math.min(page * limit, meta.total)}
              </span>{' '}
              trong tổng số{' '}
              <span className="font-semibold text-foreground">{meta.total}</span> mã voucher
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 px-2 gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Trước</span>
              </Button>

              <span className="px-3 py-1 font-medium text-foreground">
                {page} / {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 px-2 gap-1"
              >
                <span className="hidden sm:inline">Sau</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Form Modal */}
      <VoucherFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        editingVoucher={editingVoucher}
        onSubmit={handleFormSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Voucher Detail Modal */}
      <VoucherDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        voucher={viewingVoucher}
        onEdit={handleOpenEdit}
      />
    </div>
  );
}
