import type { OrderStatus } from '@/shared/constants/order-status';

export interface OrderItemOption {
  optionId: number;
  optionName: string;
  priceDelta: number;
}

export interface OrderItem {
  id: number;
  productName: string;
  productSlug: string;
  sizeName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  options: OrderItemOption[];
}

export interface OrderStatusHistory {
  id: number;
  status: OrderStatus;
  note?: string;
  createdAt: string;
}

export interface Order {
  id: number;
  orderCode: string;
  status: OrderStatus;
  fulfillmentType: 'delivery' | 'pickup';
  recipientName?: string;
  recipientPhone?: string;
  deliveryAddress?: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  note?: string;
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
  createdAt: string;
}

export interface CheckoutInput {
  fulfillmentType: 'delivery' | 'pickup';
  addressId?: number;
  voucherCode?: string;
  paymentMethod: 'cash' | 'online';
  note?: string;
}
