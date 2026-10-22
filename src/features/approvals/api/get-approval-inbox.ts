import { apiClient } from '@/lib/api'
import { approvalInboxResponseSchema } from '../schemas/approval.schema'
import { mapInboxResponse, type InboxListResult } from '../types/approval'
import type { ApprovalInboxFilters } from './approval-query-keys'

// Mengambil data dari /approvals/inbox.
export async function getApprovalInbox(filters: ApprovalInboxFilters): Promise<InboxListResult> {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))

  const response = await apiClient(`/approvals/inbox?${params.toString()}`)
  return mapInboxResponse(approvalInboxResponseSchema.parse(response))
}
