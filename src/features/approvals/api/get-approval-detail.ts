import { apiClient } from '@/lib/api'
import { approvalDetailResponseSchema } from '../schemas/approval.schema'
import { mapApprovalDetail, type ApprovalDetail } from '../types/approval'

// GET /approvals/:id — this, not GET /requests/:id, is how an assigned
// approver who is not the request's owner reviews it: getRequestDetail on
// the backend is owner/admin-only (createdById-scoped), while
// getApprovalDetail explicitly authorizes the assigned approver too. See
// approval.schema.ts's approvalDetailResponseSchema comment.
export async function getApprovalDetail(approvalId: string): Promise<ApprovalDetail> {
  const response = await apiClient(`/approvals/${approvalId}`)
  return mapApprovalDetail(approvalDetailResponseSchema.parse(response).data)
}
