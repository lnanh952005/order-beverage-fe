import type { AdminOrderFilters, OrderFilters } from '../types/orders.types';

export const ordersKeys = {
  all: ['orders'] as const,
  lists: () => [...ordersKeys.all, 'list'] as const,
  list: (filters?: OrderFilters) => [...ordersKeys.lists(), filters] as const,
  details: () => [...ordersKeys.all, 'detail'] as const,
  detail: (orderCode: string) => [...ordersKeys.details(), orderCode] as const,
  adminLists: () => [...ordersKeys.all, 'admin-list'] as const,
  adminList: (filters?: AdminOrderFilters) => [...ordersKeys.adminLists(), filters] as const,
};
