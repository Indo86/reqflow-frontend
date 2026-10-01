import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary } from '../api/get-dashboard-summary'
import { dashboardKeys } from '../api/dashboard-query-keys'

export interface UseDashboardSummaryQueryOptions {
  enabled?: boolean
}

export function useDashboardSummaryQuery(options: UseDashboardSummaryQueryOptions = {}) {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: getDashboardSummary,
    enabled: options.enabled ?? true,
  })
}
