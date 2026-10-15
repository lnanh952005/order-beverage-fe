import type { RouteObject } from 'react-router';

export const paymentsRoutes: RouteObject[] = [
  {
    path: 'vnpay-return',
    lazy: async () => {
      const { VNPayReturnPage } = await import('./pages/VNPayReturnPage');
      return { Component: VNPayReturnPage };
    },
  },
];

export const paymentsAdminRoutes: RouteObject[] = [
  {
    path: 'payments',
    lazy: async () => {
      const { AdminPaymentsPage } = await import('./pages/admin/AdminPaymentsPage');
      return { Component: AdminPaymentsPage };
    },
  },
];
