import * as React from 'react';
import type { RouteObject } from 'react-router';
import { RequireAuth } from '@/features/auth';

export const profileRoutes: RouteObject[] = [
  {
    element: React.createElement(RequireAuth),
    children: [
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
    ],
  },
];
