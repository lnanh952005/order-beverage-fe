import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { authKeys } from '../services/auth.keys';
import type { UserFilters } from '../types/auth.types';

export function useAdminUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: authKeys.usersList(filters),
    queryFn: () => authService.listUsers(filters),
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}
