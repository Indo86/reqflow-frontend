import { apiClient } from '@/lib/api'
import { userSingleResponseSchema } from '../schemas/user.schema'
import { mapAdminUser, type AdminUser, type BackendRole } from '../types/user'

// PATCH /users/:id/role — backend guards (self-role-change,
// pending-approval, last-active-admin) are the sole authority; this call
// never pre-validates any of them.
export async function updateUserRole(id: string, role: BackendRole): Promise<AdminUser> {
  const response = await apiClient(`/users/${id}/role`, { method: 'PATCH', json: { role } })
  return mapAdminUser(userSingleResponseSchema.parse(response).data)
}
