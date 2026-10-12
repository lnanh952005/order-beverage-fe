// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../stores/auth.store';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { tokenStorage } from '@/shared/api/token-storage';
import { queryClient } from '@/shared/api/query-client';
import type { User, LoginResponse, GoogleLoginResponse } from '../types/auth.types';

describe('useAuthStore & useAuth (Zustand State Management)', () => {
  const mockUser: User = {
    id: 1,
    email: 'user@example.com',
    fullName: 'Test User',
    role: 'customer',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  const mockAdminUser: User = {
    id: 2,
    email: 'admin@example.com',
    fullName: 'Admin User',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    tokenStorage.clearAll();
    queryClient.clear();

    // Reset store state
    useAuthStore.setState({
      user: null,
      isLoading: false,
      isInitialized: false,
    });
  });

  describe('Initial State & initAuth', () => {
    it('initializes to unauthenticated state when no tokens exist', async () => {
      await act(async () => {
        await useAuthStore.getState().initAuth();
      });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(true);
    });

    it('fetches user with getMe when tokens exist in storage', async () => {
      tokenStorage.setAccessToken('access-123');
      tokenStorage.setRefreshToken('refresh-123');

      vi.spyOn(authService, 'getMe').mockResolvedValueOnce(mockUser);

      await act(async () => {
        await useAuthStore.getState().initAuth();
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(true);
    });

    it('clears storage and sets user to null if getMe fails on initAuth', async () => {
      tokenStorage.setAccessToken('expired-access');
      tokenStorage.setRefreshToken('expired-refresh');

      vi.spyOn(authService, 'getMe').mockRejectedValueOnce(new Error('Session expired'));

      await act(async () => {
        await useAuthStore.getState().initAuth();
      });

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(tokenStorage.getAccessToken()).toBeNull();
      expect(tokenStorage.getRefreshToken()).toBeNull();
    });
  });

  describe('Login Actions', () => {
    it('updates user and tokens on successful password login', async () => {
      const loginPayload: LoginResponse = {
        user: mockUser,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      vi.spyOn(authService, 'login').mockResolvedValueOnce(loginPayload);

      await act(async () => {
        await useAuthStore.getState().login({
          email: 'user@example.com',
          password: 'password123',
        });
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(tokenStorage.getAccessToken()).toBe('new-access-token');
      expect(tokenStorage.getRefreshToken()).toBe('new-refresh-token');
    });

    it('updates user and tokens on successful registration', async () => {
      const registerPayload: LoginResponse = {
        user: mockUser,
        accessToken: 'reg-access',
        refreshToken: 'reg-refresh',
      };

      vi.spyOn(authService, 'register').mockResolvedValueOnce(registerPayload);

      await act(async () => {
        await useAuthStore.getState().register({
          email: 'user@example.com',
          password: 'password123',
          fullName: 'Test User',
        });
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(tokenStorage.getAccessToken()).toBe('reg-access');
      expect(tokenStorage.getRefreshToken()).toBe('reg-refresh');
    });

    it('updates user and returns isNewUser on Google login', async () => {
      const googlePayload: GoogleLoginResponse = {
        user: mockUser,
        accessToken: 'google-access',
        refreshToken: 'google-refresh',
        isNewUser: true,
      };

      vi.spyOn(authService, 'loginWithGoogle').mockResolvedValueOnce(googlePayload);

      let result: { isNewUser: boolean } | undefined;
      await act(async () => {
        result = await useAuthStore.getState().loginWithGoogle('mock-id-token');
      });

      expect(result).toEqual({ isNewUser: true });
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(tokenStorage.getAccessToken()).toBe('google-access');
      expect(tokenStorage.getRefreshToken()).toBe('google-refresh');
    });
  });

  describe('Logout Action', () => {
    it('calls authService.logout, clears tokens and resets store user to null', async () => {
      useAuthStore.setState({ user: mockUser });
      tokenStorage.setAccessToken('valid-access');
      tokenStorage.setRefreshToken('valid-refresh');

      const logoutSpy = vi.spyOn(authService, 'logout').mockResolvedValueOnce();

      await act(async () => {
        await useAuthStore.getState().logout();
      });

      expect(logoutSpy).toHaveBeenCalledWith('valid-refresh');
      expect(useAuthStore.getState().user).toBeNull();
      expect(tokenStorage.getAccessToken()).toBeNull();
      expect(tokenStorage.getRefreshToken()).toBeNull();
    });

    it('clears session even if logout API call throws error', async () => {
      useAuthStore.setState({ user: mockUser });
      tokenStorage.setAccessToken('valid-access');
      tokenStorage.setRefreshToken('valid-refresh');

      vi.spyOn(authService, 'logout').mockRejectedValueOnce(new Error('Network error'));

      await act(async () => {
        await useAuthStore.getState().logout();
      });

      expect(useAuthStore.getState().user).toBeNull();
      expect(tokenStorage.getAccessToken()).toBeNull();
    });
  });

  describe('useAuth Hook Facade', () => {
    it('correctly derives isAuthenticated, isAdmin, isStaff for customer user', () => {
      useAuthStore.setState({ user: mockUser, isLoading: false });

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isStaff).toBe(false);
    });

    it('correctly derives isAdmin and isStaff for admin user', () => {
      useAuthStore.setState({ user: mockAdminUser, isLoading: false });

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual(mockAdminUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isStaff).toBe(true);
    });

    it('correctly handles unauthenticated state in useAuth', () => {
      useAuthStore.setState({ user: null, isLoading: false });

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isStaff).toBe(false);
    });
  });
});
