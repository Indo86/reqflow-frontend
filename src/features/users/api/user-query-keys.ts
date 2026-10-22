import type { BackendRole } from '../types/user'

export interface UserListFilters {
  page: number
  pageSize: number
  q?: string
  role?: BackendRole
  departmentId?: string
  isActive?: boolean
}

// Menyusun kunci cache untuk kueri ini.
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserListFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}
