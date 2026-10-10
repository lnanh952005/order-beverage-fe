import { httpClient } from '@/shared/api/http-client';
import type { Voucher, VoucherValidateResult } from '../types/promotions.types';

export const promotionsService = {
  validateVoucher: (code: string, subtotal: number) =>
    httpClient.post<VoucherValidateResult>('/vouchers/validate', { code, subtotal }),
  getAdminVouchers: () => httpClient.get<Voucher[]>('/admin/vouchers'),
};
