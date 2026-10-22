import type { StatCardData } from '@/lib/mock/dashboards'
import type { RequestStatus } from '@/features/requests/types/request'
import type { DashboardSummary } from '../types/dashboard'

// Menyimpan status request yang dianggap selesai.
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

// Membuat data melalui buildApproverStats.
export function buildApproverStats(summary: DashboardSummary): StatCardData[] {
  const { byStatus } = summary.requests
  return [
    { label: 'Pending My Approval', value: String(summary.approvals.pendingForCurrentUser), icon: 'pendingApproval', tone: 'amber' },
    { label: 'Open Requests', value: String(sumStatuses(byStatus, OPEN_STATUSES)), icon: 'requests', tone: 'accent' },
    { label: 'Pending Requests', value: String(sumStatuses(byStatus, PENDING_STATUSES)), icon: 'pending', tone: 'amber' },
    { label: 'Approved Requests', value: String(byStatus.APPROVED ?? 0), icon: 'approved', tone: 'green' },
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
