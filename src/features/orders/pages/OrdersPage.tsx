import { useSearchParams, Link } from 'react-router';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { EmptyState, ErrorState, Skeleton } from '@/shared/components/feedback';
import { cn } from '@/shared/lib/utils';
import { OrderCard } from '../components';
import { useOrders } from '../hooks/useOrders';
import type { OrderStatus } from '../types/orders.types';

const STATUS_TABS: { label: string; value: string; status?: OrderStatus }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ duyệt', value: 'pending', status: 'pending' },
  { label: 'Đang làm món', value: 'preparing', status: 'preparing' },
  { label: 'Đang giao', value: 'delivering', status: 'delivering' },
  { label: 'Hoàn thành', value: 'completed', status: 'completed' },
  { label: 'Đã hủy', value: 'cancelled', status: 'cancelled' },
];

export function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = searchParams.get('tab') || 'all';
  const currentPage = Math.max(1, Number(searchParams.get('page')) || 1);
  const activeTabConfig = STATUS_TABS.find((t) => t.value === currentTab) || STATUS_TABS[0];

  const { data, isLoading, isError, refetch } = useOrders({
    status: activeTabConfig.status,
    page: currentPage,
    limit: 10,
  });

  const handleTabChange = (val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val === 'all') {
        next.delete('tab');
      } else {
        next.set('tab', val);
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

  const orders = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Lịch sử đơn hàng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi tình trạng và xem lại các đơn hàng bạn đã đặt
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/menu" className="flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4" />
            <span>Đặt món mới</span>
          </Link>
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 border-b border-border/60 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isActive = currentTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                'px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-colors whitespace-nowrap cursor-pointer',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content states */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <ErrorState
          onRetry={() => refetch()}
          title="Không thể tải danh sách đơn hàng"
          message="Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau ít phút."
        />
      ) : orders.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={<ShoppingBag className="w-12 h-12 text-muted-foreground" />}
            title="Chưa có đơn hàng nào"
            description={
              currentTab === 'all'
                ? 'Bạn chưa đặt đơn hàng nào. Hãy khám phá thực đơn đồ uống phong phú của chúng tôi nhé!'
                : `Không có đơn hàng nào ở trạng thái "${activeTabConfig.label}".`
            }
            action={
              <Button asChild>
                <Link to="/menu">Khám phá Menu</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.orderCode} order={order} />
          ))}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="pt-6 flex items-center justify-between border-t border-border/60">
              <p className="text-xs text-muted-foreground">
                Hiển thị trang <strong>{meta.page}</strong> trên <strong>{meta.totalPages}</strong> ({meta.total} đơn hàng)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(meta.page - 1)}
                  disabled={meta.page <= 1}
                  className="h-8"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span>Trước</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(meta.page + 1)}
                  disabled={meta.page >= meta.totalPages}
                  className="h-8"
                >
                  <span>Sau</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
