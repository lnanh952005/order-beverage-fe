export const ROUTE_PATHS = {
  // Public & Customer routes
  HOME: '/',
  MENU: '/menu',
  PRODUCT_DETAIL: (slug: string) => `/menu/${slug}`,
  LOGIN: '/login',
  REGISTER: '/register',
  AUTH_CALLBACK: '/auth/callback',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: (orderCode: string) => `/orders/${orderCode}`,
  PROFILE: '/profile',
  ADDRESSES: '/profile/addresses',

  // Admin routes
  ADMIN: '/admin',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_ORDER_DETAIL: (orderCode: string) => `/admin/orders/${orderCode}`,
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_OPTION_GROUPS: '/admin/option-groups',
  ADMIN_VOUCHERS: '/admin/vouchers',
  ADMIN_USERS: '/admin/users',
  ADMIN_REPORTS: '/admin/reports',
} as const;
