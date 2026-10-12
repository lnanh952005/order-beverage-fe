import { httpClient } from '@/shared/api/http-client';
import type {
  AdminListProductsQuery,
  Category,
  CreateCategoryInput,
  CreateOptionGroupInput,
  CreateOptionInput,
  CreateProductInput,
  CreateProductSizeInput,
  ListCategoriesQuery,
  ListProductsQuery,
  Option,
  OptionGroup,
  PaginatedResult,
  Product,
  UpdateCategoryInput,
  UpdateOptionGroupInput,
  UpdateOptionInput,
  UpdateProductInput,
} from '../types/catalog.types';

export const catalogService = {
  // -----------------------------------------------------------
  // Public Catalog API
  // -----------------------------------------------------------

  getCategories: (): Promise<Category[]> => {
    return httpClient.get<Category[]>('/categories');
  },

  getProducts: (params?: ListProductsQuery): Promise<PaginatedResult<Product>> => {
    return httpClient.get<PaginatedResult<Product>>('/products', { params });
  },

  getProductBySlug: (slug: string): Promise<Product> => {
    return httpClient.get<Product>(`/products/${slug}`);
  },

  // -----------------------------------------------------------
  // Admin Categories API
  // -----------------------------------------------------------

  getAdminCategories: (params?: ListCategoriesQuery): Promise<PaginatedResult<Category>> => {
    return httpClient.get<PaginatedResult<Category>>('/admin/categories', { params });
  },

  createCategory: (data: CreateCategoryInput): Promise<Category> => {
    return httpClient.post<Category>('/admin/categories', data);
  },

  updateCategory: (id: number, data: UpdateCategoryInput): Promise<Category> => {
    return httpClient.patch<Category>(`/admin/categories/${id}`, data);
  },

  deleteCategory: (id: number): Promise<void> => {
    return httpClient.delete<void>(`/admin/categories/${id}`);
  },

  // -----------------------------------------------------------
  // Admin Products API
  // -----------------------------------------------------------

  getAdminProducts: (params?: AdminListProductsQuery): Promise<PaginatedResult<Product>> => {
    return httpClient.get<PaginatedResult<Product>>('/admin/products', { params });
  },

  getAdminProductById: (id: number): Promise<Product> => {
    return httpClient.get<Product>(`/admin/products/${id}`);
  },

  createProduct: (data: CreateProductInput): Promise<Product> => {
    return httpClient.post<Product>('/admin/products', data);
  },

  updateProduct: (id: number, data: UpdateProductInput): Promise<Product> => {
    return httpClient.patch<Product>(`/admin/products/${id}`, data);
  },

  toggleProductAvailability: (id: number, isAvailable: boolean): Promise<Product> => {
    return httpClient.patch<Product>(`/admin/products/${id}/availability`, { isAvailable });
  },

  updateProductSizes: (id: number, sizes: CreateProductSizeInput[]): Promise<Product> => {
    return httpClient.put<Product>(`/admin/products/${id}/sizes`, { sizes });
  },

  updateProductOptionGroups: (id: number, optionGroupIds: number[]): Promise<Product> => {
    return httpClient.put<Product>(`/admin/products/${id}/option-groups`, { optionGroupIds });
  },

  deleteProduct: (id: number): Promise<void> => {
    return httpClient.delete<void>(`/admin/products/${id}`);
  },

  // -----------------------------------------------------------
  // Admin Option Groups & Options API
  // -----------------------------------------------------------

  getAdminOptionGroups: (): Promise<OptionGroup[]> => {
    return httpClient.get<OptionGroup[]>('/admin/option-groups');
  },

  createOptionGroup: (data: CreateOptionGroupInput): Promise<OptionGroup> => {
    return httpClient.post<OptionGroup>('/admin/option-groups', data);
  },

  updateOptionGroup: (id: number, data: UpdateOptionGroupInput): Promise<OptionGroup> => {
    return httpClient.patch<OptionGroup>(`/admin/option-groups/${id}`, data);
  },

  deleteOptionGroup: (id: number): Promise<void> => {
    return httpClient.delete<void>(`/admin/option-groups/${id}`);
  },

  createOption: (groupId: number, data: CreateOptionInput): Promise<Option> => {
    return httpClient.post<Option>(`/admin/option-groups/${groupId}/options`, data);
  },

  updateOption: (id: number, data: UpdateOptionInput): Promise<Option> => {
    return httpClient.patch<Option>(`/admin/options/${id}`, data);
  },

  deleteOption: (id: number): Promise<void> => {
    return httpClient.delete<void>(`/admin/options/${id}`);
  },
};
