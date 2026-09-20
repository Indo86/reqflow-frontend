export interface ApprovalInboxFilters {
  page: number
  pageSize: number
}

// Feature-owned query keys — no global registry. There is no separate
// "approval context" key: that data lives on the Request detail response
// and is invalidated through requestKeys (features/requests/api) instead,
// per F3 "Request cache coordination".
export const approvalKeys = {
  all: ['approvals'] as const,
  inboxes: () => [...approvalKeys.all, 'inbox'] as const,
  inbox: (filters: ApprovalInboxFilters) => [...approvalKeys.inboxes(), filters] as const,
  details: () => [...approvalKeys.all, 'detail'] as const,
  detail: (approvalId: string) => [...approvalKeys.details(), approvalId] as const,
}
