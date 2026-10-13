import type { OrderStatus } from '@/shared/constants/order-status';
import type { PaginationMeta } from '@/shared/types/common.types';

export type { OrderStatus };

export type FulfillmentType = 'delivery' | 'pickup';

export type PaymentMethod = 'cod' | 'card' | 'e_wallet' | 'bank_transfer';

export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';

export interface OrderItemOptionDetail {
  id: number;
  optionName: string;
  priceDelta: number;
}

export interface OrderItemDetail {
  id: number;
  productId: number;
  productName: string;
  sizeName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  options: OrderItemOptionDetail[];
}

export interface OrderStatusHistoryItem {
  id: number;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedBy: number | null;
  reason: string | null;
  createdAt: string;
}

export interface OrderPaymentRecord {
  id: number;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  paidAt: string | null;
}

export interface OrderDetail {
  orderCode: string;
  status: OrderStatus;
  fulfillmentType: FulfillmentType;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string | null;
  shippingAddressLine?: string | null;
  shippingWard?: string | null;
  shippingDistrict?: string | null;
  shippingCity?: string | null;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  note?: string | null;
  cancelReason?: string | null;
  placedAt: string;
  updatedAt: string;
  items: OrderItemDetail[];
  statusHistory: OrderStatusHistoryItem[];
  payments: OrderPaymentRecord[];
}

export interface OrderSummary {
  orderCode: string;
  status: OrderStatus;
  fulfillmentType: FulfillmentType;
  totalAmount: number;
  itemCount: number;
  placedAt: string;
}

export interface AdminOrderSummary extends OrderSummary {
  recipientName: string;
  recipientPhone: string;
  paymentStatus: string;
}

export interface CreateOrderPayload {
  fulfillmentType: FulfillmentType;
  addressId?: number;
  voucherCode?: string;
  paymentMethod: PaymentMethod;
  note?: string;
}

export interface CancelOrderPayload {
  reason?: string;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  reason?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

export interface AdminOrderFilters {
  status?: OrderStatus;
  fulfillmentType?: FulfillmentType;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

// Backward-compatibility aliases
export type Order = OrderDetail;
export type OrderItem = OrderItemDetail;
export type OrderItemOption = OrderItemOptionDetail;
export type OrderStatusHistory = OrderStatusHistoryItem;
export type CheckoutInput = CreateOrderPayload;
