import { httpClient } from '@/shared/api/http-client';
import type { PaginationMeta } from '@/shared/types/common.types';
import type {
  AdminVouchersQuery,
  CreateVoucherInput,
  UpdateVoucherInput,
  Voucher,
  VoucherValidateResult,
} from '../types/promotions.types';

export const promotionsService = {
  validateVoucher: (code: string, subtotal: number): Promise<VoucherValidateResult> =>
    httpClient.post<VoucherValidateResult>('/vouchers/validate', { code, subtotal }),

  getAdminVouchers: (
    params?: AdminVouchersQuery,
  ): Promise<{ data: Voucher[]; meta: PaginationMeta }> =>
    httpClient.get<{ data: Voucher[]; meta: PaginationMeta }>('/admin/vouchers', {
      params,
    }),

  getAdminVoucherById: (id: number): Promise<Voucher> =>
    httpClient.get<Voucher>(`/admin/vouchers/${id}`),

  createAdminVoucher: (body: CreateVoucherInput): Promise<Voucher> =>
    httpClient.post<Voucher>('/admin/vouchers', body),

  updateAdminVoucher: (id: number, body: UpdateVoucherInput): Promise<Voucher> =>
    httpClient.patch<Voucher>(`/admin/vouchers/${id}`, body),
};
