import type { RouteObject } from 'react-router';

export const profileRoutes: RouteObject[] = [
  {
    path: 'profile',
    lazy: async () => ({
      Component: (await import('./pages/ProfilePage')).ProfilePage,
    }),
  },
  {
    path: 'profile/addresses',
    lazy: async () => ({
      Component: (await import('./pages/AddressesPage')).AddressesPage,
    }),
  },
];
