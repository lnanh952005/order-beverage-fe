import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/shared/api/http-client';
import { catalogService } from '../services/catalog.service';
import { catalogKeys } from '../services/catalog.keys';
import type {
  CreateOptionGroupInput,
  CreateOptionInput,
  OptionGroup,
  UpdateOptionGroupInput,
  UpdateOptionInput,
} from '../types/catalog.types';

export const useAdminOptionGroups = () => {
  return useQuery<OptionGroup[]>({
    queryKey: catalogKeys.adminOptionGroups(),
    queryFn: catalogService.getAdminOptionGroups,
  });
};

export const useCreateOptionGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOptionGroupInput) =>
      catalogService.createOptionGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      toast.success('Tạo nhóm tùy chọn mới thành công!');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Không thể tạo nhóm tùy chọn. Vui lòng thử lại.');
      }
    },
  });
};

export const useUpdateOptionGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOptionGroupInput }) =>
      catalogService.updateOptionGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      toast.success('Cập nhật nhóm tùy chọn thành công!');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Không thể cập nhật nhóm tùy chọn. Vui lòng thử lại.');
      }
    },
  });
};

export const useDeleteOptionGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => catalogService.deleteOptionGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      toast.success('Xóa nhóm tùy chọn thành công!');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Không thể xóa nhóm tùy chọn. Vui lòng thử lại.');
      }
    },
  });
};

export const useCreateOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: number;
      data: CreateOptionInput;
    }) => catalogService.createOption(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      toast.success('Thêm tùy chọn mới thành công!');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Không thể thêm tùy chọn. Vui lòng thử lại.');
      }
    },
  });
};

export const useUpdateOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOptionInput }) =>
      catalogService.updateOption(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      toast.success('Cập nhật tùy chọn thành công!');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Không thể cập nhật tùy chọn. Vui lòng thử lại.');
      }
    },
  });
};

export const useDeleteOption = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => catalogService.deleteOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      toast.success('Xóa tùy chọn thành công!');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Không thể xóa tùy chọn. Vui lòng thử lại.');
      }
    },
  });
};
