const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

let memoryAccessToken: string | null = null;

export const tokenStorage = {
  getAccessToken(): string | null {
    if (memoryAccessToken) {
      return memoryAccessToken;
    }
    try {
      const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
      memoryAccessToken = stored;
      return stored;
    } catch {
      return memoryAccessToken;
    }
  },

  setAccessToken(token: string | null): void {
    memoryAccessToken = token;
    try {
      if (token) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
    } catch {
      // Handle storage quota or private browsing issues gracefully
    }
  },

  clearAccessToken(): void {
    memoryAccessToken = null;
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch {
      // Graceful ignore
    }
  },

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setRefreshToken(token: string): void {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch {
      // Handle storage quota or private browsing issues gracefully
    }
  },

  clearRefreshToken(): void {
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // Graceful ignore
    }
  },

  clearAll(): void {
    memoryAccessToken = null;
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // Graceful ignore
    }
  },
};
