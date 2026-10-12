import { Link, useLocation } from 'react-router';
import { User, MapPin } from 'lucide-react';
import { ROUTE_PATHS } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/utils';

export const ProfileNavTabs = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    {
      name: 'Thông tin tài khoản',
      href: ROUTE_PATHS.PROFILE,
      icon: User,
      active: currentPath === ROUTE_PATHS.PROFILE,
    },
    {
      name: 'Sổ địa chỉ giao hàng',
      href: ROUTE_PATHS.ADDRESSES,
      icon: MapPin,
      active: currentPath === ROUTE_PATHS.ADDRESSES,
    },
  ];

  return (
    <div className="flex border-b border-border/80 gap-2 mb-8 overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            to={tab.href}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-150 whitespace-nowrap',
              tab.active
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30',
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
};
