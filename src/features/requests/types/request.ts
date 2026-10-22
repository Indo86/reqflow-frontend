import type { z } from 'zod'
import type {
  backendRequestStatusSchema,
  backendRequestTypeSchema,
  requestViewerSchema,
  RequestResponse,
} from '../schemas/request.schema'
import type { ApprovalCycleHistoryItem } from '@/features/approvals/types/approval'
import type { FulfillmentBadgeSummary } from '@/features/fulfillment/components/fulfillment-badge'
import { mapApprovalCycleHistoryItem } from '@/features/approvals/types/approval'

export type RequestType = z.infer<typeof backendRequestTypeSchema>
export type RequestStatus = z.infer<typeof backendRequestStatusSchema>
export type RequestViewer = z.infer<typeof requestViewerSchema>

// Menyiapkan data untuk ditampilkan di antarmuka.
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
  // Menyiapkan data untuk ditampilkan di antarmuka.
  amount: string | null
  status: RequestStatus
  createdAt: string
  updatedAt: string
  createdBy: { id: string; name: string }
  department: { id: string; name: string } | null
  // Informasi viewer hanya tersedia pada detail request.
  viewer?: RequestViewer
  // Properti ini opsional agar penggunaan sebelumnya tetap didukung.
  fulfillment?: FulfillmentBadgeSummary
}

export function mapRequestResponse(dto: RequestResponse & { viewer?: RequestViewer; fulfillment?: FulfillmentBadgeSummary }): Request {
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
    viewer: dto.viewer,
    fulfillment: dto.fulfillment,
  }
}

export interface RequestDetail extends Request {
  approvalCycles: ApprovalCycleHistoryItem[]
  commentsCount: number
  attachmentsCount: number
}

export function mapRequestDetailResponse(
  dto: RequestResponse & {
    viewer?: RequestViewer
    fulfillment?: FulfillmentBadgeSummary
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

// Mendefinisikan struktur data RequestTransitionResult.
export interface RequestTransitionResult {
  id: string
  requestNumber: string
  status: RequestStatus
}

// Hak akses tetap divalidasi oleh backend.
export const EDITABLE_STATUSES: RequestStatus[] = ['DRAFT', 'REVISION_REQUIRED']
export const DELETABLE_STATUSES: RequestStatus[] = ['DRAFT']
// Menyiapkan data untuk ditampilkan di antarmuka.
export const CANCELLABLE_STATUSES: RequestStatus[] = ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'REVISION_REQUIRED']

// Backend tetap menjadi sumber data dan aturan utama.
export const TERMINAL_REQUEST_STATUSES: RequestStatus[] = ['APPROVED', 'REJECTED', 'CANCELLED']
