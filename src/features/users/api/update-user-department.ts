import { apiClient } from '@/lib/api'
import { userSingleResponseSchema } from '../schemas/user.schema'
import { mapAdminUser, type AdminUser } from '../types/user'

// Memperbarui data melalui /users/:id/department.
export async function updateUserDepartment(id: string, departmentId: string | null): Promise<AdminUser> {
  const response = await apiClient(`/users/${id}/department`, { method: 'PATCH', json: { departmentId } })
  return mapAdminUser(userSingleResponseSchema.parse(response).data)
}
