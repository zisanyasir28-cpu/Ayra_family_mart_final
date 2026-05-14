import { QueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@superstore/shared';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,               // 1 minute
      gcTime:    300_000,              // 5 minutes
      retry: (failureCount, error) => {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const status = axiosError?.response?.status;
        // Never retry on auth or client errors
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
