import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/shared/api/http-client';
import { getErrorMessage } from '@/shared/lib/error-messages';
import { paymentKeys } from '../services/payments.keys';
import { paymentsService } from '../services/payments.service';
import type {
  ListPaymentsQuery,
  PaymentStatus,
  RefundPaymentInput,
} from '../types/payments.types';

export function useAdminPayments(query?: ListPaymentsQuery) {
  return useQuery({
    queryKey: paymentKeys.adminList(query),
    queryFn: () => paymentsService.listPaymentsAdmin(query),
    placeholderData: keepPreviousData,
    refetchInterval: 15_000,
  });
}

export function useAdminPaymentDetail(id: number | null | undefined, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: paymentKeys.adminDetail(id ?? 0),
    queryFn: () => paymentsService.getPaymentAdmin(id!),
    enabled: Boolean(id) && (options.enabled ?? true),
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, ...body }: RefundPaymentInput & { paymentId: number }) =>
      paymentsService.refundPayment(paymentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Hoàn tiền giao dịch thành công');
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(getErrorMessage(error.code, error.message));
      } else {
        toast.error('Hoàn tiền thất bại. Vui lòng thử lại sau.');
      }
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentId,
      status,
      note,
    }: {
      paymentId: number;
      status: PaymentStatus;
      note?: string;
    }) => paymentsService.updatePaymentStatusAdmin(paymentId, { status, ...(note ? { note } : {}) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Cập nhật trạng thái thanh toán thành công');
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(getErrorMessage(error.code, error.message));
      } else {
        toast.error('Cập nhật trạng thái thanh toán thất bại.');
      }
    },
  });
}
