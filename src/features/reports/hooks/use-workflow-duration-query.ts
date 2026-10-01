import { useQuery } from '@tanstack/react-query'
import { getWorkflowDurationReport } from '../api/get-workflow-duration-report'
import { reportKeys } from '../api/report-query-keys'

export interface UseWorkflowDurationQueryOptions {
  enabled?: boolean
}

export function useWorkflowDurationQuery(
  filters: { from?: string; to?: string },
  options: UseWorkflowDurationQueryOptions = {}
) {
  return useQuery({
    queryKey: reportKeys.workflowDuration(filters),
    queryFn: () => getWorkflowDurationReport(filters),
    enabled: options.enabled ?? true,
  })
}
