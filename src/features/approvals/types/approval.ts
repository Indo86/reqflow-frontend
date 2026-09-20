import type { z } from 'zod'
// Type-only import: erased at compile time, so this never creates a runtime
// circular dependency with features/requests/types/request.ts (which
// imports from this file at runtime for mapApprovalCycleHistoryItem).
// Components that need requestStatusLabels/requestTypeLabels import them
// directly from that module instead of through here.
import type { RequestStatus, RequestType } from '@/features/requests/types/request'
import type {
  approvalCycleHistoryItemSchema,
  approvalCycleStatusSchema,
  approvalDetailResponseSchema,
  approvalHistoryItemSchema,
  approvalInboxResponseSchema,
  approvalPolicySchema,
  approvalStatusSchema,
  approvalStepTypeSchema,
  inboxItemSchema,
} from '../schemas/approval.schema'

export type ApprovalStepType = z.infer<typeof approvalStepTypeSchema>
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>
export type ApprovalCycleStatus = z.infer<typeof approvalCycleStatusSchema>
export type ApprovalPolicy = z.infer<typeof approvalPolicySchema>

export const approvalStepTypeLabels: Record<ApprovalStepType, string> = {
  MANAGER: 'Manager',
  FINANCE: 'Finance',
  DIRECTOR: 'Director',
}

// WAITING/SKIPPED never surface on the Approval Inbox (only PENDING rows
// do), but both appear in a Request's full approvalCycles history.
export const approvalStatusLabels: Record<ApprovalStatus, string> = {
  WAITING: 'Not started',
  PENDING: 'Awaiting decision',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  REVISION_REQUESTED: 'Revision requested',
  SKIPPED: 'Skipped',
}

export interface ApprovalHistoryItem {
  id: string
  stepOrder: number
  stepType: ApprovalStepType
  status: ApprovalStatus
  decisionComment: string | null
  approver: { id: string; name: string }
  createdAt: string
  decidedAt: string | null
}

export interface ApprovalCycleHistoryItem {
  cycleNumber: number
  policy: ApprovalPolicy
  status: ApprovalCycleStatus
  createdAt: string
  completedAt: string | null
  approvals: ApprovalHistoryItem[]
}

export function mapApprovalHistoryItem(
  dto: z.infer<typeof approvalHistoryItemSchema>
): ApprovalHistoryItem {
  return dto
}

export function mapApprovalCycleHistoryItem(
  dto: z.infer<typeof approvalCycleHistoryItemSchema>
): ApprovalCycleHistoryItem {
  return { ...dto, approvals: dto.approvals.map(mapApprovalHistoryItem) }
}

// Finds the single actionable step across every cycle in a Request's
// history — there is at most one PENDING approval at a time (an ACTIVE
// cycle has exactly one active step; REJECTED/APPROVED/REVISION_REQUESTED
// cycles have none). Never derived from array index/position — the
// backend's own `status` field is the only source of truth (F3 "Current
// step").
export function findPendingApproval(cycles: ApprovalCycleHistoryItem[]): ApprovalHistoryItem | undefined {
  for (const cycle of cycles) {
    const pending = cycle.approvals.find((approval) => approval.status === 'PENDING')
    if (pending) return pending
  }
  return undefined
}

export interface InboxRequestSummary {
  id: string
  requestNumber: string
  type: RequestType
  title: string
  amount: string | null
  status: RequestStatus
  createdBy: { id: string; name: string }
  department: { id: string; name: string } | null
}

export interface InboxItem {
  id: string
  cycleNumber: number
  stepOrder: number
  stepType: ApprovalStepType
  status: ApprovalStatus
  request: InboxRequestSummary
}

export function mapInboxItem(dto: z.infer<typeof inboxItemSchema>): InboxItem {
  return dto
}

export interface InboxListMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface InboxListResult {
  items: InboxItem[]
  meta: InboxListMeta
}

export function mapInboxResponse(dto: z.infer<typeof approvalInboxResponseSchema>): InboxListResult {
  return { items: dto.data.map(mapInboxItem), meta: dto.meta }
}

// GET /approvals/:id's shape — deliberately smaller than a full Request:
// only RequestSummary (no description, no other steps' history). See
// api/get-approval-detail.ts for why an approver reviews here instead of
// the Request Detail page.
export interface ApprovalDetail {
  id: string
  cycleNumber: number
  stepOrder: number
  stepType: ApprovalStepType
  status: ApprovalStatus
  decisionComment: string | null
  createdAt: string
  decidedAt: string | null
  approver: { id: string; name: string }
  cyclePolicy: ApprovalPolicy
  request: InboxRequestSummary
}

export function mapApprovalDetail(dto: z.infer<typeof approvalDetailResponseSchema>['data']): ApprovalDetail {
  return dto
}

export interface ApprovalDecisionResult {
  approvalId: string
  requestId: string
  approvalStatus: ApprovalStatus
  requestStatus: RequestStatus
}
