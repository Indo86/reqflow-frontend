import { z } from 'zod'
import { apiClient } from '@/lib/api'
import { approvalStatusSchema } from '../schemas/approval.schema'

const reassignApprovalResponseSchema = z.object({
  data: z.object({
    approvalId: z.string(),
    requestId: z.string(),
    status: approvalStatusSchema,
    approver: z.object({ id: z.string(), name: z.string() }),
  }),
})

// Mengirim data ke /approvals/:id/reassign.
export async function reassignApproval(
  approvalId: string,
  input: { approverId: string; reason: string }
) {
  const response = await apiClient(`/approvals/${approvalId}/reassign`, {
    method: 'POST',
    json: { approverId: input.approverId, reason: input.reason.trim() },
  })
  return reassignApprovalResponseSchema.parse(response).data
}
