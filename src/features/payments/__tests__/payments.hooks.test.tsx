// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { toast } from 'sonner';
import { paymentsService } from '../services/payments.service';
import {
  useCreatePaymentUrl,
  usePayment,
  usePaymentsByOrder,
  useAdminPayments,
  useRefundPayment,
  useUpdatePaymentStatus,
} from '../hooks';
import type { Payment, PaymentAdminDetail } from '../types/payments.types';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../services/payments.service', () => ({
  paymentsService: {
    createPaymentUrl: vi.fn(),
    getPayment: vi.fn(),
    getPaymentsByOrder: vi.fn(),
    verifyReturnUrl: vi.fn(),
    listPaymentsAdmin: vi.fn(),
    getPaymentAdmin: vi.fn(),
    refundPayment: vi.fn(),
    updatePaymentStatusAdmin: vi.fn(),
  },
}));

const mockPayment: Payment = {
  id: 1,
  orderId: 10,
  method: 'vnpay',
  status: 'paid',
  amount: 150000,
  providerTxnId: 'VNP-123',
  paidAt: '2026-10-14T10:00:00.000Z',
  createdAt: '2026-10-14T09:50:00.000Z',
  updatedAt: '2026-10-14T10:00:00.000Z',
  checkoutUrl: null,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Payments Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usePayment', () => {
    it('fetches payment by id', async () => {
      vi.mocked(paymentsService.getPayment).mockResolvedValueOnce(mockPayment);

      const { result } = renderHook(() => usePayment(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockPayment);
      expect(paymentsService.getPayment).toHaveBeenCalledWith(1);
    });
  });

  describe('usePaymentsByOrder', () => {
    it('fetches payments by orderId', async () => {
      vi.mocked(paymentsService.getPaymentsByOrder).mockResolvedValueOnce([mockPayment]);

      const { result } = renderHook(() => usePaymentsByOrder(10), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([mockPayment]);
      expect(paymentsService.getPaymentsByOrder).toHaveBeenCalledWith(10);
    });
  });

  describe('useAdminPayments', () => {
    it('fetches paginated admin payments', async () => {
      const mockResult = {
        data: [mockPayment as PaymentAdminDetail],
        meta: { page: 1, limit: 15, total: 1, totalPages: 1 },
      };
      vi.mocked(paymentsService.listPaymentsAdmin).mockResolvedValueOnce(mockResult);

      const { result } = renderHook(() => useAdminPayments({ status: 'paid' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResult);
      expect(paymentsService.listPaymentsAdmin).toHaveBeenCalledWith({ status: 'paid' });
    });
  });

  describe('useCreatePaymentUrl', () => {
    it('creates payment url and invokes onSuccess callback without redirect when autoRedirect is false', async () => {
      const mockResponse = {
        paymentUrl: 'https://vnpay.vn/test',
        payment: mockPayment,
      };
      vi.mocked(paymentsService.createPaymentUrl).mockResolvedValueOnce(mockResponse);

      const onSuccess = vi.fn();
      const { result } = renderHook(
        () => useCreatePaymentUrl({ autoRedirect: false, onSuccess }),
        { wrapper: createWrapper() },
      );

      await act(async () => {
        await result.current.mutateAsync({ orderId: 10 });
      });

      expect(paymentsService.createPaymentUrl).toHaveBeenCalledWith({ orderId: 10 });
      expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    });
  });

  describe('useRefundPayment', () => {
    it('calls refundPayment and shows toast success', async () => {
      vi.mocked(paymentsService.refundPayment).mockResolvedValueOnce({
        id: 1,
        status: 'refunded',
        amount: 150000,
      });

      const { result } = renderHook(() => useRefundPayment(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ paymentId: 1, reason: 'Customer requested' });
      });

      expect(paymentsService.refundPayment).toHaveBeenCalledWith(1, {
        reason: 'Customer requested',
      });
      expect(toast.success).toHaveBeenCalledWith('Hoàn tiền giao dịch thành công');
    });
  });

  describe('useUpdatePaymentStatus', () => {
    it('calls updatePaymentStatusAdmin and shows toast success', async () => {
      vi.mocked(paymentsService.updatePaymentStatusAdmin).mockResolvedValueOnce({
        ...mockPayment,
        status: 'paid',
      });

      const { result } = renderHook(() => useUpdatePaymentStatus(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ paymentId: 1, status: 'paid' });
      });

      expect(paymentsService.updatePaymentStatusAdmin).toHaveBeenCalledWith(1, {
        status: 'paid',
      });
      expect(toast.success).toHaveBeenCalledWith('Cập nhật trạng thái thanh toán thành công');
    });
  });
});
