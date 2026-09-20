import { apiClient } from '@/lib/api'
import { approvalInboxResponseSchema } from '../schemas/approval.schema'
import { mapInboxResponse, type InboxListResult } from '../types/approval'
import type { ApprovalInboxFilters } from './approval-query-keys'

// GET /approvals/inbox — server-scoped to the signed-in user's own PENDING
// steps (approval.service.ts listInbox). This is never "list all Requests
// and compute my approvals client-side" — the backend inbox/current-
// assignment semantics are the only source of truth (F3 "Approval Inbox").
export async function getApprovalInbox(filters: ApprovalInboxFilters): Promise<InboxListResult> {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))

  const response = await apiClient(`/approvals/inbox?${params.toString()}`)
  return mapInboxResponse(approvalInboxResponseSchema.parse(response))
}
