import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { authKeys } from '../services/auth.keys';
import type { UpdateUserStatusInput } from '../types/auth.types';

interface UpdateStatusPayload {
  userId: number;
  data: UpdateUserStatusInput;
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: UpdateStatusPayload) =>
      authService.updateUserStatus(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
}
