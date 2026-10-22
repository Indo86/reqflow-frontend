import { apiClient } from '@/lib/api'
import { approvalDecisionResponseSchema } from '../schemas/approval.schema'
import type { ApprovalDecisionResult } from '../types/approval'

// Mengirim data ke /approvals/:id/approve.
export async function approveRequest(approvalId: string, comment?: string): Promise<ApprovalDecisionResult> {
  const trimmed = comment?.trim()
  const response = await apiClient(`/approvals/${approvalId}/approve`, {
    method: 'POST',
    json: trimmed ? { comment: trimmed } : {},
  })
  return approvalDecisionResponseSchema.parse(response).data
}
