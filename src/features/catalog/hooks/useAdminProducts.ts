import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/shared/api/http-client';
import { catalogService } from '../services/catalog.service';
import { catalogKeys } from '../services/catalog.keys';
import type {
  AdminListProductsQuery,
  CreateProductInput,
  CreateProductSizeInput,
  PaginatedResult,
  Product,
  UpdateProductInput,
} from '../types/catalog.types';

export const useAdminProducts = (params?: AdminListProductsQuery) => {
  return useQuery<PaginatedResult<Product>>({
    queryKey: catalogKeys.adminProducts(params),
    queryFn: () => catalogService.getAdminProducts(params),
  });
};

export const useAdminProduct = (id: number) => {
  return useQuery<Product>({
    queryKey: catalogKeys.adminProduct(id),
    queryFn: () => catalogService.getAdminProductById(id),
    enabled: Boolean(id),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductInput) => catalogService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      toast.success('Tạo sản phẩm mới thành công!');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Không thể tạo sản phẩm. Vui lòng thử lại.');
      }
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductInput }) =>
      catalogService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      toast.success('Cập nhật thông tin sản phẩm thành công!');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Không thể cập nhật sản phẩm. Vui lòng thử lại.');
      }
    },
  });
};

export const useToggleProductAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: number; isAvailable: boolean }) =>
      catalogService.toggleProductAvailability(id, isAvailable),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      toast.success(
        data.isAvailable
          ? `Đã mở bán sản phẩm "${data.name}"`
          : `Đã tạm ngưng bán sản phẩm "${data.name}"`,
      );
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Không thể thay đổi trạng thái bán. Vui lòng thử lại.');
      }
    },
  });
};

export const useUpdateProductSizes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, sizes }: { id: number; sizes: CreateProductSizeInput[] }) =>
      catalogService.updateProductSizes(id, sizes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      toast.success('Cập nhật kích cỡ sản phẩm thành công!');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Không thể cập nhật kích cỡ. Vui lòng thử lại.');
      }
    },
  });
};

export const useUpdateProductOptionGroups = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      optionGroupIds,
    }: {
      id: number;
      optionGroupIds: number[];
    }) => catalogService.updateProductOptionGroups(id, optionGroupIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      toast.success('Cập nhật nhóm tùy chọn áp dụng thành công!');
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

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => catalogService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: catalogKeys.all });
      toast.success('Xóa sản phẩm thành công!');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Không thể xóa sản phẩm. Vui lòng thử lại.');
      }
    },
  });
};
