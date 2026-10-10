import type { RouteObject } from 'react-router';

// Payments feature does not expose direct routes (gateway redirects to /orders/:orderCode)
export const paymentsRoutes: RouteObject[] = [];
export const paymentsAdminRoutes: RouteObject[] = [];
