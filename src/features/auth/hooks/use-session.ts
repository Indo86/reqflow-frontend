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

// Normalizes the session query into the four states F1 cares about —
// components branch on `status` instead of juggling isPending/isError/data
// themselves. See F1 "Session query error semantics": a plain 401 resolves
// to `data: null` (unauthenticated) inside getSession(), never `isError`,
// so `error` here only ever means "couldn't reach/parse the backend."
export function useSession(): SessionState {
  const query = useSessionQuery()

  if (query.isPending) return { status: 'loading' }
  if (query.isError) return { status: 'error', error: query.error, refetch: () => void query.refetch() }
  if (query.data) return { status: 'authenticated', user: query.data }
  return { status: 'unauthenticated' }
}

// Exported for future (F2+) feature query hooks to call from their own
// `onError` — a protected API call that comes back 401 mid-session (expiry,
// revocation) should mark the session unauthenticated so the next render
// redirects to /login, without every feature re-implementing that check or
// apiClient globally redirecting on every 401 (which would break login's
// own 401-for-bad-credentials semantics). See F1 "Session expiry
// foundation".
export function invalidateSessionOn401(queryClient: QueryClient, error: unknown): void {
  if (error instanceof ApiError && error.status === 401) {
    queryClient.setQueryData(authKeys.session(), null)
  }
}
