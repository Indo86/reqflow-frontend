import { apiClient, ApiError } from '@/lib/api'
import { userProfileResponseSchema } from '../schemas/session.schema'
import { mapUserProfileResponse, type SessionUser } from '../types/session'

// GET /users/me is the session/current-user source of truth for F1 — it's
// the only endpoint that returns role + organization + department
// (GET /auth/me deliberately only returns {id,name,email}; see
// auth.controller.ts toPublicUser). Resolves to `null` for a normal
// "not signed in" 401 so a fresh visitor never renders as a query error;
// any other failure (network down, 5xx) is rethrown so callers can tell
// "logged out" apart from "backend unreachable" (F1 section 24).
export async function getSession(): Promise<SessionUser | null> {
  try {
    const response = await apiClient<{ data: unknown }>('/users/me')
    return mapUserProfileResponse(userProfileResponseSchema.parse(response.data))
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}
