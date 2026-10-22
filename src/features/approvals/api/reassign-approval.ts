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

// POST /approvals/:id/reassign — Admin-only (M1). Moves a PENDING/WAITING
// step to another eligible approver; the reason is mandatory and is stored
// in the audit log. The backend re-validates eligibility (active, role,
// department, not the request owner), so the UI list is only a convenience.
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
