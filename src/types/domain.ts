export type Role = 'Employee' | 'Manager' | 'Finance' | 'Director' | 'Admin'

export type Department = 'Engineering' | 'Finance' | 'Operations' | 'Human Resources'

export type RequestType = 'Purchase' | 'Reimbursement' | 'Equipment' | 'Travel' | 'IT Support'

export type RequestStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Revision'

export type ApprovalStepStatus = 'completed' | 'current' | 'not-started'

export interface MockUser {
  id: string
  name: string
  initials: string
  role: Role
  department: Department
}

export interface RequestListItem {
  id: string
  title: string
  type: RequestType
  department: Department
  amount: number
  status: RequestStatus
  createdAt: string
  requester: MockUser
}

export interface ApprovalStepInfo {
  role: 'Manager' | 'Finance' | 'Director'
  status: ApprovalStepStatus
  approver?: string
  decidedAt?: string
}

export interface CommentEntry {
  author: string
  initials: string
  timestamp: string
  text: string
}

export interface RequestDetail {
  id: string
  title: string
  status: RequestStatus
  type: RequestType
  department: Department
  requester: MockUser
  createdAt: string
  amount: number
  description: string
  vendor: string
  costCenter: string
  priority: 'Low' | 'Medium' | 'High'
  requestedDelivery: string
  budgetLine: string
  quantity: string
  approvalSteps: ApprovalStepInfo[]
  comments: CommentEntry[]
  attachmentCount: number
}

export type RequestDetailVariant = 'owner-draft' | 'current-approver' | 'non-current' | 'admin-view-only'

export interface ActivityEntry {
  id: string
  title: string
  description: string
  time: string
  kind: 'approved' | 'submitted' | 'comment' | 'revision' | 'rejected'
}

export interface BreakdownRow {
  label: string
  value: number
  percent: number
  color: string
}
