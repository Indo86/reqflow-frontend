import type { AdminUserResponse } from '../schemas/user.schema'

export type BackendRole = AdminUserResponse['role']

// Backend enum values only ever sent to/received from the API — this map
// exists purely for display.
export const roleLabels: Record<BackendRole, string> = {
  EMPLOYEE: 'Employee',
  MANAGER: 'Manager',
  FINANCE: 'Finance',
  DIRECTOR: 'Director',
  ADMIN: 'Admin',
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: BackendRole
  department: { id: string; name: string } | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function mapAdminUser(dto: AdminUserResponse): AdminUser {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    role: dto.role,
    department: dto.department,
    isActive: dto.isActive,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

export interface UserListMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface UserListResult {
  items: AdminUser[]
  meta: UserListMeta
}
