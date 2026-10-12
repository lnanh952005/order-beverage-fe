import * as React from 'react';
import type { RouteObject } from 'react-router';
import { RequireAuth } from '@/features/auth';

export const cartRoutes: RouteObject[] = [
  {
    element: React.createElement(RequireAuth),
    children: [
      {
        path: 'cart',
        lazy: async () => ({
          Component: (await import('./pages/CartPage')).CartPage,
        }),
      },
    ],
  },
];
