import { apiClient } from '@/lib/api'
import { userSingleResponseSchema } from '../schemas/user.schema'
import { mapAdminUser, type AdminUser } from '../types/user'

// Mengambil data dari /users/:id.
export async function getUser(id: string): Promise<AdminUser> {
  const response = await apiClient(`/users/${id}`)
  return mapAdminUser(userSingleResponseSchema.parse(response).data)
}
