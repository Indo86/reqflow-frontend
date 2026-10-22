import { apiClient } from '@/lib/api'
import { userSingleResponseSchema } from '../schemas/user.schema'
import { mapAdminUser, type AdminUser } from '../types/user'

// Memperbarui data melalui /users/:id/status.
export async function updateUserStatus(id: string, isActive: boolean): Promise<AdminUser> {
  const response = await apiClient(`/users/${id}/status`, { method: 'PATCH', json: { isActive } })
  return mapAdminUser(userSingleResponseSchema.parse(response).data)
}
