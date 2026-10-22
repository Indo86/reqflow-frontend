import { useQuery, type QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api'
import { getSession } from '../api/get-session'
import type { SessionUser } from '../types/session'

export const authKeys = {
  session: () => ['auth', 'session'] as const,
}

export function useSessionQuery() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: getSession,
  })
}

export type SessionState =
  | { status: 'loading' }
  | { status: 'error'; error: unknown; refetch: () => void }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; user: SessionUser }

// Menyediakan hook useSession.
export function useSession(): SessionState {
  const query = useSessionQuery()

  if (query.isPending) return { status: 'loading' }
  if (query.isError) return { status: 'error', error: query.error, refetch: () => void query.refetch() }
  if (query.data) return { status: 'authenticated', user: query.data }
  return { status: 'unauthenticated' }
}

// Menjalankan proses invalidateSessionOn401.
export function invalidateSessionOn401(queryClient: QueryClient, error: unknown): void {
  if (error instanceof ApiError && error.status === 401) {
    queryClient.setQueryData(authKeys.session(), null)
  }
}
