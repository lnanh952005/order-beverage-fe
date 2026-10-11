import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tokenStorage } from '@/shared/api/token-storage';
import { authService } from '../services/auth.service';
import { authKeys } from '../services/auth.keys';
import { AuthContext, type AuthContextValue } from './AuthContext';
import type { RegisterInput } from '../types/auth.types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const hasStoredTokens = Boolean(
    tokenStorage.getAccessToken() || tokenStorage.getRefreshToken(),
  );

  const {
    data: user,
    isLoading: isQueryLoading,
    refetch,
  } = useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      try {
        return await authService.getMe();
      } catch (err) {
        tokenStorage.clearAll();
        throw err;
      }
    },
    enabled: hasStoredTokens,
    retry: false,
    staleTime: Infinity,
  });

  const login = React.useCallback(
    async (credentials: { email: string; password: string }) => {
      const response = await authService.login(credentials);
      tokenStorage.setAccessToken(response.accessToken);
      tokenStorage.setRefreshToken(response.refreshToken);
      queryClient.setQueryData(authKeys.me(), response.user);
    },
    [queryClient],
  );

  const register = React.useCallback(
    async (data: RegisterInput) => {
      const response = await authService.register(data);
      tokenStorage.setAccessToken(response.accessToken);
      tokenStorage.setRefreshToken(response.refreshToken);
      queryClient.setQueryData(authKeys.me(), response.user);
    },
    [queryClient],
  );

  const loginWithGoogle = React.useCallback(
    async (idToken: string) => {
      const response = await authService.loginWithGoogle({ idToken });
      tokenStorage.setAccessToken(response.accessToken);
      tokenStorage.setRefreshToken(response.refreshToken);
      queryClient.setQueryData(authKeys.me(), response.user);
      return { isNewUser: response.isNewUser };
    },
    [queryClient],
  );

  const logout = React.useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore network errors on logout to allow clean local teardown
    } finally {
      tokenStorage.clearAll();
      queryClient.clear();
    }
  }, [queryClient]);

  const refetchUser = React.useCallback(async () => {
    await refetch();
  }, [refetch]);

  const isLoading = hasStoredTokens && isQueryLoading;
  const currentUser = user ?? null;
  const isAuthenticated = Boolean(currentUser);
  const isAdmin = currentUser?.role === 'admin';
  const isStaff = currentUser?.role === 'staff' || currentUser?.role === 'admin';

  const contextValue = React.useMemo<AuthContextValue>(
    () => ({
      user: currentUser,
      isLoading,
      isAuthenticated,
      isAdmin,
      isStaff,
      login,
      register,
      loginWithGoogle,
      logout,
      refetchUser,
    }),
    [
      currentUser,
      isLoading,
      isAuthenticated,
      isAdmin,
      isStaff,
      login,
      register,
      loginWithGoogle,
      logout,
      refetchUser,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
