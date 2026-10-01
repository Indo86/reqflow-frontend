import { apiClient } from '@/lib/api'
import { requestReportSchema } from '../schemas/report.schema'
import { mapRequestReport, type RequestReport, type RequestReportFilters } from '../types/report'

// GET /reports/requests?status=&type=&departmentId=&createdById=&from=&to=
// — every param is optional; an omitted from/to bound means "no
// lower/upper bound, i.e. all-time" (report.schema.ts). `from` inclusive,
// `to` exclusive, never adjusted here. Visibility (own-only vs org-wide) is
// entirely server-side.
export async function getRequestReport(filters: RequestReportFilters): Promise<RequestReport> {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.type) params.set('type', filters.type)
  if (filters.departmentId) params.set('departmentId', filters.departmentId)
  if (filters.createdById) params.set('createdById', filters.createdById)
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)

  const response = await apiClient(`/reports/requests?${params.toString()}`)
  return mapRequestReport(requestReportSchema.parse(response))
}
