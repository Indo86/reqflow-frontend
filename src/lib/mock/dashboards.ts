import type { ActivityEntry, BreakdownRow, RequestListItem } from '@/types/domain'
import { andiPratama, deniZaky, sarahWijaya } from './users'

export interface StatCardData {
  label: string
  value: string
  icon: 'requests' | 'pending' | 'approved' | 'revision' | 'pendingApproval' | 'rejected'
  tone: 'accent' | 'amber' | 'green' | 'orange' | 'red'
  delta: string
  trend: 'up' | 'down' | 'flat'
}

export const ownerStats: StatCardData[] = [
  { label: 'My Open Requests', value: '4', icon: 'requests', tone: 'accent', delta: 'Draft + Pending', trend: 'flat' },
  { label: 'Pending Requests', value: '3', icon: 'pending', tone: 'amber', delta: 'Awaiting approval', trend: 'flat' },
  { label: 'Approved Requests', value: '12', icon: 'approved', tone: 'green', delta: 'All-time', trend: 'flat' },
  { label: 'Revision Required', value: '0', icon: 'revision', tone: 'orange', delta: 'Nothing to fix right now', trend: 'flat' },
]

export const ownerRecentRequests: RequestListItem[] = [
  { id: 'REQ-2026-00130', title: 'Design software renewal', type: 'IT Support', department: 'Engineering', amount: 6_900_000, status: 'Pending', createdAt: 'Sep 9, 2026', requester: deniZaky },
  { id: 'REQ-2026-00128', title: 'Ergonomic desk setup upgrade', type: 'Equipment', department: 'Engineering', amount: 3_450_000, status: 'Draft', createdAt: 'Sep 17, 2026', requester: deniZaky },
  { id: 'REQ-2026-00124', title: 'Purchase new development laptops', type: 'Equipment', department: 'Engineering', amount: 28_000_000, status: 'Pending', createdAt: 'Sep 15, 2026', requester: deniZaky },
  { id: 'REQ-2026-00120', title: 'Adobe Creative Cloud licenses (5 seats)', type: 'IT Support', department: 'Engineering', amount: 9_800_000, status: 'Rejected', createdAt: 'Sep 8, 2026', requester: deniZaky },
  { id: 'REQ-2026-00117', title: 'Remote work stipend Q3', type: 'Reimbursement', department: 'Engineering', amount: 1_800_000, status: 'Pending', createdAt: 'Sep 14, 2026', requester: deniZaky },
]

export const ownerStatusBreakdown: BreakdownRow[] = [
  { label: 'Approved', value: 12, percent: 67, color: 'var(--green-dot)' },
  { label: 'Pending', value: 3, percent: 17, color: 'var(--amber-dot)' },
  { label: 'Draft', value: 1, percent: 6, color: '#8A93A6' },
  { label: 'Rejected', value: 2, percent: 11, color: 'var(--red-dot)' },
]

export const managerStats: StatCardData[] = [
  { label: 'Pending My Approval', value: '3', icon: 'pendingApproval', tone: 'amber', delta: 'Assigned to you', trend: 'flat' },
  { label: 'My Open Requests', value: '2', icon: 'requests', tone: 'accent', delta: 'Draft + Pending', trend: 'flat' },
  { label: 'My Pending Requests', value: '1', icon: 'pending', tone: 'amber', delta: 'Awaiting approval', trend: 'flat' },
  { label: 'My Approved Requests', value: '9', icon: 'approved', tone: 'green', delta: 'All-time', trend: 'flat' },
]

export const managerRecentRequests: RequestListItem[] = [
  { id: 'REQ-2026-00123', title: 'Cloud infrastructure reimbursement', type: 'Reimbursement', department: 'Engineering', amount: 12_500_000, status: 'Approved', createdAt: 'Sep 14, 2026', requester: sarahWijaya },
  { id: 'REQ-2026-00118', title: 'Jakarta client visit travel', type: 'Travel', department: 'Finance', amount: 6_300_000, status: 'Draft', createdAt: 'Sep 3, 2026', requester: sarahWijaya },
]

export const directorStats: StatCardData[] = [
  { label: 'Pending My Approval', value: '2', icon: 'pendingApproval', tone: 'amber', delta: 'Assigned to you', trend: 'flat' },
  { label: 'My Open Requests', value: '2', icon: 'requests', tone: 'accent', delta: 'Draft + Pending', trend: 'flat' },
  { label: 'My Pending Requests', value: '1', icon: 'pending', tone: 'amber', delta: 'Awaiting approval', trend: 'flat' },
  { label: 'My Approved Requests', value: '7', icon: 'approved', tone: 'green', delta: 'All-time', trend: 'flat' },
]

