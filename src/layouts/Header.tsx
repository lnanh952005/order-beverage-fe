import { Link } from 'react-router';
import { Coffee, ShoppingCart, User } from 'lucide-react';
import { ROUTE_PATHS } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand Logo */}
        <Link to={ROUTE_PATHS.HOME} className="flex items-center gap-2 font-bold text-xl text-primary">
          <Coffee className="h-6 w-6" />
          <span>Beverage Hub</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to={ROUTE_PATHS.HOME} className="text-foreground/80 hover:text-foreground transition-colors">
            Trang chủ
          </Link>
          <Link to={ROUTE_PATHS.MENU} className="text-foreground/80 hover:text-foreground transition-colors">
            Thực đơn
          </Link>
          <Link to={ROUTE_PATHS.ORDERS} className="text-foreground/80 hover:text-foreground transition-colors">
            Đơn hàng
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Link to={ROUTE_PATHS.CART}>
            <Button variant="ghost" size="icon" className="relative" aria-label="Giỏ hàng">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>

          <Link to={ROUTE_PATHS.LOGIN}>
            <Button variant="outline" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              <span>Đăng nhập</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
