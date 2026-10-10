export type DiscountType = 'fixed' | 'percentage';

export interface Voucher {
  id: number;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface VoucherValidateResult {
  code: string;
  discountAmount: number;
  message?: string;
}
