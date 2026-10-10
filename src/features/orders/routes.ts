import type { RouteObject } from 'react-router';

export const ordersRoutes: RouteObject[] = [
  {
    path: 'checkout',
    lazy: async () => ({
      Component: (await import('./pages/CheckoutPage')).CheckoutPage,
    }),
  },
  {
    path: 'orders',
    lazy: async () => ({
      Component: (await import('./pages/OrdersPage')).OrdersPage,
    }),
  },
  {
    path: 'orders/:orderCode',
    lazy: async () => ({
      Component: (await import('./pages/OrderDetailPage')).OrderDetailPage,
    }),
  },
];

export const ordersAdminRoutes: RouteObject[] = [
  {
    path: 'orders',
    lazy: async () => ({
      Component: (await import('./pages/admin/AdminOrdersPage')).AdminOrdersPage,
    }),
  },
  {
    path: 'orders/:orderCode',
    lazy: async () => ({
      Component: (await import('./pages/admin/AdminOrderDetailPage')).AdminOrderDetailPage,
    }),
  },
];
