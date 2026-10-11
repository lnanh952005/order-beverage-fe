import type { PaginationMeta } from '@/shared/types/common.types';

export type UserRole = 'customer' | 'staff' | 'admin';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  roleId?: number;
  emailVerified?: boolean;
  hasPassword?: boolean;
  linkedProviders?: string[];
  createdAt: string;
  isActive?: boolean;
}

export interface Role {
  id: number;
  code: UserRole;
  name: string;
  description: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface GoogleLoginResponse extends LoginResponse {
  isNewUser: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface GoogleLoginInput {
  idToken: string;
}

export interface UpdateUserStatusInput {
  isActive: boolean;
}

export interface UpdateUserRoleInput {
  role?: UserRole;
  roleId?: number;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  q?: string;
  role?: string;
  isActive?: boolean;
}

export interface PaginatedUsersResponse {
  data: User[];
  meta: PaginationMeta;
}
