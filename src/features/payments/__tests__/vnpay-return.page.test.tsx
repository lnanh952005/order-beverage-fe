// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VNPayReturnPage } from '../pages/VNPayReturnPage';
import { paymentsService } from '../services/payments.service';

vi.mock('../services/payments.service', () => ({
  paymentsService: {
    verifyReturnUrl: vi.fn(),
  },
}));

describe('VNPayReturnPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const renderWithRouter = (initialEntries: string[]) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <VNPayReturnPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  it('renders success state when payment is successful', async () => {
    vi.mocked(paymentsService.verifyReturnUrl).mockResolvedValueOnce({
      isSuccess: true,
      isVerified: true,
      message: 'Confirm Success',
      paymentId: 1,
      orderCode: 'ORD-20261015-8394',
      providerTxnId: 'VNP15705615',
      amount: 80000,
      bankCode: 'NCB',
    });

    renderWithRouter([
      '/vnpay-return?vnp_Amount=8000000&vnp_BankCode=NCB&vnp_BankTranNo=VNP15705615&vnp_ResponseCode=00&vnp_TxnRef=1&vnp_OrderInfo=Thanh+toan+don+hang+ORD-20261015-8394',
    ]);

    await waitFor(() => {
      expect(screen.getByText('Thanh toán thành công!')).toBeInTheDocument();
    });

    expect(screen.getByText('#ORD-20261015-8394')).toBeInTheDocument();
    expect(screen.getByText('VNP15705615')).toBeInTheDocument();
    expect(screen.getByText('NCB')).toBeInTheDocument();
    expect(screen.getByText(/Xem đơn hàng ngay/i)).toBeInTheDocument();
  });

  it('renders cancelled state when user cancels transaction (responseCode 24)', async () => {
    vi.mocked(paymentsService.verifyReturnUrl).mockResolvedValueOnce({
      isSuccess: false,
      isVerified: true,
      message: 'Transaction cancelled by user',
      paymentId: 1,
      orderCode: 'ORD-20261015-8394',
    });

    renderWithRouter([
      '/vnpay-return?vnp_ResponseCode=24&vnp_TxnRef=1&vnp_OrderInfo=Thanh+toan+don+hang+ORD-20261015-8394',
    ]);

    await waitFor(() => {
      expect(screen.getByText('Giao dịch đã bị hủy')).toBeInTheDocument();
    });

    expect(screen.getByText(/Bạn đã hủy giao dịch trên cổng VNPay/i)).toBeInTheDocument();
    expect(screen.getByText(/Thanh toán lại/i)).toBeInTheDocument();
  });

  it('renders failed state when responseCode is an error code', async () => {
    vi.mocked(paymentsService.verifyReturnUrl).mockResolvedValueOnce({
      isSuccess: false,
      isVerified: true,
      message: 'Giao dịch không thành công',
      paymentId: 1,
      orderCode: 'ORD-20261015-8394',
    });

    renderWithRouter([
      '/vnpay-return?vnp_ResponseCode=99&vnp_TxnRef=1&vnp_OrderInfo=Thanh+toan+don+hang+ORD-20261015-8394',
    ]);

    await waitFor(() => {
      expect(screen.getByText('Thanh toán không thành công')).toBeInTheDocument();
    });

    expect(screen.getByText(/Quay lại đơn hàng/i)).toBeInTheDocument();
  });
});
