import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './client';

/**
 * Shared query client.
 *
 * The retry rule matters on mobile: a 4xx means the request was wrong and will
 * stay wrong, so retrying only burns battery and delays the error the user
 * needs to see. Network blips (statusCode 0) and 5xx are worth a second go.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      retry: (failureCount, error) => {
        if (error instanceof ApiError) {
          if (error.statusCode >= 400 && error.statusCode < 500) return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});
