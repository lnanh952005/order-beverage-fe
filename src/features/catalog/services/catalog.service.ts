import { httpClient } from '@/shared/api/http-client';
import type { Category, Product } from '../types/catalog.types';

export const catalogService = {
  getCategories: () => httpClient.get<Category[]>('/categories'),
  getProducts: (params?: { categoryId?: number; search?: string }) =>
    httpClient.get<Product[]>('/products', { params }),
  getProductBySlug: (slug: string) => httpClient.get<Product>(`/products/${slug}`),
};
