import { useQuery } from '@tanstack/react-query'
import { getRequestsOverTime } from '../api/get-requests-over-time'
import { dashboardKeys, type RequestsOverTimeFilters } from '../api/dashboard-query-keys'

export interface UseRequestsOverTimeQueryOptions {
  enabled?: boolean
}

export function useRequestsOverTimeQuery(
  filters: RequestsOverTimeFilters,
  options: UseRequestsOverTimeQueryOptions = {}
) {
  return useQuery({
    queryKey: dashboardKeys.requestsOverTime(filters),
    queryFn: () => getRequestsOverTime(filters),
    enabled: options.enabled ?? true,
  })
}
