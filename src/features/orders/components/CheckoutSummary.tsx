import { ShoppingBag, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { formatMoney } from '@/shared/lib/formatters';
import type { CartItem } from '@/features/cart';
import type { FulfillmentType } from '../types/orders.types';

interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  fulfillmentType: FulfillmentType;
  isSubmitting: boolean;
  onCheckout: () => void;
}

export function CheckoutSummary({
  items,
  subtotal,
  discountAmount,
  fulfillmentType,
  isSubmitting,
  onCheckout,
}: CheckoutSummaryProps) {
  const isDelivery = fulfillmentType === 'delivery';

  // Shipping fee rule: 15k flat for delivery, 0 if subtotal >= 150k, 0 for pickup
  const freeShippingThreshold = 150000;
  const shippingFee = !isDelivery ? 0 : subtotal >= freeShippingThreshold ? 0 : 15000;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);
  const remainingForFreeShip = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <Card className="border border-border/80 shadow-sm sticky top-20">
      <CardContent className="p-5 sm:p-6 space-y-5">
        <h3 className="font-bold text-base text-foreground flex items-center justify-between pb-3 border-b border-border/60">
          <span className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span>Tóm tắt đơn hàng</span>
          </span>
          <span className="text-xs text-muted-foreground font-normal">
            {items.reduce((sum, item) => sum + item.quantity, 0)} món
          </span>
        </h3>

        {/* Free shipping hint */}
        {isDelivery && remainingForFreeShip > 0 && (
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              Mua thêm <strong>{formatMoney(remainingForFreeShip)}</strong> để được <strong>miễn phí giao hàng</strong>!
            </span>
          </div>
        )}

        {/* Items list */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 text-xs">
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <span className="truncate">{item.product.name}</span>
                  {item.size && (
                    <span className="text-[11px] text-muted-foreground shrink-0">
                      ({item.size.name})
                    </span>
                  )}
                  <span className="text-muted-foreground shrink-0 font-normal">
                    ×{item.quantity}
                  </span>
                </div>

                {item.options && item.options.length > 0 && (
                  <p className="text-[11px] text-muted-foreground truncate">
                    {item.options.map((o) => o.name).join(', ')}
                  </p>
                )}

                {item.note && (
                  <p className="text-[11px] text-muted-foreground/80 italic truncate">
                    Ghi chú: {item.note}
                  </p>
                )}
              </div>

              <span className="font-semibold text-foreground shrink-0">
                {formatMoney(item.lineTotal)}
              </span>
            </div>
          ))}
        </div>

        {/* Price breakdown */}
        <div className="space-y-2 pt-3 border-t border-border/60 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Tạm tính</span>
            <span className="font-medium text-foreground">{formatMoney(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Giảm giá</span>
              <span className="font-medium">-{formatMoney(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-muted-foreground">
            <span>Phí vận chuyển</span>
            <span className="font-medium text-foreground">
              {shippingFee === 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Miễn phí
                </span>
              ) : (
                formatMoney(shippingFee)
              )}
            </span>
          </div>

          <div className="flex justify-between items-baseline pt-2 border-t border-border/60">
            <span className="font-bold text-base text-foreground">Tổng thanh toán</span>
            <span className="font-extrabold text-xl text-primary">
              {formatMoney(totalAmount)}
            </span>
          </div>
        </div>

        {/* Place Order CTA */}
        <Button
          type="button"
          onClick={onCheckout}
          disabled={isSubmitting || items.length === 0}
          className="w-full h-11 text-base font-semibold shadow-md"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang xử lý đơn hàng...</span>
            </span>
          ) : (
            'Đặt hàng ngay'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
