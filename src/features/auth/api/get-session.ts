import { apiClient, ApiError } from '@/lib/api'
import { userProfileResponseSchema } from '../schemas/session.schema'
import { mapUserProfileResponse, type SessionUser } from '../types/session'

// Mengambil data dari /users/me.
export async function getSession(): Promise<SessionUser | null> {
  try {
    const response = await apiClient<{ data: unknown }>('/users/me')
    return mapUserProfileResponse(userProfileResponseSchema.parse(response.data))
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}
