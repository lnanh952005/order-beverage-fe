import * as React from 'react';
import type { RouteObject } from 'react-router';
import { RequireAuth } from '@/features/auth';

export const ordersRoutes: RouteObject[] = [
  {
    element: React.createElement(RequireAuth),
    children: [
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
    ],
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
