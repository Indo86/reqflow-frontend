import type { RequestReportFilters } from '../types/report'

export const reportKeys = {
  all: ['reports'] as const,
  requests: (filters: RequestReportFilters) => [...reportKeys.all, 'requests', filters] as const,
  workflowDuration: (filters: Pick<RequestReportFilters, 'from' | 'to'>) =>
    [...reportKeys.all, 'workflow-duration', filters] as const,
}

// Mengambil data dari /departments.
export const departmentKeys = {
  all: ['departments'] as const,
  list: () => [...departmentKeys.all, 'list'] as const,
}
