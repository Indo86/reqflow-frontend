import { apiClient } from '@/lib/api'
import { approvalDecisionResponseSchema } from '../schemas/approval.schema'
import type { ApprovalDecisionResult } from '../types/approval'

// Mengirim data ke /approvals/:id/reject.
export async function rejectRequest(approvalId: string, comment: string): Promise<ApprovalDecisionResult> {
  const response = await apiClient(`/approvals/${approvalId}/reject`, {
    method: 'POST',
    json: { comment: comment.trim() },
  })
  return approvalDecisionResponseSchema.parse(response).data
}
