import { useQuery } from '@tanstack/react-query'
import { getApprovalInbox } from '../api/get-approval-inbox'
import { approvalKeys, type ApprovalInboxFilters } from '../api/approval-query-keys'

export function useApprovalInboxQuery(filters: ApprovalInboxFilters) {
  return useQuery({
    queryKey: approvalKeys.inbox(filters),
    queryFn: () => getApprovalInbox(filters),
  })
}
