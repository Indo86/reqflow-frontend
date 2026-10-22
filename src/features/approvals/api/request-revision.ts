import { apiClient } from '@/lib/api'
import { approvalDecisionResponseSchema } from '../schemas/approval.schema'
import type { ApprovalDecisionResult } from '../types/approval'

// Mengirim data ke /approvals/:id/request-revision.
export async function requestRevision(approvalId: string, comment: string): Promise<ApprovalDecisionResult> {
  const response = await apiClient(`/approvals/${approvalId}/request-revision`, {
    method: 'POST',
    json: { comment: comment.trim() },
  })
  return approvalDecisionResponseSchema.parse(response).data
}
