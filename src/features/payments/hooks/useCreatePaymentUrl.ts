import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/shared/api/http-client';
import { getErrorMessage } from '@/shared/lib/error-messages';
import { paymentKeys } from '../services/payments.keys';
import { paymentsService } from '../services/payments.service';
import type { CreatePaymentUrlInput, CreatePaymentUrlResponse } from '../types/payments.types';

interface UseCreatePaymentUrlOptions {
  autoRedirect?: boolean;
  onSuccess?: (data: CreatePaymentUrlResponse) => void;
}

export function useCreatePaymentUrl(options: UseCreatePaymentUrlOptions = {}) {
  const queryClient = useQueryClient();
  const { autoRedirect = true, onSuccess } = options;

  return useMutation<CreatePaymentUrlResponse, Error, CreatePaymentUrlInput>({
    mutationFn: (payload) => paymentsService.createPaymentUrl(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      onSuccess?.(data);

      if (autoRedirect && data.paymentUrl) {
        toast.info('Đang chuyển hướng đến cổng thanh toán VNPay...');
        window.location.href = data.paymentUrl;
      }
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(getErrorMessage(error.code, error.message));
      } else {
        toast.error('Không thể tạo liên kết thanh toán. Vui lòng thử lại.');
      }
    },
  });
}
