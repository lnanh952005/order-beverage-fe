import type { ListPaymentsQuery } from '../types/payments.types';

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (query?: ListPaymentsQuery) => [...paymentKeys.lists(), query] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: number) => [...paymentKeys.details(), id] as const,
  byOrder: (orderId: number) => [...paymentKeys.all, 'order', orderId] as const,
  adminLists: () => [...paymentKeys.all, 'admin-list'] as const,
  adminList: (query?: ListPaymentsQuery) => [...paymentKeys.adminLists(), query] as const,
  adminDetail: (id: number) => [...paymentKeys.all, 'admin-detail', id] as const,
};
