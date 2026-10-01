import type { StatCardData } from '@/lib/mock/dashboards'
import type { RequestStatus } from '@/features/requests/types/request'
import type { DashboardSummary } from '../types/dashboard'

// "Open" = not yet in a terminal state — the complement of F2's own
// TERMINAL_REQUEST_STATUSES (APPROVED/REJECTED/CANCELLED,
// features/requests/types/request.ts). "Pending" = actually awaiting an
// approval decision (SUBMITTED/IN_REVIEW) — narrower than "Open", which also
// includes DRAFT (not yet submitted) and REVISION_REQUIRED (kicked back,
// shown as its own card). These are the only combinations used below, and
// every one is a plain sum of real, zero-filled backend counts — never a
// client-fetched-and-reduced list (F6 "No fake dashboard calculations").
const OPEN_STATUSES: RequestStatus[] = ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'REVISION_REQUIRED']
const PENDING_STATUSES: RequestStatus[] = ['SUBMITTED', 'IN_REVIEW']

function sumStatuses(byStatus: Partial<Record<RequestStatus, number>>, statuses: RequestStatus[]): number {
  return statuses.reduce((sum, status) => sum + (byStatus[status] ?? 0), 0)
}

export function buildOwnerStats(summary: DashboardSummary): StatCardData[] {
  const { byStatus } = summary.requests
  return [
    { label: 'My Open Requests', value: String(sumStatuses(byStatus, OPEN_STATUSES)), icon: 'requests', tone: 'accent' },
    { label: 'Pending Requests', value: String(sumStatuses(byStatus, PENDING_STATUSES)), icon: 'pending', tone: 'amber' },
    { label: 'Approved Requests', value: String(byStatus.APPROVED ?? 0), icon: 'approved', tone: 'green' },
    { label: 'Revision Required', value: String(byStatus.REVISION_REQUIRED ?? 0), icon: 'revision', tone: 'orange' },
  ]
}

// Manager/Finance/Director share this shape — M10 gives them exactly the
// same own-requests-only scope as Owner (no department-wide broadening
// exists anywhere in the backend), the only addition is their real assigned
// approval count.
export function buildApproverStats(summary: DashboardSummary): StatCardData[] {
  const { byStatus } = summary.requests
  return [
    { label: 'Pending My Approval', value: String(summary.approvals.pendingForCurrentUser), icon: 'pendingApproval', tone: 'amber' },
    { label: 'My Open Requests', value: String(sumStatuses(byStatus, OPEN_STATUSES)), icon: 'requests', tone: 'accent' },
    { label: 'My Pending Requests', value: String(sumStatuses(byStatus, PENDING_STATUSES)), icon: 'pending', tone: 'amber' },
    { label: 'My Approved Requests', value: String(byStatus.APPROVED ?? 0), icon: 'approved', tone: 'green' },
  ]
}

export function buildAdminStats(summary: DashboardSummary): StatCardData[] {
  const { byStatus, total } = summary.requests
  return [
    { label: 'Total Requests', value: String(total), icon: 'requests', tone: 'accent' },
    { label: 'Pending Approval', value: String(sumStatuses(byStatus, PENDING_STATUSES)), icon: 'pending', tone: 'amber' },
    { label: 'Approved', value: String(byStatus.APPROVED ?? 0), icon: 'approved', tone: 'green' },
    { label: 'Rejected', value: String(byStatus.REJECTED ?? 0), icon: 'rejected', tone: 'red' },
  ]
}
