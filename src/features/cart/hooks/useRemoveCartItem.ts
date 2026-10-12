import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/shared/api/http-client';
import { getErrorMessage } from '@/shared/lib/error-messages';
import { cartKeys } from '../services/cart.keys';
import { cartService } from '../services/cart.service';
import type { Cart } from '../types/cart.types';

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation<Cart, Error, number>({
    mutationFn: (itemId: number) => cartService.removeItem(itemId),
    onSuccess: (newCart) => {
      queryClient.setQueryData(cartKeys.detail(), newCart);
      toast.success('Đã xóa món khỏi giỏ hàng.');
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? getErrorMessage(error.code, error.message)
          : 'Không thể xóa món khỏi giỏ hàng.';
      toast.error(message);
    },
  });
}
