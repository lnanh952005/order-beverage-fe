import type { AdminVouchersQuery } from '../types/promotions.types';

export const promotionKeys = {
  all: ['promotions'] as const,
  adminLists: () => [...promotionKeys.all, 'admin', 'list'] as const,
  adminList: (params?: AdminVouchersQuery) =>
    [...promotionKeys.adminLists(), params ?? {}] as const,
  adminDetail: (id: number) => [...promotionKeys.all, 'admin', 'detail', id] as const,
};
