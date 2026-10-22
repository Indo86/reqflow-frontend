import { z } from 'zod'

// Menangani proses pemenuhan request.
export const fulfillmentStatusSchema = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])

// Menangani proses pemenuhan request.
export const fulfillmentApplicabilitySchema = z.enum(['NOT_APPROVED', 'NOT_REQUIRED', 'TRACKED', 'NOT_TRACKED'])

const personSchema = z.object({ id: z.string(), name: z.string() })

// Memvalidasi bentuk data sesuai kontrak API.
const requestTypeSchema = z.enum(['PURCHASE', 'EQUIPMENT', 'REIMBURSEMENT', 'LEAVE', 'GENERAL'])

export const fulfillmentRecordSchema = z.object({
  id: z.string(),
  status: fulfillmentStatusSchema,
  assignee: personSchema.nullable(),
  startedAt: z.string().nullable(),
  closedAt: z.string().nullable(),
  closedBy: personSchema.nullable(),
  closingNote: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// Menyiapkan data untuk ditampilkan di antarmuka.
export const fulfillmentPermissionsSchema = z.object({
  canStart: z.boolean(),
  canComplete: z.boolean(),
  canCancel: z.boolean(),
  canAssign: z.boolean(),
  canComment: z.boolean(),
  canAddEvidence: z.boolean(),
})

export const fulfillmentResponseSchema = z.object({
  data: z.object({
    requestId: z.string(),
    applicability: fulfillmentApplicabilitySchema,
    fulfillment: fulfillmentRecordSchema.nullable(),
    permissions: fulfillmentPermissionsSchema,
  }),
})

export const assignmentCandidatesResponseSchema = z.object({
  data: z.array(z.object({ id: z.string(), name: z.string(), email: z.string(), role: z.string() })),
})

export const fulfillmentListResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      status: fulfillmentStatusSchema,
      assignee: personSchema.nullable(),
      createdAt: z.string(),
      startedAt: z.string().nullable(),
      closedAt: z.string().nullable(),
      request: z.object({
        id: z.string(),
        requestNumber: z.string(),
        type: requestTypeSchema,
        title: z.string(),
        amount: z.string().nullable(),
        createdBy: personSchema,
        department: personSchema.nullable(),
      }),
    })
  ),
  meta: z.object({ page: z.number(), pageSize: z.number(), total: z.number(), totalPages: z.number() }),
})

// Memvalidasi ringkasan data fulfillment.
export const fulfillmentSummarySchema = z.object({
  applicability: fulfillmentApplicabilitySchema,
  status: fulfillmentStatusSchema.nullable(),
  assignee: personSchema.nullable(),
})
