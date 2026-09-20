import type { RequestDetail, RequestDetailVariant } from '@/types/domain'
import { deniZaky, rinaPutri } from './users'

export const ownerDraftDetail: RequestDetail = {
  id: 'REQ-2026-00128',
  title: 'Ergonomic desk setup upgrade',
  status: 'Draft',
  type: 'Equipment',
  department: 'Engineering',
  requester: deniZaky,
  createdAt: 'Sep 17, 2026',
  amount: 3_450_000,
  description:
    'Requesting a sit-stand desk converter and an ergonomic chair for the pair-programming station on the 4th floor. Two engineers are currently sharing an uncomfortable setup during long pairing sessions.',
  vendor: 'Not yet selected',
  costCenter: 'ENG-4021',
  priority: 'Low',
  requestedDelivery: 'Oct 15, 2026',
  budgetLine: 'Engineering · Hardware FY26',
  quantity: '2 units',
  approvalSteps: [
    { role: 'Manager', status: 'not-started' },
    { role: 'Finance', status: 'not-started' },
    { role: 'Director', status: 'not-started' },
  ],
  comments: [],
  attachmentCount: 0,
}

export const currentApproverDetail: RequestDetail = {
  id: 'REQ-2026-00124',
  title: 'Purchase new development laptops',
  status: 'Pending',
  type: 'Equipment',
  department: 'Engineering',
  requester: deniZaky,
  createdAt: 'Sep 15, 2026',
  amount: 28_000_000,
  description:
    'Requesting 4 new development laptops (MacBook Pro 14", M3 Pro, 36GB RAM) to replace aging hardware currently used by the mobile platform team. Two current devices are past the 3-year refresh cycle and have started showing performance issues during builds and simulator testing. New hires joining the team in October will also need equipment provisioned ahead of their start date.',
  vendor: 'PT Digital Mitra Teknologi',
  costCenter: 'ENG-4021',
  priority: 'Medium',
  requestedDelivery: 'Oct 1, 2026',
  budgetLine: 'Engineering · Hardware FY26',
  quantity: '4 units',
  approvalSteps: [
    { role: 'Manager', status: 'completed', approver: 'Sarah Wijaya', decidedAt: 'Sep 15, 2026' },
    { role: 'Finance', status: 'completed', approver: 'Rina Putri', decidedAt: 'Sep 16, 2026' },
    { role: 'Director', status: 'current' },
  ],
  comments: [
    {
      author: 'Sarah Wijaya',
      initials: 'SW',
      timestamp: 'Sep 15, 2026 · 2:40 PM',
      text: 'Approved from the Engineering side — headcount and hardware budget both check out for Q3.',
    },
    {
      author: 'Rina Putri',
      initials: 'RP',
      timestamp: 'Sep 16, 2026 · 9:12 AM',
      text: 'Finance approved. Please confirm the vendor quote includes AppleCare+ for all 4 units before purchase.',
    },
    {
      author: 'Deni Zaky',
      initials: 'DZ',
      timestamp: 'Sep 16, 2026 · 11:05 AM',
      text: 'Confirmed with the vendor — AppleCare+ is included in the quoted price.',
    },
  ],
  attachmentCount: 2,
}

export const nonCurrentDetail: RequestDetail = {
  id: 'REQ-2026-00125',
  title: 'Client workshop catering',
  status: 'Pending',
  type: 'Reimbursement',
  department: 'Operations',
  requester: rinaPutri,
  createdAt: 'Sep 16, 2026',
  amount: 3_200_000,
  description:
    'Requesting 4 new development laptops (MacBook Pro 14", M3 Pro, 36GB RAM) to replace aging hardware currently used by the mobile platform team. Two current devices are past the 3-year refresh cycle and have started showing performance issues during builds and simulator testing. New hires joining the team in October will also need equipment provisioned ahead of their start date.',
  vendor: 'PT Digital Mitra Teknologi',
  costCenter: 'ENG-4021',
  priority: 'Medium',
  requestedDelivery: 'Oct 1, 2026',
  budgetLine: 'Engineering · Hardware FY26',
  quantity: '4 units',
  approvalSteps: [
    { role: 'Manager', status: 'completed', approver: 'Sarah Wijaya', decidedAt: 'Sep 16, 2026' },
    { role: 'Finance', status: 'current' },
    { role: 'Director', status: 'not-started' },
  ],
  comments: [
    {
      author: 'Sarah Wijaya',
      initials: 'SW',
      timestamp: 'Sep 16, 2026 · 10:02 AM',
      text: 'Approved as Manager — within team budget for client workshops this quarter.',
    },
  ],
  attachmentCount: 2,
}

export const adminViewOnlyDetail: RequestDetail = {
  ...currentApproverDetail,
}

export const requestDetailsByVariant: Record<RequestDetailVariant, RequestDetail> = {
  'owner-draft': ownerDraftDetail,
  'current-approver': currentApproverDetail,
  'non-current': nonCurrentDetail,
  'admin-view-only': adminViewOnlyDetail,
}

const detailById: Record<string, RequestDetail> = {
  [ownerDraftDetail.id]: ownerDraftDetail,
  [currentApproverDetail.id]: currentApproverDetail,
  [nonCurrentDetail.id]: nonCurrentDetail,
}

export function findRequestDetail(requestId: string | undefined): RequestDetail {
  if (requestId && detailById[requestId]) return detailById[requestId]
  return ownerDraftDetail
}
