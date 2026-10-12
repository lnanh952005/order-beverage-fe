import * as React from 'react';
import type { RouteObject } from 'react-router';
import { RequireRole } from './components/RequireRole';

export const authRoutes: RouteObject[] = [
  {
    path: 'login',
    lazy: async () => ({
      Component: (await import('./pages/LoginPage')).LoginPage,
    }),
  },
  {
    path: 'register',
    lazy: async () => ({
      Component: (await import('./pages/RegisterPage')).RegisterPage,
    }),
  },
  {
    path: 'auth/callback',
    lazy: async () => ({
      Component: (await import('./pages/AuthCallbackPage')).AuthCallbackPage,
    }),
  },
];

export const authAdminRoutes: RouteObject[] = [
  {
    path: 'users',
    element: React.createElement(RequireRole, { role: 'admin' }),
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('./pages/admin/AdminUsersPage')).AdminUsersPage,
        }),
      },
    ],
  },
];