export const directorRecentRequests: RequestListItem[] = [
  { id: 'REQ-2026-00122', title: 'Office equipment replacement', type: 'Equipment', department: 'Operations', amount: 4_750_000, status: 'Approved', createdAt: 'Sep 12, 2026', requester: andiPratama },
  { id: 'REQ-2026-00119', title: 'Client dinner reimbursement', type: 'Reimbursement', department: 'Operations', amount: 2_150_000, status: 'Revision', createdAt: 'Sep 6, 2026', requester: andiPratama },
]

export const directorHighValueRows = [
  { id: 'REQ-2026-00115', title: 'New HRIS software subscription', requesterName: 'Rina Putri', department: 'Finance', amount: 52_000_000 },
  { id: 'REQ-2026-00124', title: 'Purchase new development laptops', requesterName: 'Deni Zaky', department: 'Engineering', amount: 28_000_000 },
]

export const adminStats: StatCardData[] = [
  { label: 'Total Requests', value: '428', icon: 'requests', tone: 'accent', delta: '+12 this month', trend: 'up' },
  { label: 'Pending Approval', value: '47', icon: 'pending', tone: 'amber', delta: '8 need action today', trend: 'flat' },
  { label: 'Approved', value: '342', icon: 'approved', tone: 'green', delta: '+6.4% vs last month', trend: 'up' },
  { label: 'Rejected', value: '25', icon: 'rejected', tone: 'red', delta: '-2 vs last month', trend: 'down' },
]

export const requestsOverTimeSeries = [
  { label: 'Apr', value: 62 },
  { label: 'May', value: 68 },
  { label: 'Jun', value: 74 },
  { label: 'Jul', value: 71 },
  { label: 'Aug', value: 81 },
  { label: 'Sep', value: 84 },
]

export const statusBreakdown: BreakdownRow[] = [
  { label: 'Approved', value: 342, percent: 80, color: 'var(--green-dot)' },
  { label: 'Pending', value: 47, percent: 11, color: 'var(--amber-dot)' },
  { label: 'Rejected', value: 25, percent: 6, color: 'var(--red-dot)' },
  { label: 'Revision', value: 9, percent: 2, color: 'var(--orange-dot)' },
  { label: 'Draft', value: 5, percent: 1, color: '#8A93A6' },
]

export const typeBreakdown: BreakdownRow[] = [
  { label: 'Purchase', value: 168, percent: 39, color: 'var(--rf-accent)' },
  { label: 'Reimbursement', value: 121, percent: 28, color: '#6D8BE8' },
  { label: 'Equipment', value: 74, percent: 17, color: '#9AB1EF' },
  { label: 'Travel', value: 42, percent: 10, color: '#C3D1F5' },
  { label: 'IT Support', value: 23, percent: 5, color: '#E1E8FB' },
]

export const departmentBreakdown: BreakdownRow[] = [
  { label: 'Engineering', value: 176, percent: 41, color: 'var(--rf-accent)' },
  { label: 'Operations', value: 118, percent: 28, color: '#6D8BE8' },
  { label: 'Finance', value: 79, percent: 18, color: '#9AB1EF' },
  { label: 'Human Resources', value: 55, percent: 13, color: '#C3D1F5' },
]

export const recentActivity: ActivityEntry[] = [
  { id: 'a1', kind: 'approved', title: 'Request approved', description: 'REQ-2026-00121 approved by Sarah Wijaya', time: '10 minutes ago' },
  { id: 'a2', kind: 'submitted', title: 'New request submitted', description: 'REQ-2026-00124 submitted by Deni Zaky', time: '42 minutes ago' },
  { id: 'a3', kind: 'comment', title: 'Comment added', description: 'Andi Pratama commented on REQ-2026-00119', time: '1 hour ago' },
  { id: 'a4', kind: 'revision', title: 'Revision requested', description: 'Finance requested changes on REQ-2026-00117', time: '3 hours ago' },
  { id: 'a5', kind: 'rejected', title: 'Request rejected', description: 'REQ-2026-00113 rejected by Rina Putri', time: 'Yesterday' },
]
