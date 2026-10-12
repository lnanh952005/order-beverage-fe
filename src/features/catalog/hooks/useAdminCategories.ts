import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/shared/api/http-client';
import { catalogService } from '../services/catalog.service';
import { catalogKeys } from '../services/catalog.keys';
import type {
  Category,
  CreateCategoryInput,
  ListCategoriesQuery,
  PaginatedResult,
  UpdateCategoryInput,
} from '../types/catalog.types';

export const useAdminCategories = (params?: ListCategoriesQuery) => {
  return useQuery<PaginatedResult<Category>>({
    queryKey: catalogKeys.adminCategories(params),
    queryFn: () => catalogService.getAdminCategories(params),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryInput) => catalogService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      toast.success('Tạo danh mục mới thành công!');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Không thể tạo danh mục. Vui lòng thử lại.');
      }
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryInput }) =>
      catalogService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      toast.success('Cập nhật danh mục thành công!');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Không thể cập nhật danh mục. Vui lòng thử lại.');
      }
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => catalogService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      toast.success('Xóa danh mục thành công!');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Không thể xóa danh mục. Vui lòng thử lại.');
      }
    },
  });
};
