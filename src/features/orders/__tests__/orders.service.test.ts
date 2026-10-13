import { describe, it, expect, vi } from 'vitest';
import { httpClient } from '@/shared/api/http-client';
import { ordersKeys } from '../services/orders.keys';
import { ordersService } from '../services/orders.service';
import type {
  CreateOrderPayload,
  OrderDetail,
  OrderSummary,
  PaginatedResult,
} from '../types/orders.types';

vi.mock('@/shared/api/http-client', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('ordersKeys', () => {
  it('generates consistent order query keys', () => {
    expect(ordersKeys.all).toEqual(['orders']);
    expect(ordersKeys.lists()).toEqual(['orders', 'list']);
    expect(ordersKeys.list({ status: 'pending', page: 1 })).toEqual([
      'orders',
      'list',
      { status: 'pending', page: 1 },
    ]);
    expect(ordersKeys.details()).toEqual(['orders', 'detail']);
    expect(ordersKeys.detail('ORD-001')).toEqual(['orders', 'detail', 'ORD-001']);
    expect(ordersKeys.adminLists()).toEqual(['orders', 'admin-list']);
    expect(ordersKeys.adminList({ status: 'ready' })).toEqual([
      'orders',
      'admin-list',
      { status: 'ready' },
    ]);
  });
});

describe('ordersService', () => {
  const mockOrderDetail: OrderDetail = {
    orderCode: 'ORD-20261013-0001',
    status: 'pending',
    fulfillmentType: 'delivery',
    recipientName: 'Nguyen Van A',
    recipientPhone: '0901234567',
    deliveryAddress: '123 Le Loi, Q1, HCM',
    subtotal: 90000,
    discountAmount: 10000,
    shippingFee: 15000,
    totalAmount: 95000,
    placedAt: '2026-10-13T10:00:00.000Z',
    updatedAt: '2026-10-13T10:00:00.000Z',
    items: [],
    statusHistory: [],
    payments: [],
  };

  it('calls createOrder via POST /orders', async () => {
    vi.mocked(httpClient.post).mockResolvedValueOnce(mockOrderDetail);
    const payload: CreateOrderPayload = {
      fulfillmentType: 'delivery',
      addressId: 1,
      paymentMethod: 'cod',
      note: 'Giao nhanh',
    };

    const result = await ordersService.createOrder(payload);

    expect(httpClient.post).toHaveBeenCalledWith('/orders', payload);
    expect(result).toEqual(mockOrderDetail);
  });

  it('calls getOrders via GET /orders with filter params', async () => {
    const mockPaginated: PaginatedResult<OrderSummary> = {
      data: [
        {
          orderCode: 'ORD-20261013-0001',
          status: 'pending',
          fulfillmentType: 'delivery',
          totalAmount: 95000,
          itemCount: 2,
          placedAt: '2026-10-13T10:00:00.000Z',
        },
      ],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };

    vi.mocked(httpClient.get).mockResolvedValueOnce(mockPaginated);
    const filters = { status: 'pending' as const, page: 1, limit: 10 };

    const result = await ordersService.getOrders(filters);

    expect(httpClient.get).toHaveBeenCalledWith('/orders', { params: filters });
    expect(result).toEqual(mockPaginated);
  });

  it('calls getOrderByCode via GET /orders/:orderCode', async () => {
    vi.mocked(httpClient.get).mockResolvedValueOnce(mockOrderDetail);

    const result = await ordersService.getOrderByCode('ORD-20261013-0001');

    expect(httpClient.get).toHaveBeenCalledWith('/orders/ORD-20261013-0001');
    expect(result).toEqual(mockOrderDetail);
  });

  it('calls cancelOrder via POST /orders/:orderCode/cancel', async () => {
    const cancelledOrder = { ...mockOrderDetail, status: 'cancelled' as const };
    vi.mocked(httpClient.post).mockResolvedValueOnce(cancelledOrder);

    const result = await ordersService.cancelOrder('ORD-20261013-0001', {
      reason: 'Đổi ý',
    });

    expect(httpClient.post).toHaveBeenCalledWith('/orders/ORD-20261013-0001/cancel', {
      reason: 'Đổi ý',
    });
    expect(result.status).toBe('cancelled');
  });

  it('calls getAdminOrders via GET /admin/orders', async () => {
    vi.mocked(httpClient.get).mockResolvedValueOnce({ data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } });
    const filters = { status: 'confirmed' as const };

    await ordersService.getAdminOrders(filters);

    expect(httpClient.get).toHaveBeenCalledWith('/admin/orders', { params: filters });
  });

  it('calls updateAdminOrderStatus via PATCH /admin/orders/:orderCode/status', async () => {
    vi.mocked(httpClient.patch).mockResolvedValueOnce(mockOrderDetail);

    await ordersService.updateAdminOrderStatus('ORD-20261013-0001', {
      status: 'confirmed',
      reason: 'Nhân viên đã xác nhận',
    });

    expect(httpClient.patch).toHaveBeenCalledWith(
      '/admin/orders/ORD-20261013-0001/status',
      { status: 'confirmed', reason: 'Nhân viên đã xác nhận' },
    );
  });
});
