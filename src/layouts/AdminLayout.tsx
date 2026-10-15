import { Link, Outlet, useLocation } from 'react-router';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  SlidersHorizontal,
  Tag,
  Users,
  BarChart3,
  Coffee,
  CreditCard,
  ArrowLeft,
} from 'lucide-react';
import { ROUTE_PATHS } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/utils';

const ADMIN_NAV_ITEMS = [
  { label: 'Đơn hàng', path: ROUTE_PATHS.ADMIN_ORDERS, icon: ShoppingBag },
  { label: 'Thanh toán', path: ROUTE_PATHS.ADMIN_PAYMENTS, icon: CreditCard },
  { label: 'Sản phẩm', path: ROUTE_PATHS.ADMIN_PRODUCTS, icon: Coffee },
  { label: 'Danh mục', path: ROUTE_PATHS.ADMIN_CATEGORIES, icon: Layers },
  { label: 'Nhóm tùy chọn', path: ROUTE_PATHS.ADMIN_OPTION_GROUPS, icon: SlidersHorizontal },
  { label: 'Khuyến mãi', path: ROUTE_PATHS.ADMIN_VOUCHERS, icon: Tag },
  { label: 'Khách hàng', path: ROUTE_PATHS.ADMIN_USERS, icon: Users },
  { label: 'Báo cáo', path: ROUTE_PATHS.ADMIN_REPORTS, icon: BarChart3 },
];

export function AdminLayout() {
  const location = useLocation();

  const isItemActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <Link to={ROUTE_PATHS.ADMIN_ORDERS} className="flex items-center gap-2 font-bold text-lg text-primary">
            <LayoutDashboard className="h-5 w-5" />
            <span>Admin Portal</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/25'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-xs'
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0 transition-transform duration-200', active && 'scale-105')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <Link
            to={ROUTE_PATHS.HOME}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-card flex items-center justify-between px-6">
          <h2 className="text-sm font-semibold text-muted-foreground">Bảng quản trị hệ thống</h2>
          <div className="text-xs text-muted-foreground">Admin Mode</div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
