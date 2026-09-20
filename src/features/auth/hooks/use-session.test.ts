import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api'
import { authKeys, invalidateSessionOn401 } from './use-session'

// F1 "session expiry foundation": a future protected query's 401 should
// mark the session unauthenticated without needing apiClient to globally
// redirect on every 401 (which would break login's own 401-for-bad-
// credentials semantics — see F1 section 25).
describe('invalidateSessionOn401', () => {
  it('marks the session unauthenticated when given a 401 ApiError', () => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(authKeys.session(), { id: 'user-1', name: 'Someone' })

    invalidateSessionOn401(queryClient, new ApiError('Authentication required.', { status: 401 }))

    expect(queryClient.getQueryData(authKeys.session())).toBeNull()
  })

  it('leaves the session cache untouched for any other error', () => {
    const queryClient = new QueryClient()
    const existing = { id: 'user-1', name: 'Someone' }
    queryClient.setQueryData(authKeys.session(), existing)

    invalidateSessionOn401(queryClient, new ApiError('Something went wrong.', { status: 500 }))
    invalidateSessionOn401(queryClient, new TypeError('Failed to fetch'))

    expect(queryClient.getQueryData(authKeys.session())).toBe(existing)
  })
})
