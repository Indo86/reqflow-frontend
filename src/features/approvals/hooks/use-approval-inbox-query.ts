import { useQuery } from '@tanstack/react-query'
import { getApprovalInbox } from '../api/get-approval-inbox'
import { approvalKeys, type ApprovalInboxFilters } from '../api/approval-query-keys'

export interface UseApprovalInboxQueryOptions {
  // Menggunakan data API di halaman produksi tanpa mengubah halaman preview.
  enabled?: boolean
}

export function useApprovalInboxQuery(filters: ApprovalInboxFilters, options: UseApprovalInboxQueryOptions = {}) {
  return useQuery({
    queryKey: approvalKeys.inbox(filters),
    queryFn: () => getApprovalInbox(filters),
    enabled: options.enabled ?? true,
  })
}
