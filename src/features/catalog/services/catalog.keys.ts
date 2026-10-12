import type {
  AdminListProductsQuery,
  ListCategoriesQuery,
  ListProductsQuery,
} from '../types/catalog.types';

export const catalogKeys = {
  all: ['catalog'] as const,
  categories: () => [...catalogKeys.all, 'categories'] as const,
  products: (params?: ListProductsQuery) =>
    [...catalogKeys.all, 'products', params ?? {}] as const,
  product: (slug: string) => [...catalogKeys.all, 'product', slug] as const,

  adminCategories: (params?: ListCategoriesQuery) =>
    [...catalogKeys.all, 'admin', 'categories', params ?? {}] as const,
  adminProducts: (params?: AdminListProductsQuery) =>
    [...catalogKeys.all, 'admin', 'products', params ?? {}] as const,
  adminProduct: (id: number) =>
    [...catalogKeys.all, 'admin', 'product', id] as const,
  adminOptionGroups: () =>
    [...catalogKeys.all, 'admin', 'option-groups'] as const,
};
