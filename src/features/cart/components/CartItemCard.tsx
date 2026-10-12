import { Link } from 'react-router';
import { Minus, Plus, Trash2, CupSoda, AlertCircle } from 'lucide-react';
import { formatMoney } from '@/shared/lib/formatters';
import { ROUTE_PATHS } from '@/shared/constants/routes';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { useUpdateCartItem } from '../hooks/useUpdateCartItem';
import { useRemoveCartItem } from '../hooks/useRemoveCartItem';
import type { CartItem } from '../types/cart.types';

interface CartItemCardProps {
  item: CartItem;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const updateItemMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveCartItem();

  const isPending =
    updateItemMutation.isPending || removeItemMutation.isPending;

  const handleQuantityChange = (delta: number) => {
    const nextQuantity = item.quantity + delta;
    if (nextQuantity < 1 || nextQuantity > 99) return;
    updateItemMutation.mutate({
      itemId: item.id,
      input: { quantity: nextQuantity },
    });
  };

  const handleRemove = () => {
    removeItemMutation.mutate(item.id);
  };

  return (
    <div
      className={`group relative flex flex-col sm:flex-row gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
        !item.isAvailable
          ? 'border-destructive/40 bg-destructive/5'
          : 'border-border/60 bg-card hover:border-border hover:shadow-xs'
      }`}
    >
      {/* Product Image Thumbnail */}
      <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/30">
        {item.product.imageUrl ? (
          <img
            src={item.product.imageUrl}
            alt={item.product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-500/10 via-primary/5 to-orange-500/10">
            <CupSoda className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}

        {!item.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-2xs p-1 text-center">
            <span className="text-[11px] font-bold text-destructive flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>Hết hàng</span>
            </span>
          </div>
        )}
      </div>

      {/* Item Information */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <Link
              to={ROUTE_PATHS.PRODUCT_DETAIL(item.product.slug)}
              className="font-bold text-base sm:text-lg text-foreground hover:text-primary transition-colors line-clamp-1"
            >
              {item.product.name}
            </Link>

            {/* Trash Delete Button */}
            <Button
              variant="ghost"
              size="icon"
              disabled={isPending}
              onClick={handleRemove}
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
              aria-label={`Xóa ${item.product.name} khỏi giỏ hàng`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Size & Options Tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            {item.size && (
              <Badge variant="outline" className="text-xs font-semibold py-0.5">
                Size {item.size.name}
                {item.size.priceDelta > 0 && ` (+${formatMoney(item.size.priceDelta)})`}
              </Badge>
            )}

            {item.options.map((opt) => (
              <Badge
                key={opt.id}
                variant="secondary"
                className="text-xs font-normal py-0.5 text-muted-foreground bg-muted"
              >
                {opt.groupName}: {opt.name}
                {opt.priceDelta > 0 && ` (+${formatMoney(opt.priceDelta)})`}
              </Badge>
            ))}
          </div>

          {/* User Note */}
          {item.note && (
            <p className="text-xs text-muted-foreground italic line-clamp-1">
              Ghi chú: &ldquo;{item.note}&rdquo;
            </p>
          )}

          {/* Availability Alert Message */}
          {!item.isAvailable && (
            <p className="text-xs font-medium text-destructive">
              Món này hoặc tùy chọn kèm theo hiện đã hết hàng. Vui lòng xóa món để có thể đặt hàng.
            </p>
          )}
        </div>

        {/* Price & Quantity Controls */}
        <div className="mt-4 flex items-center justify-between gap-4 pt-3 border-t border-border/40">
          {/* Unit Price */}
          <div className="text-xs text-muted-foreground">
            Đơn giá: <span className="font-medium text-foreground">{formatMoney(item.unitPrice)}</span>
          </div>

          {/* Quantity Controls & Line Total */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center rounded-lg border border-border bg-background p-0.5 shadow-2xs">
              <button
                type="button"
                disabled={item.quantity <= 1 || isPending}
                onClick={() => handleQuantityChange(-1)}
                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 cursor-pointer"
                aria-label="Giảm số lượng"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-xs font-bold text-foreground">
                {item.quantity}
              </span>
              <button
                type="button"
                disabled={item.quantity >= 99 || isPending}
                onClick={() => handleQuantityChange(1)}
                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 cursor-pointer"
                aria-label="Tăng số lượng"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="text-right min-w-[80px]">
              <span className="font-extrabold text-sm sm:text-base text-primary">
                {formatMoney(item.lineTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
