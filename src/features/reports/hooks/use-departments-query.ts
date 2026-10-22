import { useQuery } from '@tanstack/react-query'
import { getDepartments } from '../api/get-departments'
import { departmentKeys } from '../api/report-query-keys'

export interface UseDepartmentsQueryOptions {
  enabled?: boolean
}

// Menyediakan hook useDepartmentsQuery.
export function useDepartmentsQuery(options: UseDepartmentsQueryOptions = {}) {
  return useQuery({
    queryKey: departmentKeys.list(),
    queryFn: getDepartments,
    enabled: options.enabled ?? true,
  })
}
