import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/shared/api/http-client';
import { getErrorMessage } from '@/shared/lib/error-messages';
import { cartKeys } from '../services/cart.keys';
import { cartService } from '../services/cart.service';
import type { Cart, UpdateCartItemInput } from '../types/cart.types';

interface UpdateItemParams {
  itemId: number;
  input: UpdateCartItemInput;
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation<Cart, Error, UpdateItemParams>({
    mutationFn: ({ itemId, input }) => cartService.updateItem(itemId, input),
    onSuccess: (newCart) => {
      queryClient.setQueryData(cartKeys.detail(), newCart);
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? getErrorMessage(error.code, error.message)
          : 'Không thể cập nhật món trong giỏ hàng.';
      toast.error(message);
    },
  });
}
