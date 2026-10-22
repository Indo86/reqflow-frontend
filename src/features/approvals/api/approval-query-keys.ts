export interface ApprovalInboxFilters {
  page: number
  pageSize: number
}

// Menyusun kunci cache untuk kueri ini.
export const approvalKeys = {
  all: ['approvals'] as const,
  inboxes: () => [...approvalKeys.all, 'inbox'] as const,
  inbox: (filters: ApprovalInboxFilters) => [...approvalKeys.inboxes(), filters] as const,
  details: () => [...approvalKeys.all, 'detail'] as const,
  detail: (approvalId: string) => [...approvalKeys.details(), approvalId] as const,
}
