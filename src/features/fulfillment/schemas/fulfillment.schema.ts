import { z } from 'zod'

// Mirrors reqFlow-backend's fulfillment.service.ts responses (M4), verified by
// direct inspection of that file. Fulfillment is separate from approval: a
// request stays APPROVED while its fulfillment moves through these states.
export const fulfillmentStatusSchema = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])

// NOT_TRACKED = approved before fulfillment tracking existed (no record, never
// backfilled). It must never be presented as completed or cancelled.
export const fulfillmentApplicabilitySchema = z.enum(['NOT_APPROVED', 'NOT_REQUIRED', 'TRACKED', 'NOT_TRACKED'])

const personSchema = z.object({ id: z.string(), name: z.string() })

// Same values as the request feature's backendRequestTypeSchema. Declared here, not
// imported, because request.schema.ts imports this file (for the list/detail summary)
// and an import back would be circular: whichever module loaded first would see the
// other's schema as undefined while defining its own.
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

// Computed by the server for the signed-in user. The UI only ever shows a
// control when the server says it is allowed; the server re-checks every action.
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

// The short summary the request list/detail responses carry.
export const fulfillmentSummarySchema = z.object({
  applicability: fulfillmentApplicabilitySchema,
  status: fulfillmentStatusSchema.nullable(),
  assignee: personSchema.nullable(),
})
