import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../services/auth.service';
import { httpClient, ApiError } from '@/shared/api/http-client';
import { tokenStorage } from '@/shared/api/token-storage';
import { getErrorMessage } from '@/shared/lib/error-messages';
import type { GoogleLoginResponse } from '../types/auth.types';

// Setup in-memory localStorage mock for node test environment
const storageMap = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storageMap.get(key) ?? null,
  setItem: (key: string, value: string) => {
    storageMap.set(key, String(value));
  },
  removeItem: (key: string) => {
    storageMap.delete(key);
  },
  clear: () => {
    storageMap.clear();
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

describe('Google Authentication', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    storageMap.clear();
    tokenStorage.clearAll();
  });

  describe('authService.loginWithGoogle', () => {
    it('sends POST /auth/google with idToken and returns auth payload', async () => {
      const mockResponse: GoogleLoginResponse = {
        user: {
          id: 1,
          email: 'user@gmail.com',
          fullName: 'Google User',
          role: 'customer',
          createdAt: new Date().toISOString(),
        },
        accessToken: 'mock-access-token-123',
        refreshToken: 'mock-refresh-token-456',
        isNewUser: true,
      };

      const postSpy = vi
        .spyOn(httpClient, 'post')
        .mockResolvedValueOnce(mockResponse as never);

      const result = await authService.loginWithGoogle({
        idToken: 'google-id-token-xyz',
      });

      expect(postSpy).toHaveBeenCalledWith('/auth/google', {
        idToken: 'google-id-token-xyz',
      });
      expect(result).toEqual(mockResponse);
      expect(result.isNewUser).toBe(true);
    });

    it('handles returning user with isNewUser: false', async () => {
      const mockResponse: GoogleLoginResponse = {
        user: {
          id: 2,
          email: 'returning@gmail.com',
          fullName: 'Returning User',
          role: 'customer',
          createdAt: new Date().toISOString(),
        },
        accessToken: 'mock-access-token-returning',
        refreshToken: 'mock-refresh-token-returning',
        isNewUser: false,
      };

      vi.spyOn(httpClient, 'post').mockResolvedValueOnce(mockResponse as never);

      const result = await authService.loginWithGoogle({
        idToken: 'google-returning-token',
      });

      expect(result.isNewUser).toBe(false);
      expect(result.user.email).toBe('returning@gmail.com');
    });

    it('propagates ApiError when idToken is invalid', async () => {
      const apiError = new ApiError(
        401,
        'INVALID_GOOGLE_TOKEN',
        'Invalid or expired Google ID token',
      );

      vi.spyOn(httpClient, 'post').mockRejectedValueOnce(apiError);

      await expect(
        authService.loginWithGoogle({ idToken: 'invalid-token' }),
      ).rejects.toThrow(ApiError);
    });
  });

  describe('Error Messages for Google Auth Scenarios', () => {
    it('provides user-friendly message for USE_GOOGLE_SIGN_IN', () => {
      const message = getErrorMessage('USE_GOOGLE_SIGN_IN');
      expect(message).toContain('Google');
      expect(message).toBe(
        'Tài khoản này được đăng ký bằng Google. Vui lòng đăng nhập với Google.',
      );
    });

    it('provides user-friendly message for INVALID_GOOGLE_TOKEN', () => {
      const message = getErrorMessage('INVALID_GOOGLE_TOKEN');
      expect(message).toBe('Xác thực Google không thành công. Vui lòng thử lại.');
    });

    it('provides user-friendly message for ACCOUNT_DISABLED', () => {
      const message = getErrorMessage('ACCOUNT_DISABLED');
      expect(message).toBe('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
    });
  });

  describe('Token storage during Google Auth flow', () => {
    it('saves received tokens to localStorage', () => {
      tokenStorage.setAccessToken('google-acc-token');
      tokenStorage.setRefreshToken('google-ref-token');

      expect(tokenStorage.getAccessToken()).toBe('google-acc-token');
      expect(tokenStorage.getRefreshToken()).toBe('google-ref-token');
      expect(localStorage.getItem('access_token')).toBe('google-acc-token');
      expect(localStorage.getItem('refresh_token')).toBe('google-ref-token');
    });
  });
});
