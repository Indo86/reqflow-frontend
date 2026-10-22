import { roleLabels, type BackendRole } from '../types/user'
import type { UserListFilters } from '../api/user-query-keys'

const DEFAULT_PAGE_SIZE = 20

function isBackendRole(value: string): value is BackendRole {
  return value in roleLabels
}

// Mengambil data dari /users.
export function parseUserListParams(searchParams: URLSearchParams): UserListFilters {
  const rawPage = Number(searchParams.get('page'))
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1

  const rawRole = searchParams.get('role')
  const role = rawRole && isBackendRole(rawRole) ? rawRole : undefined

  const departmentId = searchParams.get('departmentId') ?? undefined

  const rawIsActive = searchParams.get('isActive')
  const isActive = rawIsActive === 'true' ? true : rawIsActive === 'false' ? false : undefined

  const rawQ = searchParams.get('q')?.trim()
  const q = rawQ ? rawQ : undefined

  return { page, pageSize: DEFAULT_PAGE_SIZE, q, role, departmentId, isActive }
}
