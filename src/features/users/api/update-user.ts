import { apiClient } from '@/lib/api'
import { userSingleResponseSchema } from '../schemas/user.schema'
import { mapAdminUser, type AdminUser } from '../types/user'

// Memperbarui data melalui /users/:id.
export interface UpdateUserInput {
  name?: string
  email?: string
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<AdminUser> {
  const response = await apiClient(`/users/${id}`, { method: 'PATCH', json: input })
  return mapAdminUser(userSingleResponseSchema.parse(response).data)
}
