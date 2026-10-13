// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { toast } from 'sonner';
import { promotionsService } from '../services/promotions.service';
import { useAdminVouchers } from '../hooks/useAdminVouchers';
import {
  useCreateVoucher,
  useToggleVoucherStatus,
} from '../hooks/useVoucherMutations';
import type { Voucher } from '../types/promotions.types';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../services/promotions.service', () => ({
  promotionsService: {
    validateVoucher: vi.fn(),
    getAdminVouchers: vi.fn(),
    getAdminVoucherById: vi.fn(),
    createAdminVoucher: vi.fn(),
    updateAdminVoucher: vi.fn(),
  },
}));

const mockVouchers: Voucher[] = [
  {
    id: 1,
    code: 'VOUCHER1',
    discountType: 'percent',
    discountValue: 10,
    minOrderValue: 20000,
    maxDiscount: 30000,
    usageLimit: 100,
    usedCount: 5,
    startsAt: '2026-01-01T00:00:00.000Z',
    endsAt: '2026-12-31T23:59:59.000Z',
    isActive: true,
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Promotions Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAdminVouchers', () => {
    it('fetches admin vouchers list successfully', async () => {
      vi.mocked(promotionsService.getAdminVouchers).mockResolvedValueOnce({
        data: mockVouchers,
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const { result } = renderHook(() => useAdminVouchers({ page: 1, limit: 10 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.data).toEqual(mockVouchers);
      expect(result.current.data?.meta.total).toBe(1);
    });
  });

  describe('useCreateVoucher', () => {
    it('creates voucher and fires success toast', async () => {
      const newVoucher: Voucher = {
        ...mockVouchers[0]!,
        id: 2,
        code: 'NEWVOUCHER',
      };
      vi.mocked(promotionsService.createAdminVoucher).mockResolvedValueOnce(newVoucher);

      const { result } = renderHook(() => useCreateVoucher(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          code: 'NEWVOUCHER',
          discountType: 'percent',
          discountValue: 10,
          minOrderValue: 20000,
          startsAt: '2026-06-01T00:00:00.000Z',
          endsAt: '2026-06-30T23:59:59.000Z',
        });
      });

      expect(promotionsService.createAdminVoucher).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Tạo mã khuyến mãi thành công');
    });
  });

  describe('useToggleVoucherStatus', () => {
    it('updates voucher isActive status and shows appropriate toast', async () => {
      vi.mocked(promotionsService.updateAdminVoucher).mockResolvedValueOnce({
        ...mockVouchers[0]!,
        isActive: false,
      });

      const { result } = renderHook(() => useToggleVoucherStatus(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: 1,
          isActive: false,
        });
      });

      expect(promotionsService.updateAdminVoucher).toHaveBeenCalledWith(1, { isActive: false });
      expect(toast.success).toHaveBeenCalledWith('Đã tạm dừng mã khuyến mãi');
    });
  });
});
