import { httpClient } from '@/shared/api/http-client';
import type { PaginationMeta } from '@/shared/types/common.types';
import type {
  CreatePaymentUrlInput,
  CreatePaymentUrlResponse,
  ListPaymentsQuery,
  Payment,
  PaymentAdminDetail,
  PaymentStatus,
  RefundPaymentInput,
  RefundPaymentResponse,
  VNPayReturnResult,
} from '../types/payments.types';

export const paymentsService = {
  createPaymentUrl: (payload: CreatePaymentUrlInput): Promise<CreatePaymentUrlResponse> =>
    httpClient.post<CreatePaymentUrlResponse>('/payments/create-url', payload),

  getPayment: (id: number): Promise<Payment> =>
    httpClient.get<Payment>(`/payments/${id}`),

  getPaymentsByOrder: (orderId: number): Promise<Payment[]> =>
    httpClient.get<Payment[]>(`/payments/order/${orderId}`),

  verifyReturnUrl: (query: Record<string, string | number | boolean | undefined>): Promise<VNPayReturnResult> =>
    httpClient.get<VNPayReturnResult>('/payments/vnpay-return', { params: query }),

  listPaymentsAdmin: (
    query?: ListPaymentsQuery,
  ): Promise<{ data: PaymentAdminDetail[]; meta: PaginationMeta }> =>
    httpClient.get<{ data: PaymentAdminDetail[]; meta: PaginationMeta }>('/admin/payments', {
      params: query,
    }),

  getPaymentAdmin: (id: number): Promise<PaymentAdminDetail> =>
    httpClient.get<PaymentAdminDetail>(`/admin/payments/${id}`),

  refundPayment: (paymentId: number, body: RefundPaymentInput): Promise<RefundPaymentResponse> =>
    httpClient.post<RefundPaymentResponse>(`/admin/payments/${paymentId}/refund`, body),

  updatePaymentStatusAdmin: (
    paymentId: number,
    body: { status: PaymentStatus; note?: string },
  ): Promise<PaymentAdminDetail> =>
    httpClient.patch<PaymentAdminDetail>(`/admin/payments/${paymentId}/status`, body),
};
