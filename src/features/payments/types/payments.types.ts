export type PaymentMethod =
  | 'cod'
  | 'card'
  | 'e_wallet'
  | 'bank_transfer'
  | 'vnpay';

export type PaymentStatus =
  | 'unpaid'
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export interface Payment {
  id: number;
  orderId: number;
  method: PaymentMethod | string;
  status: PaymentStatus;
  amount: number;
  providerTxnId?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  checkoutUrl?: string | null;
}

export interface PaymentAdminDetail extends Payment {
  providerPayload?: unknown;
  order?: {
    orderCode: string;
    recipientName: string | null;
    recipientPhone: string | null;
    totalAmount: number;
  };
}

export interface CreatePaymentUrlInput {
  paymentId?: number;
  orderId?: number;
  bankCode?: string;
  language?: 'vn' | 'en';
}

export interface CreatePaymentUrlResponse {
  paymentUrl: string;
  payment: Payment;
}

export interface RefundPaymentInput {
  amount?: number;
  reason?: string;
}

export interface RefundPaymentResponse {
  id: number;
  status: 'refunded';
  amount: number;
}

export interface ListPaymentsQuery {
  status?: PaymentStatus;
  method?: string;
  orderId?: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface VNPayReturnResult {
  isSuccess: boolean;
  isVerified: boolean;
  message: string;
  paymentId?: number | null;
  orderCode?: string | null;
  providerTxnId?: string | null;
  amount?: number | null;
  bankCode?: string | null;
}

// Retain alias for backwards compatibility if needed
export type RefundInput = RefundPaymentInput;
