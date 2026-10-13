import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/shared/api/http-client';
import { getErrorMessage } from '@/shared/lib/error-messages';
import { ordersKeys } from '../services/orders.keys';
import { ordersService } from '../services/orders.service';
import type { CancelOrderPayload, OrderDetail } from '../types/orders.types';

export function useCancelOrder(orderCode: string) {
  const queryClient = useQueryClient();

  return useMutation<OrderDetail, Error, CancelOrderPayload | undefined>({
    mutationFn: (payload) => ordersService.cancelOrder(orderCode, payload),
    onSuccess: (order) => {
      queryClient.setQueryData(ordersKeys.detail(orderCode), order);
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ordersKeys.adminLists() });
      toast.success('Hủy đơn hàng thành công');
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(getErrorMessage(error.code, error.message));
      } else {
        toast.error('Hủy đơn hàng thất bại. Vui lòng thử lại sau.');
      }
    },
  });
}
