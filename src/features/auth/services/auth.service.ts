import { httpClient } from '@/shared/api/http-client';
import type { User } from '../types/auth.types';

export const authService = {
  getMe: () => httpClient.get<User>('/auth/me'),
  logout: () => httpClient.post<void>('/auth/logout'),
};
