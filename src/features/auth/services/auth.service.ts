import { httpClient } from '@/shared/api/http-client';
import type {
  User,
  Role,
  LoginInput,
  LoginResponse,
  RegisterInput,
  GoogleLoginInput,
  GoogleLoginResponse,
  UserFilters,
  PaginatedUsersResponse,
  UpdateUserStatusInput,
  UpdateUserRoleInput,
} from '../types/auth.types';

export const authService = {
  login: (body: LoginInput) => httpClient.post<LoginResponse>('/auth/login', body),

  register: (body: RegisterInput) => httpClient.post<LoginResponse>('/auth/register', body),

  loginWithGoogle: (body: GoogleLoginInput) =>
    httpClient.post<GoogleLoginResponse>('/auth/google', body),

  refreshToken: (refreshToken: string) =>
    httpClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      refreshToken,
    }),

  logout: (refreshToken?: string | null) =>
    httpClient.post<void>('/auth/logout', { refreshToken: refreshToken || '' }),

  getMe: () => httpClient.get<User>('/auth/me'),

  unlinkGoogle: () => httpClient.delete<void>('/auth/identities/google'),

  // Admin users CRUD operations
  listUsers: (params?: UserFilters) =>
    httpClient.get<PaginatedUsersResponse>('/admin/users', { params }),

  updateUserStatus: (id: number, body: UpdateUserStatusInput) =>
    httpClient.patch<User>(`/admin/users/${id}/status`, body),

  updateUserRole: (id: number, body: UpdateUserRoleInput) =>
    httpClient.patch<User>(`/admin/users/${id}/role`, body),

  getRoles: () => httpClient.get<Role[]>('/admin/roles'),
};
