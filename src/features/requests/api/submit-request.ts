import { apiClient } from '@/lib/api'
import { requestTransitionResponseSchema } from '../schemas/request.schema'
import type { RequestStatus, RequestTransitionResult } from '../types/request'

// The backend exposes two distinct endpoints for what the UI presents as a
// single "Submit" action: POST /requests/:id/submit (from DRAFT) and
// POST /requests/:id/resubmit (from REVISION_REQUIRED) — both converge to
// IN_REVIEW. This picks the right one from the request's current status
// rather than duplicating that choice in every caller.
export async function submitRequest(
  id: string,
  currentStatus: RequestStatus
): Promise<RequestTransitionResult> {
  const path = currentStatus === 'REVISION_REQUIRED' ? `/requests/${id}/resubmit` : `/requests/${id}/submit`
  const response = await apiClient(path, { method: 'POST' })
  return requestTransitionResponseSchema.parse(response).data
}
