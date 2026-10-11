import type { UserFilters } from '../types/auth.types';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
  admin: () => [...authKeys.all, 'admin'] as const,
  users: () => [...authKeys.admin(), 'users'] as const,
  usersList: (filters: UserFilters) => [...authKeys.users(), filters] as const,
  roles: () => [...authKeys.admin(), 'roles'] as const,
};
