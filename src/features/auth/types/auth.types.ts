export type UserRole = 'customer' | 'admin';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  hasPassword?: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}
