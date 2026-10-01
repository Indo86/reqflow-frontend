import { useQuery } from '@tanstack/react-query'
import { getApprovalInbox } from '../api/get-approval-inbox'
import { approvalKeys, type ApprovalInboxFilters } from '../api/approval-query-keys'

export interface UseApprovalInboxQueryOptions {
  // Defaults to true. F6 dashboards pass false while rendering a /preview/*
  // persona (no real session to query against) — see F6 "Preview routes
  // keep mock data".
  enabled?: boolean
}

export function useApprovalInboxQuery(filters: ApprovalInboxFilters, options: UseApprovalInboxQueryOptions = {}) {
  return useQuery({
    queryKey: approvalKeys.inbox(filters),
    queryFn: () => getApprovalInbox(filters),
    enabled: options.enabled ?? true,
  })
}
