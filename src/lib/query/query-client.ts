import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api/api-error'
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError) {
            if (error.status >= 400 && error.status < 500) return false
            if (error.status !== 0 && error.status < 500) return false
          } else if (!(error instanceof TypeError)) return false
          return failureCount < 2
        },
      },
      mutations: { retry: false },
    },
  })
}
export const queryClient = createQueryClient()
