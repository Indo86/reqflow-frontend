import type { BackendRole } from '../types/user'

export interface UserListFilters {
  page: number
  pageSize: number
  q?: string
  role?: BackendRole
  departmentId?: string
  isActive?: boolean
}

// Feature-owned query keys — never a single global registry. Filters are
// included directly in the list key so distinct filter combinations cache
// and invalidate independently.
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserListFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}
