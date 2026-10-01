import { apiClient } from '@/lib/api'
import { userSingleResponseSchema } from '../schemas/user.schema'
import { mapAdminUser, type AdminUser } from '../types/user'

// GET /users/:id — Admin-only, organization-scoped; a user outside the
// Admin's organization resolves to 404, same as every other cross-tenant
// lookup in this codebase.
export async function getUser(id: string): Promise<AdminUser> {
  const response = await apiClient(`/users/${id}`)
  return mapAdminUser(userSingleResponseSchema.parse(response).data)
}
