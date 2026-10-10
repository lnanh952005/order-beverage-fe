import type { RouteObject } from 'react-router';

export const adminReportsRoutes: RouteObject[] = [
  {
    path: 'reports',
    lazy: async () => ({
      Component: (await import('./pages/AdminReportsPage')).AdminReportsPage,
    }),
  },
];
