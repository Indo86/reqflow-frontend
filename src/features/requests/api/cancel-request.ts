import { apiClient } from '@/lib/api'
import { requestTransitionResponseSchema } from '../schemas/request.schema'
import type { RequestTransitionResult } from '../types/request'

// POST /requests/:id/cancel — owner-only, no request body, no reason
// required. Legal only from DRAFT/SUBMITTED/REVISION_REQUIRED; the backend
// returns 409 REQUEST_NOT_CANCELLABLE otherwise.
export async function cancelRequest(id: string): Promise<RequestTransitionResult> {
  const response = await apiClient(`/requests/${id}/cancel`, { method: 'POST' })
  return requestTransitionResponseSchema.parse(response).data
}
