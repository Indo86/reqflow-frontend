import { apiClient } from '@/lib/api'
import { requestDetailResponseSchema } from '../schemas/request.schema'
import { mapRequestDetailResponse, type RequestDetail } from '../types/request'

// GET /requests/:id — the backend collapses every visibility failure (not
// found, not owned, different organization) into a single 404
// REQUEST_NOT_FOUND, never 403. Callers must treat 404 as a controlled
// not-found state, not a permissions error to special-case.
export async function getRequest(id: string): Promise<RequestDetail> {
  const response = await apiClient(`/requests/${id}`)
  const parsed = requestDetailResponseSchema.parse(response)
  return mapRequestDetailResponse(parsed.data)
}
