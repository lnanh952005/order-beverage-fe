import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/shared/api/http-client';
import { getErrorMessage } from '@/shared/lib/error-messages';
import { ordersKeys } from '../services/orders.keys';
import { ordersService } from '../services/orders.service';
import type { OrderDetail, UpdateOrderStatusPayload } from '../types/orders.types';

export function useUpdateOrderStatus(orderCode: string) {
  const queryClient = useQueryClient();

  return useMutation<OrderDetail, Error, UpdateOrderStatusPayload>({
    mutationFn: (payload) => ordersService.updateAdminOrderStatus(orderCode, payload),
    onSuccess: (order) => {
      queryClient.setQueryData(ordersKeys.detail(orderCode), order);
      queryClient.invalidateQueries({ queryKey: ordersKeys.adminLists() });
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
      toast.success('Cập nhật trạng thái thành công');
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(getErrorMessage(error.code, error.message));
      } else {
        toast.error('Cập nhật trạng thái thất bại. Vui lòng thử lại sau.');
      }
    },
  });
}
