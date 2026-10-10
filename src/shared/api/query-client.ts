import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './http-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Do not retry on client errors (4xx)
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        // Retry max 2 times on network or server errors
        return failureCount < 2;
      },
      staleTime: 60 * 1000, // 1 minute default
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false, // Never retry mutations automatically
    },
  },
});
