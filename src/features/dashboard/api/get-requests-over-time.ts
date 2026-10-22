import { apiClient } from '@/lib/api'
import { requestsOverTimeSchema } from '../schemas/dashboard.schema'
import { mapRequestsOverTime, type RequestsOverTimeResult } from '../types/dashboard'
import type { RequestsOverTimeFilters } from './dashboard-query-keys'

// Properti ini opsional agar penggunaan sebelumnya tetap didukung.
export async function getRequestsOverTime(filters: RequestsOverTimeFilters): Promise<RequestsOverTimeResult> {
  const params = new URLSearchParams()
  params.set('range', filters.range)

  const response = await apiClient(`/dashboard/requests-over-time?${params.toString()}`)
  return mapRequestsOverTime(requestsOverTimeSchema.parse(response))
}
