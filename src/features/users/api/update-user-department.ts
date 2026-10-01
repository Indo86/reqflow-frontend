import { apiClient } from '@/lib/api'
import { userSingleResponseSchema } from '../schemas/user.schema'
import { mapAdminUser, type AdminUser } from '../types/user'

// PATCH /users/:id/department — departmentId: null unassigns. The backend
// re-validates that a non-null departmentId belongs to the Admin's own
// organization; this call never trusts a locally-cached department list
// for that.
export async function updateUserDepartment(id: string, departmentId: string | null): Promise<AdminUser> {
  const response = await apiClient(`/users/${id}/department`, { method: 'PATCH', json: { departmentId } })
  return mapAdminUser(userSingleResponseSchema.parse(response).data)
}
