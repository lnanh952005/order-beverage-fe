import { create } from 'zustand';
import { tokenStorage } from '@/shared/api/token-storage';
import { queryClient } from '@/shared/api/query-client';
import { authService } from '../services/auth.service';
import { authKeys } from '../services/auth.keys';
import type { User, LoginInput, RegisterInput } from '../types/auth.types';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<{ isNewUser: boolean }>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const hasStoredTokens = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(tokenStorage.getAccessToken() || tokenStorage.getRefreshToken());
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: hasStoredTokens(),
  isInitialized: !hasStoredTokens(),

  setUser: (user) => {
    set({ user });
    queryClient.setQueryData(authKeys.me(), user);
  },

  initAuth: async () => {
    if (!hasStoredTokens()) {
      set({ user: null, isLoading: false, isInitialized: true });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await authService.getMe();
      set({ user, isLoading: false, isInitialized: true });
      queryClient.setQueryData(authKeys.me(), user);
    } catch {
      tokenStorage.clearAll();
      set({ user: null, isLoading: false, isInitialized: true });
      queryClient.setQueryData(authKeys.me(), null);
    }
  },

  login: async (credentials: LoginInput) => {
    const response = await authService.login(credentials);
    tokenStorage.setAccessToken(response.accessToken);
    tokenStorage.setRefreshToken(response.refreshToken);
    set({ user: response.user, isLoading: false, isInitialized: true });
    queryClient.setQueryData(authKeys.me(), response.user);
  },

  register: async (data: RegisterInput) => {
    const response = await authService.register(data);
    tokenStorage.setAccessToken(response.accessToken);
    tokenStorage.setRefreshToken(response.refreshToken);
    set({ user: response.user, isLoading: false, isInitialized: true });
    queryClient.setQueryData(authKeys.me(), response.user);
  },

  loginWithGoogle: async (idToken: string) => {
    const response = await authService.loginWithGoogle({ idToken });
    tokenStorage.setAccessToken(response.accessToken);
    tokenStorage.setRefreshToken(response.refreshToken);
    set({ user: response.user, isLoading: false, isInitialized: true });
    queryClient.setQueryData(authKeys.me(), response.user);
    return { isNewUser: response.isNewUser };
  },

  logout: async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore network errors on logout to allow clean local teardown
    } finally {
      tokenStorage.clearAll();
      set({ user: null, isLoading: false, isInitialized: true });
      queryClient.setQueryData(authKeys.me(), null);
      queryClient.removeQueries();
    }
  },

  refetchUser: async () => {
    await get().initAuth();
  },
}));
