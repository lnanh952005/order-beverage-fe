import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth';
import { ApiError } from '@/shared/api/http-client';
import { profileService } from '../services/profile.service';
import { profileKeys } from '../services/profile.keys';
import type { UpdateProfileInput, User } from '../types/profile.types';

export const useProfile = () => {
  return useQuery({
    queryKey: profileKeys.user(),
    queryFn: profileService.getProfile,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => profileService.updateProfile(data),
    onSuccess: (updatedUser: User) => {
      queryClient.setQueryData(profileKeys.user(), updatedUser);
      useAuthStore.getState().setUser(updatedUser);
      toast.success('Cập nhật thông tin cá nhân thành công!');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Có lỗi xảy ra khi cập nhật thông tin.');
      }
    },
  });
};

export const useUnlinkGoogle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => profileService.unlinkGoogleIdentity(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profileKeys.user() });
      await useAuthStore.getState().refetchUser();
      toast.success('Đã hủy liên kết tài khoản Google thành công!');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Không thể hủy liên kết tài khoản Google.');
      }
    },
  });
};
