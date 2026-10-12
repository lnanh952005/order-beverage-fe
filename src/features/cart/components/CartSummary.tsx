import { Link } from 'react-router';
import {
  ArrowRight,
  AlertTriangle,
  Trash2,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { ROUTE_PATHS } from '@/shared/constants/routes';
import { formatMoney } from '@/shared/lib/formatters';
import { Button } from '@/shared/components/ui/button';
import { useClearCart } from '../hooks/useClearCart';
import type { Cart } from '../types/cart.types';

interface CartSummaryProps {
  cart: Cart;
  hasUnavailableItems: boolean;
}

export function CartSummary({ cart, hasUnavailableItems }: CartSummaryProps) {
  const clearCartMutation = useClearCart();
  const isEmpty = cart.items.length === 0;

  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc chắn muốn làm trống toàn bộ giỏ hàng?')) {
      clearCartMutation.mutate();
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs space-y-6">
      <h2 className="text-lg font-bold text-foreground pb-3 border-b border-border">
        Tóm tắt đơn hàng
      </h2>

      {/* Unavailable Items Warning */}
      {hasUnavailableItems && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-destructive flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-semibold">Có món tạm thời hết hàng</p>
            <p className="text-destructive/90">
              Vui lòng xóa các món không khả dụng để có thể tiếp tục tiến hành thanh toán.
            </p>
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Tạm tính ({cart.items.length} dòng món)</span>
          <span className="font-semibold text-foreground">
            {formatMoney(cart.subtotal)}
          </span>
        </div>

        <div className="flex items-start justify-between text-muted-foreground text-xs pt-1">
          <span className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-primary" />
            <span>Phí giao hàng:</span>
          </span>
          <span className="text-right italic text-muted-foreground">
            Tính tại bước thanh toán
          </span>
        </div>

        <div className="pt-3 border-t border-border/80 flex items-baseline justify-between">
          <span className="font-bold text-base text-foreground">Tổng cộng</span>
          <div className="text-right">
            <span className="text-2xl font-black text-primary">
              {formatMoney(cart.subtotal)}
            </span>
            <p className="text-[11px] text-muted-foreground">
              (Đã bao gồm VAT nếu có)
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <Link
          to={ROUTE_PATHS.CHECKOUT}
          className={hasUnavailableItems || isEmpty ? 'pointer-events-none' : ''}
        >
          <Button
            size="lg"
            disabled={hasUnavailableItems || isEmpty}
            className="w-full rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-primary/20 text-base"
          >
            <span>Tiến hành thanh toán</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        {!isEmpty && (
          <Button
            variant="ghost"
            size="sm"
            disabled={clearCartMutation.isPending}
            onClick={handleClearCart}
            className="w-full text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            <span>Làm trống giỏ hàng</span>
          </Button>
        )}
      </div>

      {/* Benefits / Policies */}
      <div className="pt-4 border-t border-border/40 space-y-2.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary shrink-0" />
          <span>Miễn phí giao hàng cho đơn hàng từ 150.000 đ</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Đảm bảo đóng gói chuyên dụng giữ nhiệt và vệ sinh</span>
        </div>
      </div>
    </div>
  );
}
