import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { authKeys } from '../services/auth.keys';

export function useRoles() {
  return useQuery({
    queryKey: authKeys.roles(),
    queryFn: authService.getRoles,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
