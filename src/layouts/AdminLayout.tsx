import { Link, Outlet } from 'react-router';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Tag,
  Users,
  BarChart3,
  Coffee,
  ArrowLeft,
} from 'lucide-react';
import { ROUTE_PATHS } from '@/shared/constants/routes';

const ADMIN_NAV_ITEMS = [
  { label: 'Đơn hàng', path: ROUTE_PATHS.ADMIN_ORDERS, icon: ShoppingBag },
  { label: 'Sản phẩm', path: ROUTE_PATHS.ADMIN_PRODUCTS, icon: Coffee },
  { label: 'Danh mục', path: ROUTE_PATHS.ADMIN_CATEGORIES, icon: Layers },
  { label: 'Khuyến mãi', path: ROUTE_PATHS.ADMIN_VOUCHERS, icon: Tag },
  { label: 'Khách hàng', path: ROUTE_PATHS.ADMIN_USERS, icon: Users },
  { label: 'Báo cáo', path: ROUTE_PATHS.ADMIN_REPORTS, icon: BarChart3 },
];

export function AdminLayout() {
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

        <nav className="flex-1 p-4 space-y-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Icon className="h-4 w-4" />
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
