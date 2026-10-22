import { apiClient } from '@/lib/api'
import { approvalDetailResponseSchema } from '../schemas/approval.schema'
import { mapApprovalDetail, type ApprovalDetail } from '../types/approval'

// Mengambil data dari /approvals/:id.
export async function getApprovalDetail(approvalId: string): Promise<ApprovalDetail> {
  const response = await apiClient(`/approvals/${approvalId}`)
  return mapApprovalDetail(approvalDetailResponseSchema.parse(response).data)
}
