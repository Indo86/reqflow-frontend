import { apiClient } from '@/lib/api'
import { approvalDecisionResponseSchema } from '../schemas/approval.schema'
import type { ApprovalDecisionResult } from '../types/approval'

// POST /approvals/:id/reject — comment is required by the backend
// (decisionWithRequiredCommentSchema); validated in the UI before this is
// ever called (see ApprovalDecisionDialog), not just here.
export async function rejectRequest(approvalId: string, comment: string): Promise<ApprovalDecisionResult> {
  const response = await apiClient(`/approvals/${approvalId}/reject`, {
    method: 'POST',
    json: { comment: comment.trim() },
  })
  return approvalDecisionResponseSchema.parse(response).data
}
