import { describe, it, expect, vi } from 'vitest';
import { httpClient } from '@/shared/api/http-client';
import { paymentKeys } from '../services/payments.keys';
import { paymentsService } from '../services/payments.service';
import type {
  CreatePaymentUrlInput,
  Payment,
  PaymentAdminDetail,
  RefundPaymentInput,
} from '../types/payments.types';

vi.mock('@/shared/api/http-client', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('paymentKeys', () => {
  it('generates consistent payment query keys', () => {
    expect(paymentKeys.all).toEqual(['payments']);
    expect(paymentKeys.lists()).toEqual(['payments', 'list']);
    expect(paymentKeys.list({ status: 'paid', page: 1 })).toEqual([
      'payments',
      'list',
      { status: 'paid', page: 1 },
    ]);
    expect(paymentKeys.details()).toEqual(['payments', 'detail']);
    expect(paymentKeys.detail(123)).toEqual(['payments', 'detail', 123]);
    expect(paymentKeys.byOrder(456)).toEqual(['payments', 'order', 456]);
    expect(paymentKeys.adminLists()).toEqual(['payments', 'admin-list']);
    expect(paymentKeys.adminList({ method: 'vnpay' })).toEqual([
      'payments',
      'admin-list',
      { method: 'vnpay' },
    ]);
    expect(paymentKeys.adminDetail(99)).toEqual(['payments', 'admin-detail', 99]);
  });
});

describe('paymentsService', () => {
  const mockPayment: Payment = {
    id: 1,
    orderId: 10,
    method: 'vnpay',
    status: 'pending',
    amount: 150000,
    providerTxnId: null,
    paidAt: null,
    createdAt: '2026-10-14T10:00:00.000Z',
    updatedAt: '2026-10-14T10:00:00.000Z',
    checkoutUrl: null,
  };

  it('calls createPaymentUrl via POST /payments/create-url', async () => {
    const payload: CreatePaymentUrlInput = { orderId: 10, bankCode: 'NCB' };
    const mockResponse = { paymentUrl: 'https://vnpay.vn/pay', payment: mockPayment };

    vi.mocked(httpClient.post).mockResolvedValueOnce(mockResponse);

    const result = await paymentsService.createPaymentUrl(payload);

    expect(httpClient.post).toHaveBeenCalledWith('/payments/create-url', payload);
    expect(result).toEqual(mockResponse);
  });

  it('calls getPayment via GET /payments/:id', async () => {
    vi.mocked(httpClient.get).mockResolvedValueOnce(mockPayment);

    const result = await paymentsService.getPayment(1);

    expect(httpClient.get).toHaveBeenCalledWith('/payments/1');
    expect(result).toEqual(mockPayment);
  });

  it('calls getPaymentsByOrder via GET /payments/order/:orderId', async () => {
    vi.mocked(httpClient.get).mockResolvedValueOnce([mockPayment]);

    const result = await paymentsService.getPaymentsByOrder(10);

    expect(httpClient.get).toHaveBeenCalledWith('/payments/order/10');
    expect(result).toEqual([mockPayment]);
  });

  it('calls verifyReturnUrl via GET /payments/vnpay-return', async () => {
    const mockReturn = {
      isSuccess: true,
      isVerified: true,
      message: 'Success',
      paymentId: 1,
      providerTxnId: '145555',
      amount: 150000,
      bankCode: 'NCB',
    };
    vi.mocked(httpClient.get).mockResolvedValueOnce(mockReturn);

    const result = await paymentsService.verifyReturnUrl({ vnp_ResponseCode: '00' });

    expect(httpClient.get).toHaveBeenCalledWith('/payments/vnpay-return', {
      params: { vnp_ResponseCode: '00' },
    });
    expect(result).toEqual(mockReturn);
  });

  it('calls listPaymentsAdmin via GET /admin/payments', async () => {
    const mockAdminList = {
      data: [mockPayment as PaymentAdminDetail],
      meta: { page: 1, limit: 15, total: 1, totalPages: 1 },
    };
    vi.mocked(httpClient.get).mockResolvedValueOnce(mockAdminList);

    const result = await paymentsService.listPaymentsAdmin({ status: 'paid', page: 1 });

    expect(httpClient.get).toHaveBeenCalledWith('/admin/payments', {
      params: { status: 'paid', page: 1 },
    });
    expect(result).toEqual(mockAdminList);
  });

  it('calls getPaymentAdmin via GET /admin/payments/:id', async () => {
    const mockAdminDetail: PaymentAdminDetail = {
      ...mockPayment,
      providerPayload: { responseCode: '00' },
      order: {
        orderCode: 'ORD-001',
        recipientName: 'Nguyen Van A',
        recipientPhone: '0901234567',
        totalAmount: 150000,
      },
    };
    vi.mocked(httpClient.get).mockResolvedValueOnce(mockAdminDetail);

    const result = await paymentsService.getPaymentAdmin(1);

    expect(httpClient.get).toHaveBeenCalledWith('/admin/payments/1');
    expect(result).toEqual(mockAdminDetail);
  });

  it('calls refundPayment via POST /admin/payments/:id/refund', async () => {
    const refundInput: RefundPaymentInput = { amount: 150000, reason: 'Customer requested' };
    const mockRefundResult = { id: 1, status: 'refunded' as const, amount: 150000 };

    vi.mocked(httpClient.post).mockResolvedValueOnce(mockRefundResult);

    const result = await paymentsService.refundPayment(1, refundInput);

    expect(httpClient.post).toHaveBeenCalledWith('/admin/payments/1/refund', refundInput);
    expect(result).toEqual(mockRefundResult);
  });

  it('calls updatePaymentStatusAdmin via PATCH /admin/payments/:id/status', async () => {
    vi.mocked(httpClient.patch).mockResolvedValueOnce({
      ...mockPayment,
      status: 'paid',
    });

    const result = await paymentsService.updatePaymentStatusAdmin(1, {
      status: 'paid',
      note: 'Admin verified manual transfer',
    });

    expect(httpClient.patch).toHaveBeenCalledWith('/admin/payments/1/status', {
      status: 'paid',
      note: 'Admin verified manual transfer',
    });
    expect(result.status).toBe('paid');
  });
});
