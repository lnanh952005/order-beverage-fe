import type { RouteObject } from 'react-router';

// Customer gateway redirection returns to /orders/:orderCode, so payments feature has no separate customer routes
export const paymentsRoutes: RouteObject[] = [];

export const paymentsAdminRoutes: RouteObject[] = [
  {
    path: 'payments',
    lazy: async () => {
      const { AdminPaymentsPage } = await import('./pages/admin/AdminPaymentsPage');
      return { Component: AdminPaymentsPage };
    },
  },
];
