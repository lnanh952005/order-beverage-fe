import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ordersKeys } from '../services/orders.keys';
import { ordersService } from '../services/orders.service';
import type { OrderFilters } from '../types/orders.types';

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ordersKeys.list(filters),
    queryFn: () => ordersService.getOrders(filters),
    placeholderData: keepPreviousData,
  });
}
