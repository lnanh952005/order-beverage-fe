import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ApiError } from '@/shared/api/http-client';
import { getErrorMessage } from '@/shared/lib/error-messages';
import { cartKeys } from '@/features/cart';
import { ordersKeys } from '../services/orders.keys';
import { ordersService } from '../services/orders.service';
import { useCheckoutStore } from '../stores/checkout.store';
import type { CreateOrderPayload, OrderDetail } from '../types/orders.types';

export function useCheckout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<OrderDetail, Error, CreateOrderPayload>({
    mutationFn: (payload) => ordersService.createOrder(payload),
    onSuccess: (order) => {
      // Invalidate cart to clear badge and cart view
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
      // Invalidate customer orders list
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });

      // Reset checkout form draft in Zustand store
      useCheckoutStore.getState().resetDraft();

      toast.success('Đặt hàng thành công!');
      navigate(`/orders/${order.orderCode}`);
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(getErrorMessage(error.code, error.message));
      } else {
        toast.error('Đặt hàng thất bại. Vui lòng thử lại sau.');
      }
    },
  });
}
