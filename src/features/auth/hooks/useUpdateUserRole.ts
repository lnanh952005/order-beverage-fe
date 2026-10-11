import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { authKeys } from '../services/auth.keys';
import type { UpdateUserRoleInput } from '../types/auth.types';

interface UpdateRolePayload {
  userId: number;
  data: UpdateUserRoleInput;
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: UpdateRolePayload) =>
      authService.updateUserRole(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
}
