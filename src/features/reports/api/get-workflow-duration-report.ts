import { apiClient } from '@/lib/api'
import { workflowDurationSchema } from '../schemas/report.schema'
import { mapWorkflowDurationReport, type WorkflowDurationReport } from '../types/report'

interface WorkflowDurationFilters {
  from?: string
  to?: string
}

// GET /reports/workflow-duration?from=&to= — duration is derived from the
// terminal AuditLog event's timestamp minus Request.createdAt, never
// Request.updatedAt (report.service.ts). Unit is always seconds.
export async function getWorkflowDurationReport(filters: WorkflowDurationFilters): Promise<WorkflowDurationReport> {
  const params = new URLSearchParams()
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)

  const response = await apiClient(`/reports/workflow-duration?${params.toString()}`)
  return mapWorkflowDurationReport(workflowDurationSchema.parse(response))
}
