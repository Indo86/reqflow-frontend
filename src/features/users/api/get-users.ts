import { apiClient } from '@/lib/api'
import { userListResponseSchema } from '../schemas/user.schema'
import { mapAdminUser, type UserListResult } from '../types/user'
import type { UserListFilters } from './user-query-keys'

// Mengambil data dari /users.
export async function getUsers(filters: UserListFilters): Promise<UserListResult> {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))
  if (filters.q) params.set('q', filters.q)
  if (filters.role) params.set('role', filters.role)
  if (filters.departmentId) params.set('departmentId', filters.departmentId)
  if (filters.isActive !== undefined) params.set('isActive', String(filters.isActive))

  const response = await apiClient(`/users?${params.toString()}`)
  const parsed = userListResponseSchema.parse(response)

  return {
    items: parsed.data.map(mapAdminUser),
    meta: {
      page: parsed.meta.page,
      pageSize: parsed.meta.pageSize,
      total: parsed.meta.total,
      totalPages: Math.max(1, Math.ceil(parsed.meta.total / parsed.meta.pageSize)),
    },
  }
}
