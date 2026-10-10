import type { RouteObject } from 'react-router';

export const catalogRoutes: RouteObject[] = [
  {
    index: true,
    lazy: async () => ({
      Component: (await import('./pages/HomePage')).HomePage,
    }),
  },
  {
    path: 'menu',
    lazy: async () => ({
      Component: (await import('./pages/MenuPage')).MenuPage,
    }),
  },
  {
    path: 'menu/:slug',
    lazy: async () => ({
      Component: (await import('./pages/ProductDetailPage')).ProductDetailPage,
    }),
  },
];

export const catalogAdminRoutes: RouteObject[] = [
  {
    path: 'products',
    lazy: async () => ({
      Component: (await import('./pages/admin/AdminProductsPage')).AdminProductsPage,
    }),
  },
  {
    path: 'categories',
    lazy: async () => ({
      Component: (await import('./pages/admin/AdminCategoriesPage')).AdminCategoriesPage,
    }),
  },
  {
    path: 'option-groups',
    lazy: async () => ({
      Component: (await import('./pages/admin/AdminOptionGroupsPage')).AdminOptionGroupsPage,
    }),
  },
];
