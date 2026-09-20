import { apiClient } from '@/lib/api'
import { approvalDecisionResponseSchema } from '../schemas/approval.schema'
import type { ApprovalDecisionResult } from '../types/approval'

// POST /approvals/:id/approve — `id` is the Approval id (the current
// PENDING step), never the Request id; there is no route that approves "a
// request" directly. Comment is optional (approveSchema on the backend).
export async function approveRequest(approvalId: string, comment?: string): Promise<ApprovalDecisionResult> {
  const trimmed = comment?.trim()
  const response = await apiClient(`/approvals/${approvalId}/approve`, {
    method: 'POST',
    json: trimmed ? { comment: trimmed } : {},
  })
  return approvalDecisionResponseSchema.parse(response).data
}
