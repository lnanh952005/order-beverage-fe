// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import {
  OrderStatusBadge,
  OrderCard,
  OrderTimeline,
  CancelOrderDialog,
} from '../components';
import type { OrderDetail, OrderSummary } from '../types/orders.types';

describe('OrderStatusBadge', () => {
  it('renders correct labels for statuses', () => {
    const { rerender } = render(<OrderStatusBadge status="pending" />);
    expect(screen.getByText('Chờ xác nhận')).toBeInTheDocument();

    rerender(<OrderStatusBadge status="preparing" />);
    expect(screen.getByText('Đang chuẩn bị')).toBeInTheDocument();

    rerender(<OrderStatusBadge status="completed" />);
    expect(screen.getByText('Hoàn thành')).toBeInTheDocument();

    rerender(<OrderStatusBadge status="cancelled" />);
    expect(screen.getByText('Đã hủy')).toBeInTheDocument();
  });
});

describe('OrderCard', () => {
  const mockOrder: OrderSummary = {
    orderCode: 'ORD-20261013-0001',
    status: 'preparing',
    fulfillmentType: 'delivery',
    totalAmount: 125000,
    itemCount: 3,
    placedAt: '2026-10-13T10:00:00.000Z',
  };

  it('renders order summary details correctly', () => {
    render(
      <MemoryRouter>
        <OrderCard order={mockOrder} />
      </MemoryRouter>,
    );

    expect(screen.getByText('#ORD-20261013-0001')).toBeInTheDocument();
    expect(screen.getByText('3 món')).toBeInTheDocument();
    expect(screen.getByText('Giao tận nơi')).toBeInTheDocument();
    expect(screen.getByText('Đang chuẩn bị')).toBeInTheDocument();
    expect(screen.getByText(/125\.000/)).toBeInTheDocument();
  });
});

describe('OrderTimeline', () => {
  const mockOrder: OrderDetail = {
    orderCode: 'ORD-20261013-0001',
    status: 'preparing',
    fulfillmentType: 'delivery',
    recipientName: 'Nguyen Van A',
    recipientPhone: '0901234567',
    deliveryAddress: '123 Le Loi, Q1',
    subtotal: 100000,
    discountAmount: 0,
    shippingFee: 15000,
    totalAmount: 115000,
    placedAt: '2026-10-13T10:00:00.000Z',
    updatedAt: '2026-10-13T10:05:00.000Z',
    items: [],
    statusHistory: [
      {
        id: 1,
        fromStatus: null,
        toStatus: 'pending',
        changedBy: null,
        reason: null,
        createdAt: '2026-10-13T10:00:00.000Z',
      },
      {
        id: 2,
        fromStatus: 'pending',
        toStatus: 'confirmed',
        changedBy: 2,
        reason: 'Quán đã nhận đơn',
        createdAt: '2026-10-13T10:02:00.000Z',
      },
    ],
    payments: [],
  };

  it('renders active progress steps', () => {
    render(<OrderTimeline order={mockOrder} />);

    expect(screen.getByText('Tiến trình đơn hàng')).toBeInTheDocument();
    expect(screen.getByText('Đặt đơn hàng')).toBeInTheDocument();
    expect(screen.getByText('Đã xác nhận')).toBeInTheDocument();
    expect(screen.getByText('Đang pha chế')).toBeInTheDocument();
    expect(screen.getByText('Quán đã nhận đơn')).toBeInTheDocument();
  });

  it('renders cancellation notice when order is cancelled', () => {
    const cancelledOrder: OrderDetail = {
      ...mockOrder,
      status: 'cancelled',
      cancelReason: 'Hết nguyên liệu',
    };

    render(<OrderTimeline order={cancelledOrder} />);

    expect(screen.getByText('Đơn hàng này đã bị hủy')).toBeInTheDocument();
    expect(screen.getByText(/Lý do: Hết nguyên liệu/)).toBeInTheDocument();
  });
});

describe('CancelOrderDialog', () => {
  it('calls onConfirm with reason when submitted', () => {
    const handleConfirm = vi.fn();
    const handleOpenChange = vi.fn();

    render(
      <CancelOrderDialog
        open={true}
        onOpenChange={handleOpenChange}
        orderCode="ORD-001"
        onConfirm={handleConfirm}
      />,
    );

    const textarea = screen.getByPlaceholderText(/Ví dụ: Đổi ý/);
    fireEvent.change(textarea, { target: { value: 'Bận việc đột xuất' } });

    const submitBtn = screen.getByText('Xác nhận hủy đơn');
    fireEvent.click(submitBtn);

    expect(handleConfirm).toHaveBeenCalledWith('Bận việc đột xuất');
  });
});
