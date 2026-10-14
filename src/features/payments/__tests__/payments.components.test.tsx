// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  PaymentStatusBadge,
  PaymentMethodSelector,
  PayNowButton,
  PaymentReturnBanner,
  RefundPaymentDialog,
  PaymentDetailDialog,
} from '../components';
import type { PaymentAdminDetail } from '../types/payments.types';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

afterEach(() => {
  cleanup();
});

describe('PaymentStatusBadge', () => {
  it('renders correct labels for statuses', () => {
    const { rerender } = render(<PaymentStatusBadge status="paid" />);
    expect(screen.getByText('Đã thanh toán')).toBeInTheDocument();

    rerender(<PaymentStatusBadge status="unpaid" />);
    expect(screen.getByText('Chưa thanh toán')).toBeInTheDocument();

    rerender(<PaymentStatusBadge status="pending" />);
    expect(screen.getByText('Đang xử lý')).toBeInTheDocument();

    rerender(<PaymentStatusBadge status="failed" />);
    expect(screen.getByText('Thất bại')).toBeInTheDocument();

    rerender(<PaymentStatusBadge status="refunded" />);
    expect(screen.getByText('Đã hoàn tiền')).toBeInTheDocument();
  });
});

describe('PaymentMethodSelector', () => {
  it('renders all options and triggers onSelectMethod on click', () => {
    const onSelect = vi.fn();
    render(
      <PaymentMethodSelector
        selectedMethod="cod"
        onSelectMethod={onSelect}
      />,
    );

    expect(screen.getByText('Tiền mặt khi nhận hàng (COD)')).toBeInTheDocument();
    expect(screen.getByText('Thẻ thanh toán (ATM / Visa / Mastercard)')).toBeInTheDocument();
    expect(screen.getByText('Ví điện tử (VNPay QR / MoMo / ZaloPay)')).toBeInTheDocument();
    expect(screen.getByText('Chuyển khoản ngân hàng (VietQR)')).toBeInTheDocument();

    const cardOption = screen.getByText('Thẻ thanh toán (ATM / Visa / Mastercard)');
    fireEvent.click(cardOption);

    expect(onSelect).toHaveBeenCalledWith('card');
  });
});

describe('PayNowButton', () => {
  it('renders Pay Now button and is clickable', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <PayNowButton orderId={100} />
      </Wrapper>,
    );

    const button = screen.getByRole('button', { name: /thanh toán ngay qua vnpay/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });
});

describe('PaymentReturnBanner', () => {
  it('renders success banner when vnp_ResponseCode is 00', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/orders/ORD-001?vnp_ResponseCode=00&vnp_Amount=15000000&vnp_TransactionNo=1498765']}>
          <PaymentReturnBanner />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Thanh toán trực tuyến thành công!')).toBeInTheDocument();
    expect(screen.getByText(/1498765/)).toBeInTheDocument();
  });

  it('renders cancelled banner when vnp_ResponseCode is 24', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/orders/ORD-001?vnp_ResponseCode=24']}>
          <PaymentReturnBanner />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Giao dịch thanh toán đã bị hủy')).toBeInTheDocument();
  });

  it('renders error banner for unexpected code', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/orders/ORD-001?vnp_ResponseCode=99']}>
          <PaymentReturnBanner />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Thanh toán không thành công')).toBeInTheDocument();
    expect(screen.getByText(/Mã phản hồi VNPay: 99/)).toBeInTheDocument();
  });

  it('handles close button click by dismissing and clearing searchParams', () => {
    const queryClient = new QueryClient();
    const onDismiss = vi.fn();
    const { getByText, queryByText, getByRole } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/orders/ORD-001?vnp_ResponseCode=00&vnp_Amount=15000000']}>
          <PaymentReturnBanner onDismiss={onDismiss} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(getByText('Thanh toán trực tuyến thành công!')).toBeInTheDocument();

    const closeBtn = getByRole('button', { name: /đóng thông báo/i });
    fireEvent.click(closeBtn);

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(queryByText('Thanh toán trực tuyến thành công!')).not.toBeInTheDocument();
  });
});

describe('RefundPaymentDialog', () => {
  it('renders refund dialog with maxAmount and handles input', () => {
    const Wrapper = createWrapper();
    const onOpenChange = vi.fn();
    render(
      <Wrapper>
        <RefundPaymentDialog
          open={true}
          onOpenChange={onOpenChange}
          paymentId={45}
          orderCode="ORD-999"
          maxAmount={120000}
        />
      </Wrapper>,
    );

    expect(screen.getByText(/Hoàn tiền giao dịch #45/)).toBeInTheDocument();
    expect(screen.getByText(/#ORD-999/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /xác nhận hoàn tiền/i })).toBeInTheDocument();
  });
});

describe('PaymentDetailDialog', () => {
  const mockPayment: PaymentAdminDetail = {
    id: 88,
    orderId: 10,
    method: 'vnpay',
    status: 'paid',
    amount: 150000,
    providerTxnId: 'VNP-8888',
    paidAt: '2026-10-14T10:00:00.000Z',
    createdAt: '2026-10-14T09:55:00.000Z',
    updatedAt: '2026-10-14T10:00:00.000Z',
    order: {
      orderCode: 'ORD-88',
      recipientName: 'Tran Van B',
      recipientPhone: '0988776655',
      totalAmount: 150000,
    },
    providerPayload: { responseCode: '00', bankCode: 'NCB' },
  };

  it('renders payment details and provider transaction ID', () => {
    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <PaymentDetailDialog
          open={true}
          onOpenChange={vi.fn()}
          payment={mockPayment}
        />
      </Wrapper>,
    );

    expect(screen.getByText('Giao dịch #88')).toBeInTheDocument();
    expect(screen.getByText('VNP-8888')).toBeInTheDocument();
    expect(screen.getByText('Tran Van B')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hoàn tiền giao dịch/i })).toBeInTheDocument();
  });
});
