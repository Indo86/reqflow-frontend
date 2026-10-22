import { apiClient } from '@/lib/api'
import { requestListResponseSchema } from '../schemas/request.schema'
import { mapRequestResponse, type RequestListResult } from '../types/request'
import type { RequestListFilters } from './request-query-keys'

// Mengambil data dari /requests.
export async function getRequests(filters: RequestListFilters): Promise<RequestListResult> {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))
  if (filters.type) params.set('type', filters.type)
  if (filters.status) params.set('status', filters.status)
  if (filters.q) params.set('q', filters.q)
  if (filters.view && filters.view !== 'all') params.set('view', filters.view)

  const response = await apiClient(`/requests?${params.toString()}`)
  const parsed = requestListResponseSchema.parse(response)

  return {
    items: parsed.data.map(mapRequestResponse),
    meta: parsed.meta,
  }
}
