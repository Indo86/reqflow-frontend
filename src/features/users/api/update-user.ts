import { apiClient } from '@/lib/api'
import { userSingleResponseSchema } from '../schemas/user.schema'
import { mapAdminUser, type AdminUser } from '../types/user'

// PATCH /users/:id — profile fields only (name/email). Role and department
// keep their own dedicated endpoints (update-user-role.ts,
// update-user-department.ts) — this never touches either.
export interface UpdateUserInput {
  name?: string
  email?: string
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<AdminUser> {
  const response = await apiClient(`/users/${id}`, { method: 'PATCH', json: input })
  return mapAdminUser(userSingleResponseSchema.parse(response).data)
}
