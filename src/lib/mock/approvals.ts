import type { Department, MockUser, RequestType } from '@/types/domain'
import { andiPratama, deniZaky, rinaPutri } from './users'

export interface ApprovalQueueRow {
  id: string
  title: string
  requester: MockUser
  type: RequestType
  department: Department
  amount: number
  currentStep: 'Manager' | 'Finance' | 'Director'
  submittedAt: string
}

export interface ApprovalPersonaQueue {
  title: string
  subtitle: string
  completedCount: number
  rows: ApprovalQueueRow[]
}

export const managerApprovals: ApprovalPersonaQueue = {
  title: 'Pending My Approval',
  subtitle:
    "Requests currently assigned to you at the Manager step — not the department or company's full approval queue",
  completedCount: 128,
  rows: [
    {
      id: 'REQ-2026-00126',
      title: 'Marketing campaign budget increase',
      requester: andiPratama,
      type: 'Purchase',
      department: 'Operations',
      amount: 35_000_000,
      currentStep: 'Manager',
      submittedAt: 'Sep 16, 2026',
    },
    {
      id: 'REQ-2026-00117',
      title: 'Remote work stipend Q3',
      requester: deniZaky,
      type: 'Reimbursement',
      department: 'Engineering',
      amount: 1_800_000,
      currentStep: 'Manager',
      submittedAt: 'Sep 14, 2026',
    },
    {
      id: 'REQ-2026-00129',
      title: 'Team lunch — sprint retro',
      requester: rinaPutri,
      type: 'Reimbursement',
      department: 'Engineering',
      amount: 950_000,
      currentStep: 'Manager',
      submittedAt: 'Sep 12, 2026',
    },
  ],
}

export const financeApprovals: ApprovalPersonaQueue = {
  title: 'Pending My Approval',
  subtitle:
    "Requests currently assigned to you at the Finance step — not the department or company's full approval queue",
  completedCount: 96,
  rows: [
    {
      id: 'REQ-2026-00125',
      title: 'Client workshop catering',
      requester: rinaPutri,
      type: 'Reimbursement',
      department: 'Operations',
      amount: 3_200_000,
      currentStep: 'Finance',
      submittedAt: 'Sep 16, 2026',
    },
    {
      id: 'REQ-2026-00112',
      title: 'Team building event venue',
      requester: andiPratama,
      type: 'Travel',
      department: 'Human Resources',
      amount: 18_500_000,
      currentStep: 'Finance',
      submittedAt: 'Sep 11, 2026',
    },
    {
      id: 'REQ-2026-00130',
      title: 'Design software renewal',
      requester: deniZaky,
      type: 'IT Support',
      department: 'Engineering',
      amount: 6_900_000,
      currentStep: 'Finance',
      submittedAt: 'Sep 9, 2026',
    },
  ],
}

export const directorApprovals: ApprovalPersonaQueue = {
  title: 'Pending My Approval',
  subtitle:
    "Requests currently assigned to you at the Director step — not the department or company's full approval queue",
  completedCount: 74,
  rows: [
    {
      id: 'REQ-2026-00124',
      title: 'Purchase new development laptops',
      requester: deniZaky,
      type: 'Equipment',
      department: 'Engineering',
      amount: 28_000_000,
      currentStep: 'Director',
      submittedAt: 'Sep 15, 2026',
    },
    {
      id: 'REQ-2026-00115',
      title: 'New HRIS software subscription',
      requester: rinaPutri,
      type: 'IT Support',
      department: 'Human Resources',
      amount: 52_000_000,
      currentStep: 'Director',
      submittedAt: 'Sep 13, 2026',
    },
  ],
}

export const approvalsByPersona = {
  manager: managerApprovals,
  finance: financeApprovals,
  director: directorApprovals,
}

export type ApprovalPersona = keyof typeof approvalsByPersona

export const managerAttentionRows = managerApprovals.rows
export const directorAttentionRows = directorApprovals.rows
