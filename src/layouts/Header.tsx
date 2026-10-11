import * as React from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Coffee,
  ShoppingCart,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Package,
  ChevronDown,
} from 'lucide-react';
import { ROUTE_PATHS } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { useAuth } from '@/features/auth';

function getUserInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Header() {
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate(ROUTE_PATHS.HOME);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand Logo */}
        <Link
          to={ROUTE_PATHS.HOME}
          className="flex items-center gap-2 font-bold text-xl text-primary"
        >
          <Coffee className="h-6 w-6" />
          <span>Beverage Hub</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            to={ROUTE_PATHS.HOME}
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            Trang chủ
          </Link>
          <Link
            to={ROUTE_PATHS.MENU}
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            Thực đơn
          </Link>
          <Link
            to={ROUTE_PATHS.ORDERS}
            className="text-foreground/80 hover:text-foreground transition-colors"
          >
            Đơn hàng
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link to={ROUTE_PATHS.CART}>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>

          {isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                aria-expanded={menuOpen}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs border border-primary/20">
                    {getUserInitials(user.fullName)}
                  </div>
                )}
                <span className="hidden sm:inline-block text-xs font-medium max-w-[120px] truncate text-foreground">
                  {user.fullName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:inline-block" />
              </button>

              {/* User Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-popover text-popover-foreground shadow-lg py-1.5 z-50 text-sm animate-in fade-in-0 zoom-in-95">
                  <div className="px-3 py-2 border-b">
                    <p className="font-semibold text-sm truncate">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Badge
                        variant={user.role === 'admin' ? 'destructive' : user.role === 'staff' ? 'default' : 'secondary'}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {user.role === 'admin' ? 'Quản trị viên' : user.role === 'staff' ? 'Nhân viên' : 'Khách hàng'}
                      </Badge>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to={ROUTE_PATHS.PROFILE}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-muted text-foreground transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                      <span>Thông tin tài khoản</span>
                    </Link>

                    <Link
                      to={ROUTE_PATHS.ORDERS}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-muted text-foreground transition-colors"
                    >
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span>Đơn hàng của tôi</span>
                    </Link>

                    {isStaff && (
                      <Link
                        to={ROUTE_PATHS.ADMIN_ORDERS}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-muted text-primary font-medium transition-colors border-t border-border/50"
                      >
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <span>Trang quản trị (Admin)</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-destructive hover:bg-destructive/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to={ROUTE_PATHS.LOGIN}>
              <Button variant="outline" size="sm" className="gap-2">
                <UserIcon className="h-4 w-4" />
                <span>Đăng nhập</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
