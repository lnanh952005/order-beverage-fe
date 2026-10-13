export type DiscountType = 'percent' | 'fixed';

export interface Voucher {
  id: number;
  code: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount?: number | null;
  maxDiscountAmount?: number | null;
  minOrderValue: number;
  usageLimit?: number | null;
  usedCount: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VoucherValidateResult {
  code: string;
  discountType?: DiscountType;
  discountValue?: number;
  discountAmount: number;
  subtotalAfterDiscount?: number;
  message?: string;
}

export interface AdminVouchersQuery {
  page?: number;
  limit?: number;
  q?: string;
  isActive?: boolean;
}

export interface CreateVoucherInput {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  usageLimit?: number | null;
  startsAt: string;
  endsAt: string;
  isActive?: boolean;
}

export interface UpdateVoucherInput {
  code?: string;
  description?: string | null;
  discountType?: DiscountType;
  discountValue?: number;
  maxDiscount?: number | null;
  minOrderValue?: number;
  usageLimit?: number | null;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
}
