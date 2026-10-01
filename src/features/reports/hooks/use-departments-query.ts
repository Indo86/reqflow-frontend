import { useQuery } from '@tanstack/react-query'
import { getDepartments } from '../api/get-departments'
import { departmentKeys } from '../api/report-query-keys'

export interface UseDepartmentsQueryOptions {
  enabled?: boolean
}

// A lookup-failure here should not take down the rest of Reports — see F6-
// contract-completion "Department filter states": the caller degrades the
// filter control alone, not the whole page.
export function useDepartmentsQuery(options: UseDepartmentsQueryOptions = {}) {
  return useQuery({
    queryKey: departmentKeys.list(),
    queryFn: getDepartments,
    enabled: options.enabled ?? true,
  })
}
