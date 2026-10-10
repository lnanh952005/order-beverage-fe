export type PaymentMethod = 'cash' | 'momo' | 'vnpay' | 'zalopay';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: number;
  orderId: number;
  paymentMethod: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  checkoutUrl?: string;
  transactionId?: string;
  paidAt?: string;
}

export interface RefundInput {
  reason: string;
}
