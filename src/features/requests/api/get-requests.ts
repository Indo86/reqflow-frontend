import { apiClient } from '@/lib/api'
import { requestListResponseSchema } from '../schemas/request.schema'
import { mapRequestResponse, type RequestListResult } from '../types/request'
import type { RequestListFilters } from './request-query-keys'

// GET /requests — visibility (own-only vs org-wide) and filtering (type,
// status, q only — no date/department/createdBy filter exists) are entirely
// server-side; this just forwards the backend-supported query params as-is.
export async function getRequests(filters: RequestListFilters): Promise<RequestListResult> {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))
  if (filters.type) params.set('type', filters.type)
  if (filters.status) params.set('status', filters.status)
  if (filters.q) params.set('q', filters.q)

  const response = await apiClient(`/requests?${params.toString()}`)
  const parsed = requestListResponseSchema.parse(response)

  return {
    items: parsed.data.map(mapRequestResponse),
    meta: parsed.meta,
  }
}
