import { apiClient } from '@/lib/api'
import { requestTransitionResponseSchema } from '../schemas/request.schema'
import type { RequestTransitionResult } from '../types/request'

// POST /requests/:id/cancel — owner-only. Legal from DRAFT/SUBMITTED/
// IN_REVIEW/REVISION_REQUIRED; the backend returns 409
// REQUEST_NOT_CANCELLABLE otherwise. A reason is optional for the first
// three and mandatory when withdrawing an IN_REVIEW request (400
// WITHDRAWAL_REASON_REQUIRED) — the UI collects it, the backend enforces it.
export async function cancelRequest(id: string, reason?: string): Promise<RequestTransitionResult> {
  const trimmed = reason?.trim()
  const response = await apiClient(`/requests/${id}/cancel`, {
    method: 'POST',
    ...(trimmed ? { json: { reason: trimmed } } : {}),
  })
  return requestTransitionResponseSchema.parse(response).data
}
