import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/shared/api/http-client';
import { getErrorMessage } from '@/shared/lib/error-messages';
import { cartKeys } from '../services/cart.keys';
import { cartService } from '../services/cart.service';
import type { AddToCartInput, Cart } from '../types/cart.types';

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation<Cart, Error, AddToCartInput>({
    mutationFn: (input) => cartService.addItem(input),
    onSuccess: (newCart) => {
      queryClient.setQueryData(cartKeys.detail(), newCart);
      toast.success('Đã thêm sản phẩm vào giỏ hàng!');
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? getErrorMessage(error.code, error.message)
          : 'Không thể thêm sản phẩm vào giỏ hàng.';
      toast.error(message);
    },
  });
}
