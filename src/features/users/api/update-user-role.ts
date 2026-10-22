import { apiClient } from '@/lib/api'
import { userSingleResponseSchema } from '../schemas/user.schema'
import { mapAdminUser, type AdminUser, type BackendRole } from '../types/user'

// Memperbarui data melalui /users/:id/role.
export async function updateUserRole(id: string, role: BackendRole): Promise<AdminUser> {
  const response = await apiClient(`/users/${id}/role`, { method: 'PATCH', json: { role } })
  return mapAdminUser(userSingleResponseSchema.parse(response).data)
}
