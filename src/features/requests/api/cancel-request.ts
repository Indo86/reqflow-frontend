import { apiClient } from '@/lib/api'
import { requestTransitionResponseSchema } from '../schemas/request.schema'
import type { RequestTransitionResult } from '../types/request'

// Mengirim data ke /requests/:id/cancel.
export async function cancelRequest(id: string, reason?: string): Promise<RequestTransitionResult> {
  const trimmed = reason?.trim()
  const response = await apiClient(`/requests/${id}/cancel`, {
    method: 'POST',
    ...(trimmed ? { json: { reason: trimmed } } : {}),
  })
  return requestTransitionResponseSchema.parse(response).data
}
