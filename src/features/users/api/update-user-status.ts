import { apiClient } from '@/lib/api'
import { userSingleResponseSchema } from '../schemas/user.schema'
import { mapAdminUser, type AdminUser } from '../types/user'

// PATCH /users/:id/status — activate/deactivate. The backend is the sole
// authority on whether this succeeds (self-deactivation, last-active-admin,
// and pending-approval guards all live server-side — see backend README
// "User Management (F6.5)"); this call never pre-validates any of that.
export async function updateUserStatus(id: string, isActive: boolean): Promise<AdminUser> {
  const response = await apiClient(`/users/${id}/status`, { method: 'PATCH', json: { isActive } })
  return mapAdminUser(userSingleResponseSchema.parse(response).data)
}
