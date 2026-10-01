import { useQuery } from '@tanstack/react-query'
import { getRecentActivity } from '../api/get-recent-activity'
import { dashboardKeys, type RecentActivityFilters } from '../api/dashboard-query-keys'

export interface UseRecentActivityQueryOptions {
  enabled?: boolean
}

export function useRecentActivityQuery(filters: RecentActivityFilters, options: UseRecentActivityQueryOptions = {}) {
  return useQuery({
    queryKey: dashboardKeys.recentActivity(filters),
    queryFn: () => getRecentActivity(filters),
    enabled: options.enabled ?? true,
  })
}
