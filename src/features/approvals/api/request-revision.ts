import { apiClient } from '@/lib/api'
import { approvalDecisionResponseSchema } from '../schemas/approval.schema'
import type { ApprovalDecisionResult } from '../types/approval'

// POST /approvals/:id/request-revision — comment is required by the
// backend (decisionWithRequiredCommentSchema), same as reject.
export async function requestRevision(approvalId: string, comment: string): Promise<ApprovalDecisionResult> {
  const response = await apiClient(`/approvals/${approvalId}/request-revision`, {
    method: 'POST',
    json: { comment: comment.trim() },
  })
  return approvalDecisionResponseSchema.parse(response).data
}
