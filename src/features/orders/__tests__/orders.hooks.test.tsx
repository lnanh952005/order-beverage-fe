// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { toast } from 'sonner';
import { ordersService } from '../services/orders.service';
import { useOrder } from '../hooks/useOrder';
import { useCheckout } from '../hooks/useCheckout';
import { useCancelOrder } from '../hooks/useCancelOrder';
import type { OrderDetail } from '../types/orders.types';

const mockNavigate = vi.fn();

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../services/orders.service', () => ({
  ordersService: {
    createOrder: vi.fn(),
    getOrders: vi.fn(),
    getOrderByCode: vi.fn(),
    cancelOrder: vi.fn(),
    getAdminOrders: vi.fn(),
    updateAdminOrderStatus: vi.fn(),
  },
}));

const mockOrderDetail: OrderDetail = {
  orderCode: 'ORD-20261013-0001',
  status: 'pending',
  fulfillmentType: 'delivery',
  recipientName: 'Nguyen Van A',
  recipientPhone: '0901234567',
  deliveryAddress: '123 Le Loi, Q1',
  subtotal: 100000,
  discountAmount: 0,
  shippingFee: 15000,
  totalAmount: 115000,
  placedAt: '2026-10-13T10:00:00.000Z',
  updatedAt: '2026-10-13T10:00:00.000Z',
  items: [],
  statusHistory: [],
  payments: [],
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

describe('useOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches order detail successfully', async () => {
    vi.mocked(ordersService.getOrderByCode).mockResolvedValueOnce(mockOrderDetail);

    const { result } = renderHook(() => useOrder('ORD-20261013-0001'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockOrderDetail);
    expect(ordersService.getOrderByCode).toHaveBeenCalledWith('ORD-20261013-0001');
  });
});

describe('useCheckout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('executes checkout and navigates on success', async () => {
    vi.mocked(ordersService.createOrder).mockResolvedValueOnce(mockOrderDetail);

    const { result } = renderHook(() => useCheckout(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        fulfillmentType: 'delivery',
        addressId: 1,
        paymentMethod: 'cod',
      });
    });

    expect(ordersService.createOrder).toHaveBeenCalledWith({
      fulfillmentType: 'delivery',
      addressId: 1,
      paymentMethod: 'cod',
    });
    expect(toast.success).toHaveBeenCalledWith('Đặt hàng thành công!');
    expect(mockNavigate).toHaveBeenCalledWith('/orders/ORD-20261013-0001');
  });
});

describe('useCancelOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cancels order and updates cache on success', async () => {
    const cancelled = { ...mockOrderDetail, status: 'cancelled' as const };
    vi.mocked(ordersService.cancelOrder).mockResolvedValueOnce(cancelled);

    const { result } = renderHook(() => useCancelOrder('ORD-20261013-0001'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ reason: 'Đổi ý' });
    });

    expect(ordersService.cancelOrder).toHaveBeenCalledWith('ORD-20261013-0001', {
      reason: 'Đổi ý',
    });
    expect(toast.success).toHaveBeenCalledWith('Hủy đơn hàng thành công');
  });
});
