import { useQuery } from '@tanstack/react-query'
import { getRequestReport } from '../api/get-request-report'
import { reportKeys } from '../api/report-query-keys'
import type { RequestReportFilters } from '../types/report'

export interface UseRequestReportQueryOptions {
  enabled?: boolean
}

export function useRequestReportQuery(filters: RequestReportFilters, options: UseRequestReportQueryOptions = {}) {
  return useQuery({
    queryKey: reportKeys.requests(filters),
    queryFn: () => getRequestReport(filters),
    enabled: options.enabled ?? true,
  })
}
