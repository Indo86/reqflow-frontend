import { apiClient } from '@/lib/api'
import { requestTransitionResponseSchema } from '../schemas/request.schema'
import type { RequestStatus, RequestTransitionResult } from '../types/request'

// Mengirim data ke /requests/:id/submit.
export async function submitRequest(
  id: string,
  currentStatus: RequestStatus
): Promise<RequestTransitionResult> {
  const path = currentStatus === 'REVISION_REQUIRED' ? `/requests/${id}/resubmit` : `/requests/${id}/submit`
  const response = await apiClient(path, { method: 'POST' })
  return requestTransitionResponseSchema.parse(response).data
}
