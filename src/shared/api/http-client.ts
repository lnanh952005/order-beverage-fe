import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/core/config/env';
import { tokenStorage } from './token-storage';
import type { ApiErrorDetail } from '@/shared/types/common.types';

export class ApiError extends Error {
  status: number;
  code: string;
  details?: ApiErrorDetail[];

  constructor(
    status: number,
    code: string,
    message: string,
    details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const httpClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Single-flight refresh token promise
let refreshPromise: Promise<string | null> | null = null;

async function requestRefreshToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await axios.post<{ data: { accessToken: string; refreshToken?: string } }>(
      `${env.VITE_API_BASE_URL}/auth/refresh`,
      { refreshToken },
    );
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    tokenStorage.setAccessToken(accessToken);
    if (newRefreshToken) {
      tokenStorage.setRefreshToken(newRefreshToken);
    }
    return accessToken;
  } catch {
    tokenStorage.clearAll();
    return null;
  }
}

// Request interceptor to attach Bearer token
httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to unwrap data and handle 401 single-flight refresh
httpClient.interceptors.response.use(
  (response) => {
    // Unwraps { success: true, data: T, meta?: ... }
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data.data;
    }
    return response.data;
  },
  async (error: AxiosError<{ success?: boolean; error?: { code: string; message: string; details?: ApiErrorDetail[] } }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 UNAUTHENTICATED token refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Don't retry if this was the refresh call itself or login call
      if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
        tokenStorage.clearAll();
        const apiErrorPayload = error.response.data?.error;
        throw new ApiError(
          401,
          apiErrorPayload?.code || 'UNAUTHENTICATED',
          apiErrorPayload?.message || 'Phiên đăng nhập đã hết hạn',
          apiErrorPayload?.details,
        );
      }

      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = requestRefreshToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;
      if (newAccessToken) {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return httpClient(originalRequest);
      } else {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        }
      }
    }

    const status = error.response?.status || 500;
    const errorPayload = error.response?.data?.error;
    const code = errorPayload?.code || (error.code === 'ECONNABORTED' ? 'TIMEOUT' : 'UNKNOWN_ERROR');
    const message = errorPayload?.message || error.message || 'Đã có lỗi xảy ra';
    const details = errorPayload?.details;

    throw new ApiError(status, code, message, details);
  },
);
