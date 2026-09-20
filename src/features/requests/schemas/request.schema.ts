import { z } from 'zod'
import { approvalCycleHistoryItemSchema } from '@/features/approvals/schemas/approval.schema'

// Mirrors reqFlow-backend's RequestType/RequestStatus enums (prisma/schema.prisma)
// and RequestResponse/PaginatedRequests shapes (src/services/request.service.ts,
// src/controllers/request.controller.ts) — verified by direct backend inspection,
// not assumed. `amount` is a decimal STRING here (Prisma Decimal.toString()),
// never a JS number — see types/request.ts for why it must stay a string end to end.
export const backendRequestTypeSchema = z.enum([
  'PURCHASE',
  'EQUIPMENT',
  'REIMBURSEMENT',
  'LEAVE',
  'GENERAL',
])

export const backendRequestStatusSchema = z.enum([
  'DRAFT',
  'SUBMITTED',
  'IN_REVIEW',
  'REVISION_REQUIRED',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
])

const requestCreatedBySchema = z.object({
  id: z.string(),
  name: z.string(),
})

const requestDepartmentSchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .nullable()

export const requestResponseSchema = z.object({
  id: z.string(),
  requestNumber: z.string(),
  type: backendRequestTypeSchema,
  title: z.string(),
  description: z.string(),
  amount: z.string().nullable(),
  status: backendRequestStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: requestCreatedBySchema,
  department: requestDepartmentSchema,
})

export type RequestResponse = z.infer<typeof requestResponseSchema>

export const requestListResponseSchema = z.object({
  data: z.array(requestResponseSchema),
  meta: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

// Detail adds approval history (real as of F3 — see
// features/approvals/schemas/approval.schema.ts, the single source of truth
// for that shape) plus comment/attachment counts (F4 still renders those as
// a placeholder; only the counts are validated here).
export const requestDetailResponseSchema = z.object({
  data: requestResponseSchema.extend({
    approvalCycles: z.array(approvalCycleHistoryItemSchema),
    commentsCount: z.number(),
    attachmentsCount: z.number(),
  }),
})

export const requestSingleResponseSchema = z.object({
  data: requestResponseSchema,
})

// POST/PATCH /requests/:id/submit|resubmit|cancel response — deliberately
// separate from RequestResponse: the backend's RequestTransitionResult only
// ever carries {id, requestNumber, status}, never the full request.
export const requestTransitionResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    requestNumber: z.string(),
    status: backendRequestStatusSchema,
  }),
})
