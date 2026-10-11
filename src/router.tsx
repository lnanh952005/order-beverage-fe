import { createBrowserRouter } from 'react-router';
import { FullLayout, AdminLayout } from '@/layouts';

// Import feature routes and guards via their public index.ts
import { authRoutes, authAdminRoutes, RequireRole } from '@/features/auth';
import { catalogRoutes, catalogAdminRoutes } from '@/features/catalog';
import { cartRoutes } from '@/features/cart';
import { ordersRoutes, ordersAdminRoutes } from '@/features/orders';
import { profileRoutes } from '@/features/profile';
import { promotionsAdminRoutes } from '@/features/promotions';
import { adminReportsRoutes } from '@/features/admin-reports';

export const router = createBrowserRouter([
  // Customer & Public Layout
  {
    path: '/',
    element: <FullLayout />,
    children: [
      ...catalogRoutes,
      ...authRoutes,
      ...cartRoutes,
      ...ordersRoutes,
      ...profileRoutes,
    ],
  },

  // Admin Portal Layout
  {
    path: '/admin',
    element: (
      <RequireRole role={['staff', 'admin']}>
        <AdminLayout />
      </RequireRole>
    ),
    children: [
      ...ordersAdminRoutes,
      ...catalogAdminRoutes,
      ...promotionsAdminRoutes,
      ...authAdminRoutes,
      ...adminReportsRoutes,
    ],
  },
]);
