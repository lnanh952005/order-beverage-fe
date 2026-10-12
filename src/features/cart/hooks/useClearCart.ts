import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/shared/api/http-client';
import { getErrorMessage } from '@/shared/lib/error-messages';
import { cartKeys } from '../services/cart.keys';
import { cartService } from '../services/cart.service';

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      queryClient.setQueryData(cartKeys.detail(), { items: [], subtotal: 0 });
      toast.success('Đã làm trống giỏ hàng.');
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? getErrorMessage(error.code, error.message)
          : 'Không thể làm trống giỏ hàng.';
      toast.error(message);
    },
  });
}
