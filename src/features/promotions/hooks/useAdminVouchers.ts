import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { promotionsService } from '../services/promotions.service';
import { promotionKeys } from '../services/promotions.keys';
import type { AdminVouchersQuery } from '../types/promotions.types';

export function useAdminVouchers(params?: AdminVouchersQuery) {
  return useQuery({
    queryKey: promotionKeys.adminList(params),
    queryFn: () => promotionsService.getAdminVouchers(params),
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}

export function useAdminVoucher(id: number) {
  return useQuery({
    queryKey: promotionKeys.adminDetail(id),
    queryFn: () => promotionsService.getAdminVoucherById(id),
    enabled: id > 0,
  });
}
