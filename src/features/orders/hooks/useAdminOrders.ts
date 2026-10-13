import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ordersKeys } from '../services/orders.keys';
import { ordersService } from '../services/orders.service';
import type { AdminOrderFilters } from '../types/orders.types';

export function useAdminOrders(filters?: AdminOrderFilters) {
  return useQuery({
    queryKey: ordersKeys.adminList(filters),
    queryFn: () => ordersService.getAdminOrders(filters),
    placeholderData: keepPreviousData,
    refetchInterval: 15_000,
  });
}
