import { apiClient } from '@/lib/api'
import { workflowDurationSchema } from '../schemas/report.schema'
import { mapWorkflowDurationReport, type WorkflowDurationReport } from '../types/report'

interface WorkflowDurationFilters {
  from?: string
  to?: string
}

// Mengambil data dari /reports/workflow-duration?from=&to=.
export async function getWorkflowDurationReport(filters: WorkflowDurationFilters): Promise<WorkflowDurationReport> {
  const params = new URLSearchParams()
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)

  const response = await apiClient(`/reports/workflow-duration?${params.toString()}`)
  return mapWorkflowDurationReport(workflowDurationSchema.parse(response))
}
