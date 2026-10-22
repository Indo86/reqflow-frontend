import { z } from 'zod'
import { approvalCycleHistoryItemSchema } from '@/features/approvals/schemas/approval.schema'
import { fulfillmentSummarySchema } from '@/features/fulfillment/schemas/fulfillment.schema'

// Memvalidasi bentuk data sesuai kontrak API.
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

// Memvalidasi hubungan pengguna dengan request.
export const requestViewerSchema = z.object({
  relationship: z.enum(['OWNER', 'APPROVER', 'EXECUTOR', 'OVERSIGHT']),
  approval: z.enum(['AWAITING_DECISION', 'DECIDED']).nullable(),
})
export const scopedRequestResponseSchema = requestResponseSchema.extend({
  viewer: requestViewerSchema,
  // Properti ini opsional agar penggunaan sebelumnya tetap didukung.
  fulfillment: fulfillmentSummarySchema.optional(),
})

export const requestListResponseSchema = z.object({
  data: z.array(scopedRequestResponseSchema),
  meta: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

// Memvalidasi bentuk data sesuai kontrak API.
export const requestDetailResponseSchema = z.object({
  data: scopedRequestResponseSchema.extend({
    approvalCycles: z.array(approvalCycleHistoryItemSchema),
    commentsCount: z.number(),
    attachmentsCount: z.number(),
  }),
})

export const requestSingleResponseSchema = z.object({
  data: requestResponseSchema,
})

// Memperbarui data melalui /requests/:id/submit|resubmit|cancel.
export const requestTransitionResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    requestNumber: z.string(),
    status: backendRequestStatusSchema,
  }),
})
