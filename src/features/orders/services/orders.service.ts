import { httpClient } from '@/shared/api/http-client';
import type {
  AdminOrderFilters,
  AdminOrderSummary,
  CancelOrderPayload,
  CreateOrderPayload,
  OrderDetail,
  OrderFilters,
  OrderStatus,
  OrderSummary,
  PaginatedResult,
  UpdateOrderStatusPayload,
} from '../types/orders.types';

export const ordersService = {
  createOrder: (payload: CreateOrderPayload): Promise<OrderDetail> =>
    httpClient.post<OrderDetail>('/orders', payload),

  getOrders: (filters?: OrderFilters): Promise<PaginatedResult<OrderSummary>> =>
    httpClient.get<PaginatedResult<OrderSummary>>('/orders', { params: filters }),

  getOrderByCode: (orderCode: string): Promise<OrderDetail> =>
    httpClient.get<OrderDetail>(`/orders/${orderCode}`),

  cancelOrder: (orderCode: string, payload?: CancelOrderPayload): Promise<OrderDetail> =>
    httpClient.post<OrderDetail>(`/orders/${orderCode}/cancel`, payload),

  getAdminOrders: (filters?: AdminOrderFilters): Promise<PaginatedResult<AdminOrderSummary>> =>
    httpClient.get<PaginatedResult<AdminOrderSummary>>('/admin/orders', { params: filters }),

  updateAdminOrderStatus: (
    orderCode: string,
    payload: UpdateOrderStatusPayload,
  ): Promise<OrderDetail> =>
    httpClient.patch<OrderDetail>(`/admin/orders/${orderCode}/status`, payload),

  // Backward-compatibility aliases
  checkout: (payload: CreateOrderPayload) => ordersService.createOrder(payload),
  getByCode: (orderCode: string) => ordersService.getOrderByCode(orderCode),
  getMyOrders: (filters?: OrderFilters) => ordersService.getOrders(filters),
  updateOrderStatus: (orderCode: string, status: OrderStatus, note?: string) =>
    ordersService.updateAdminOrderStatus(orderCode, { status, reason: note }),
};
