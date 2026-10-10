import { httpClient } from '@/shared/api/http-client';
import type { Payment, RefundInput } from '../types/payments.types';

export const paymentsService = {
  refundPayment: (paymentId: number, body: RefundInput) =>
    httpClient.post<Payment>(`/admin/payments/${paymentId}/refund`, body),
};
