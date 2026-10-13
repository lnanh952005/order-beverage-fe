import { describe, it, expect, vi } from 'vitest';
import { promotionKeys } from '../services/promotions.keys';
import { promotionsService } from '../services/promotions.service';
import { httpClient } from '@/shared/api/http-client';

vi.mock('@/shared/api/http-client', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('promotionKeys', () => {
  it('generates consistent query keys', () => {
    expect(promotionKeys.all).toEqual(['promotions']);
    expect(promotionKeys.adminLists()).toEqual(['promotions', 'admin', 'list']);
    expect(promotionKeys.adminList({ page: 1, limit: 10 })).toEqual([
      'promotions',
      'admin',
      'list',
      { page: 1, limit: 10 },
    ]);
    expect(promotionKeys.adminDetail(42)).toEqual(['promotions', 'admin', 'detail', 42]);
  });
});

describe('promotionsService', () => {
  it('calls validateVoucher via POST /vouchers/validate', async () => {
    const mockResult = {
      code: 'WELCOME10',
      discountType: 'percent' as const,
      discountValue: 10,
      discountAmount: 10000,
      subtotalAfterDiscount: 90000,
    };
    vi.mocked(httpClient.post).mockResolvedValueOnce(mockResult);

    const res = await promotionsService.validateVoucher('WELCOME10', 100000);
    expect(httpClient.post).toHaveBeenCalledWith('/vouchers/validate', {
      code: 'WELCOME10',
      subtotal: 100000,
    });
    expect(res).toEqual(mockResult);
  });

  it('calls getAdminVouchers via GET /admin/vouchers with params', async () => {
    const mockPaginated = {
      data: [{ id: 1, code: 'VOUCHER1' }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    vi.mocked(httpClient.get).mockResolvedValueOnce(mockPaginated);

    const query = { page: 1, limit: 10, q: 'VOUCHER' };
    const res = await promotionsService.getAdminVouchers(query);
    expect(httpClient.get).toHaveBeenCalledWith('/admin/vouchers', { params: query });
    expect(res).toEqual(mockPaginated);
  });

  it('calls getAdminVoucherById via GET /admin/vouchers/:id', async () => {
    const mockVoucher = { id: 5, code: 'TEST5' };
    vi.mocked(httpClient.get).mockResolvedValueOnce(mockVoucher);

    const res = await promotionsService.getAdminVoucherById(5);
    expect(httpClient.get).toHaveBeenCalledWith('/admin/vouchers/5');
    expect(res).toEqual(mockVoucher);
  });

  it('calls createAdminVoucher via POST /admin/vouchers', async () => {
    const payload = {
      code: 'NEWVOUCHER',
      discountType: 'percent' as const,
      discountValue: 15,
      minOrderValue: 50000,
      startsAt: '2026-06-01T00:00:00.000Z',
      endsAt: '2026-06-30T23:59:59.000Z',
      isActive: true,
    };
    const mockCreated = { id: 99, ...payload, usedCount: 0 };
    vi.mocked(httpClient.post).mockResolvedValueOnce(mockCreated);

    const res = await promotionsService.createAdminVoucher(payload);
    expect(httpClient.post).toHaveBeenCalledWith('/admin/vouchers', payload);
    expect(res).toEqual(mockCreated);
  });

  it('calls updateAdminVoucher via PATCH /admin/vouchers/:id', async () => {
    const payload = {
      description: 'Cập nhật mô tả',
      isActive: false,
    };
    const mockUpdated = { id: 10, code: 'OLDCODE', ...payload };
    vi.mocked(httpClient.patch).mockResolvedValueOnce(mockUpdated);

    const res = await promotionsService.updateAdminVoucher(10, payload);
    expect(httpClient.patch).toHaveBeenCalledWith('/admin/vouchers/10', payload);
    expect(res).toEqual(mockUpdated);
  });
});
