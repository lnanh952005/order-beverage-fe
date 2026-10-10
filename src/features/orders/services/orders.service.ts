import { httpClient } from '@/shared/api/http-client';
import type { Order, CheckoutInput } from '../types/orders.types';
import type { OrderStatus } from '@/shared/constants/order-status';

export const ordersService = {
  checkout: (body: CheckoutInput) => httpClient.post<Order>('/orders', body),
  getByCode: (orderCode: string) => httpClient.get<Order>(`/orders/${orderCode}`),
  getMyOrders: () => httpClient.get<Order[]>('/orders'),
  cancelOrder: (orderCode: string, reason?: string) =>
    httpClient.post<Order>(`/orders/${orderCode}/cancel`, { reason }),

  // Admin endpoints
  getAdminOrders: (params?: { status?: OrderStatus; date?: string }) =>
    httpClient.get<Order[]>('/admin/orders', { params }),
  updateOrderStatus: (orderCode: string, status: OrderStatus, note?: string) =>
    httpClient.patch<Order>(`/admin/orders/${orderCode}/status`, { status, note }),
};
