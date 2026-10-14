import { useQuery } from '@tanstack/react-query';
import { paymentKeys } from '../services/payments.keys';
import { paymentsService } from '../services/payments.service';

interface QueryOptions {
  enabled?: boolean;
}

export function usePayment(id: number | null | undefined, options: QueryOptions = {}) {
  return useQuery({
    queryKey: paymentKeys.detail(id ?? 0),
    queryFn: () => paymentsService.getPayment(id!),
    enabled: Boolean(id) && (options.enabled ?? true),
  });
}

export function usePaymentsByOrder(orderId: number | null | undefined, options: QueryOptions = {}) {
  return useQuery({
    queryKey: paymentKeys.byOrder(orderId ?? 0),
    queryFn: () => paymentsService.getPaymentsByOrder(orderId!),
    enabled: Boolean(orderId) && (options.enabled ?? true),
  });
}
