import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/shared/api/http-client';
import { profileService } from '../services/profile.service';
import { profileKeys } from '../services/profile.keys';
import type {
  Address,
  CreateAddressInput,
  UpdateAddressInput,
} from '../types/profile.types';

export const useAddresses = () => {
  return useQuery<Address[]>({
    queryKey: profileKeys.addresses(),
    queryFn: profileService.getAddresses,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAddressInput) => profileService.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.addresses() });
      toast.success('Thêm địa chỉ giao hàng thành công!');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Không thể thêm địa chỉ. Vui lòng thử lại.');
      }
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAddressInput }) =>
      profileService.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.addresses() });
      toast.success('Cập nhật địa chỉ thành công!');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Không thể cập nhật địa chỉ. Vui lòng thử lại.');
      }
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => profileService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.addresses() });
      toast.success('Đã xóa địa chỉ khỏi danh bạ!');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Không thể xóa địa chỉ. Vui lòng thử lại.');
      }
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => profileService.updateAddress(id, { isDefault: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.addresses() });
      toast.success('Đã đặt làm địa chỉ giao hàng mặc định!');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Không thể đổi địa chỉ mặc định. Vui lòng thử lại.');
      }
    },
  });
};
