import { z } from 'zod'
import { backendRequestStatusSchema, backendRequestTypeSchema } from '@/features/requests/schemas/request.schema'

// Mirrors reqFlow-backend's M10 report.service.ts RequestReportResult /
// WorkflowDurationResult shapes exactly — verified by direct backend
// inspection. Both share the `{ data: ... }` envelope, same as dashboard.
export const requestReportSchema = z.object({
  data: z.object({
    filters: z.object({
      status: backendRequestStatusSchema.nullable(),
      type: backendRequestTypeSchema.nullable(),
      departmentId: z.string().nullable(),
      createdById: z.string().nullable(),
      from: z.string().nullable(),
      to: z.string().nullable(),
    }),
    totals: z.object({
      requests: z.number(),
      withAmount: z.number(),
      // Decimal, never a JS number — see F6 "Decimal / amount handling".
      amountTotal: z.string().nullable(),
    }),
    byStatus: z.record(backendRequestStatusSchema, z.number()),
    byType: z.record(backendRequestTypeSchema, z.number()),
    // departmentName is also null for the "no department" group — never a
    // synthetic "Unassigned" label from the backend itself (report.service.ts).
    byDepartment: z.array(
      z.object({
        departmentId: z.string().nullable(),
        departmentName: z.string().nullable(),
        count: z.number(),
      })
    ),
  }),
})

const durationStatBucketSchema = z.object({ count: z.number(), averageSeconds: z.number().nullable() })

export const workflowDurationSchema = z.object({
  data: z.object({
    status: z.literal('OK'),
    unit: z.literal('seconds'),
    overall: durationStatBucketSchema,
    // Sparse/partial by design — only statuses with at least one matching
    // row appear (report.service.ts, confirmed by M10 tests).
    byStatus: z.object({
      APPROVED: durationStatBucketSchema.optional(),
      REJECTED: durationStatBucketSchema.optional(),
      CANCELLED: durationStatBucketSchema.optional(),
    }),
    excludedTerminalRequestsWithoutAuditEvidence: z.number(),
  }),
})
