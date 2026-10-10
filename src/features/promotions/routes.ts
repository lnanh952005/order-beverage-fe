import type { RouteObject } from 'react-router';

export const promotionsAdminRoutes: RouteObject[] = [
  {
    path: 'vouchers',
    lazy: async () => ({
      Component: (await import('./pages/admin/AdminVouchersPage')).AdminVouchersPage,
    }),
  },
];
