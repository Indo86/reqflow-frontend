import type { z } from 'zod'
import type {
  backendRequestStatusSchema,
  backendRequestTypeSchema,
  RequestResponse,
} from '../schemas/request.schema'
import type { ApprovalCycleHistoryItem } from '@/features/approvals/types/approval'
import { mapApprovalCycleHistoryItem } from '@/features/approvals/types/approval'

export type RequestType = z.infer<typeof backendRequestTypeSchema>
export type RequestStatus = z.infer<typeof backendRequestStatusSchema>

// Backend enum values are the only values ever sent to/received from the
// API — these maps exist purely for display, so a label change here can
// never accidentally change what gets sent in a request body.
export const requestTypeLabels: Record<RequestType, string> = {
  PURCHASE: 'Purchase',
  EQUIPMENT: 'Equipment',
  REIMBURSEMENT: 'Reimbursement',
  LEAVE: 'Leave',
  GENERAL: 'General',
}

export const requestStatusLabels: Record<RequestStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  IN_REVIEW: 'In Review',
  REVISION_REQUIRED: 'Revision Required',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
}

export interface Request {
  id: string
  requestNumber: string
  type: RequestType
  title: string
  description: string
  // Decimal string exactly as the backend serialized it (Prisma Decimal
  // .toString()) — never converted to a JS number here. Number(...) is only
  // ever safe at the final presentation call site (formatRupiah), never for
  // storage or comparison. See README "Money Handling".
  amount: string | null
  status: RequestStatus
  createdAt: string
  updatedAt: string
  createdBy: { id: string; name: string }
  department: { id: string; name: string } | null
}

export function mapRequestResponse(dto: RequestResponse): Request {
  return {
    id: dto.id,
    requestNumber: dto.requestNumber,
    type: dto.type,
    title: dto.title,
    description: dto.description,
    amount: dto.amount,
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    createdBy: dto.createdBy,
    department: dto.department,
  }
}

export interface RequestDetail extends Request {
  approvalCycles: ApprovalCycleHistoryItem[]
  commentsCount: number
  attachmentsCount: number
}

export function mapRequestDetailResponse(
  dto: RequestResponse & {
    approvalCycles: Parameters<typeof mapApprovalCycleHistoryItem>[0][]
    commentsCount: number
    attachmentsCount: number
  }
): RequestDetail {
  return {
    ...mapRequestResponse(dto),
    approvalCycles: dto.approvalCycles.map(mapApprovalCycleHistoryItem),
    commentsCount: dto.commentsCount,
    attachmentsCount: dto.attachmentsCount,
  }
}

export interface RequestListMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface RequestListResult {
  items: Request[]
  meta: RequestListMeta
}

// The shared result of submit/resubmit/cancel — the backend never returns
// the full Request from these endpoints, only this transition summary.
export interface RequestTransitionResult {
  id: string
  requestNumber: string
  status: RequestStatus
}

// Backend-confirmed lifecycle facts (request-transition.service.ts) — kept
// here as UI-presentation hints only. The backend remains the sole authority
// for whether a transition actually succeeds; these constants only decide
// which buttons are reasonable to render.
export const EDITABLE_STATUSES: RequestStatus[] = ['DRAFT', 'REVISION_REQUIRED']
export const DELETABLE_STATUSES: RequestStatus[] = ['DRAFT']
export const CANCELLABLE_STATUSES: RequestStatus[] = ['DRAFT', 'SUBMITTED', 'REVISION_REQUIRED']

// Mirrors collaboration.service.ts's TERMINAL_REQUEST_STATUSES exactly — a
// terminal request is frozen for new comments/attachments for everyone,
// including the owner (F4). UI hint only; the backend's own 409
// REQUEST_COLLABORATION_CLOSED remains authoritative.
export const TERMINAL_REQUEST_STATUSES: RequestStatus[] = ['APPROVED', 'REJECTED', 'CANCELLED']
