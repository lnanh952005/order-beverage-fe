const REFRESH_TOKEN_KEY = 'refresh_token';

let memoryAccessToken: string | null = null;

export const tokenStorage = {
  getAccessToken(): string | null {
    return memoryAccessToken;
  },

  setAccessToken(token: string | null): void {
    memoryAccessToken = token;
  },

  clearAccessToken(): void {
    memoryAccessToken = null;
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
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // Graceful ignore
    }
  },
};
