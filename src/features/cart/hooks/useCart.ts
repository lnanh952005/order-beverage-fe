import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { cartKeys } from '../services/cart.keys';
import { cartService } from '../services/cart.service';

export function useCart() {
  const { isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: cartKeys.detail(),
    queryFn: cartService.getCart,
    staleTime: 0,
    enabled: isAuthenticated,
  });

  const itemCount =
    query.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const hasUnavailableItems =
    query.data?.items.some((item) => !item.isAvailable) ?? false;

  return {
    ...query,
    cart: query.data,
    itemCount,
    hasUnavailableItems,
  };
}
