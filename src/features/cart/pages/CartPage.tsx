import { Link } from 'react-router';
import { ShoppingBag, ChevronLeft, ArrowRight } from 'lucide-react';
import { ROUTE_PATHS } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/button';
import { Skeleton, ErrorState, EmptyState } from '@/shared/components/feedback';
import { useCart } from '../hooks/useCart';
import { CartItemCard } from '../components/CartItemCard';
import { CartSummary } from '../components/CartSummary';

export function CartPage() {
  const { cart, isLoading, isError, refetch, hasUnavailableItems, itemCount } =
    useCart();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <ErrorState
          title="Không thể tải giỏ hàng"
          message="Đã có lỗi xảy ra khi tải dữ liệu giỏ hàng của bạn. Vui lòng thử lại."
          onRetry={refetch}
        />
        <div className="text-center mt-6">
          <Link
            to={ROUTE_PATHS.MENU}
            className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Quay lại thực đơn đồ uống</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <EmptyState
          icon={<ShoppingBag className="h-6 w-6" />}
          title="Giỏ hàng của bạn đang trống"
          description="Bạn chưa chọn món đồ uống nào. Hãy khám phá thực đơn thơm ngon và mát lạnh của chúng tôi nhé!"
          action={
            <Link to={ROUTE_PATHS.MENU}>
              <Button size="lg" className="rounded-xl font-bold gap-2">
                <span>Khám phá thực đơn</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      {/* Back to Menu Link */}
      <div>
        <Link
          to={ROUTE_PATHS.MENU}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Tiếp tục chọn món</span>
        </Link>
      </div>

      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <span>Giỏ hàng của bạn</span>
          <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
            {itemCount} món
          </span>
        </h1>
      </div>

      {/* Main Cart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => (
            <CartItemCard key={item.id} item={item} />
          ))}
        </div>

        {/* Right: Cart Summary */}
        <div className="lg:col-span-4 sticky top-24">
          <CartSummary cart={cart} hasUnavailableItems={hasUnavailableItems} />
        </div>
      </div>
    </div>
  );
}
