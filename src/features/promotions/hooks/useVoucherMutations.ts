import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/shared/api/http-client';
import { getErrorMessage } from '@/shared/lib/error-messages';
import { promotionsService } from '../services/promotions.service';
import { promotionKeys } from '../services/promotions.keys';
import type {
  CreateVoucherInput,
  UpdateVoucherInput,
} from '../types/promotions.types';

export function useCreateVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVoucherInput) => promotionsService.createAdminVoucher(data),
    onSuccess: () => {
      toast.success('Tạo mã khuyến mãi thành công');
      queryClient.invalidateQueries({ queryKey: promotionKeys.adminLists() });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(getErrorMessage(error.code, error.message));
      } else {
        toast.error('Không thể tạo mã khuyến mãi');
      }
    },
  });
}

export function useUpdateVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVoucherInput }) =>
      promotionsService.updateAdminVoucher(id, data),
    onSuccess: (updated) => {
      toast.success('Cập nhật mã khuyến mãi thành công');
      queryClient.invalidateQueries({ queryKey: promotionKeys.adminLists() });
      queryClient.invalidateQueries({ queryKey: promotionKeys.adminDetail(updated.id) });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(getErrorMessage(error.code, error.message));
      } else {
        toast.error('Không thể cập nhật mã khuyến mãi');
      }
    },
  });
}

export function useToggleVoucherStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      promotionsService.updateAdminVoucher(id, { isActive }),
    onSuccess: (_data, variables) => {
      toast.success(
        variables.isActive ? 'Đã kích hoạt mã khuyến mãi' : 'Đã tạm dừng mã khuyến mãi',
      );
      queryClient.invalidateQueries({ queryKey: promotionKeys.adminLists() });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(getErrorMessage(error.code, error.message));
      } else {
        toast.error('Không thể thay đổi trạng thái mã khuyến mãi');
      }
    },
  });
}

export function useValidateVoucher() {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      promotionsService.validateVoucher(code, subtotal),
  });
}
