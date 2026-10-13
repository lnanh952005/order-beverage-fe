import { useQuery } from '@tanstack/react-query';
import { ordersKeys } from '../services/orders.keys';
import { ordersService } from '../services/orders.service';

export function useOrder(orderCode: string | undefined) {
  return useQuery({
    queryKey: ordersKeys.detail(orderCode ?? ''),
    queryFn: () => ordersService.getOrderByCode(orderCode!),
    enabled: Boolean(orderCode),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status && !['completed', 'cancelled'].includes(status)) {
        return 10_000;
      }
      return false;
    },
  });
}
