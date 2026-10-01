import { apiClient } from '@/lib/api'
import { requestsOverTimeSchema } from '../schemas/dashboard.schema'
import { mapRequestsOverTime, type RequestsOverTimeResult } from '../types/dashboard'
import type { RequestsOverTimeFilters } from './dashboard-query-keys'

// GET /dashboard/requests-over-time?from=&to=&bucket= — from/to/bucket are
// all required by the backend (no defaults). `from` is inclusive, `to` is
// exclusive — callers must pass the exact boundary they mean; this function
// never adjusts it (dashboard.schema.ts: "No implicit end-of-day adjustment
// happens anywhere in this module"). Empty buckets are omitted by the
// backend, not zero-filled, and this function preserves that as-is.
export async function getRequestsOverTime(filters: RequestsOverTimeFilters): Promise<RequestsOverTimeResult> {
  const params = new URLSearchParams()
  params.set('from', filters.from)
  params.set('to', filters.to)
  params.set('bucket', filters.bucket)

  const response = await apiClient(`/dashboard/requests-over-time?${params.toString()}`)
  return mapRequestsOverTime(requestsOverTimeSchema.parse(response))
}
