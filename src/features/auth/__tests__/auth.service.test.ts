import { describe, it, expect, beforeEach } from 'vitest';
import { authKeys } from '../services/auth.keys';
import { tokenStorage } from '@/shared/api/token-storage';

// Setup robust in-memory localStorage mock for node test runner
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

describe('auth.keys', () => {
  it('generates consistent query keys', () => {
    expect(authKeys.all).toEqual(['auth']);
    expect(authKeys.me()).toEqual(['auth', 'me']);
    expect(authKeys.admin()).toEqual(['auth', 'admin']);
    expect(authKeys.users()).toEqual(['auth', 'admin', 'users']);
    expect(authKeys.usersList({ page: 2, q: 'test' })).toEqual([
      'auth',
      'admin',
      'users',
      { page: 2, q: 'test' },
    ]);
    expect(authKeys.roles()).toEqual(['auth', 'admin', 'roles']);
  });
});

describe('tokenStorage with localStorage', () => {
  beforeEach(() => {
    storageMap.clear();
    tokenStorage.clearAll();
  });

  it('stores and retrieves access token in localStorage', () => {
    expect(tokenStorage.getAccessToken()).toBeNull();
    tokenStorage.setAccessToken('sample-access-token');
    expect(tokenStorage.getAccessToken()).toBe('sample-access-token');
    expect(localStorage.getItem('access_token')).toBe('sample-access-token');

    tokenStorage.clearAccessToken();
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
  });

  it('stores and retrieves refresh token in localStorage', () => {
    expect(tokenStorage.getRefreshToken()).toBeNull();
    tokenStorage.setRefreshToken('sample-refresh-token');
    expect(tokenStorage.getRefreshToken()).toBe('sample-refresh-token');
    expect(localStorage.getItem('refresh_token')).toBe('sample-refresh-token');

    tokenStorage.clearRefreshToken();
    expect(tokenStorage.getRefreshToken()).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });

  it('clearAll clears both access and refresh tokens', () => {
    tokenStorage.setAccessToken('acc-token');
    tokenStorage.setRefreshToken('ref-token');

    expect(tokenStorage.getAccessToken()).toBe('acc-token');
    expect(tokenStorage.getRefreshToken()).toBe('ref-token');

    tokenStorage.clearAll();
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });
});
