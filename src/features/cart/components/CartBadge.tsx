import { Link } from 'react-router';
import { ShoppingCart } from 'lucide-react';
import { ROUTE_PATHS } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/button';
import { useCart } from '../hooks/useCart';

export function CartBadge() {
  const { itemCount } = useCart();

  return (
    <Link to={ROUTE_PATHS.CART}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        aria-label={`Giỏ hàng${itemCount > 0 ? `, ${itemCount} món` : ''}`}
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground shadow-xs animate-in zoom-in-50 duration-200">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </Button>
    </Link>
  );
}
