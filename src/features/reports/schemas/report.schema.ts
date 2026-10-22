import { z } from 'zod'
import { backendRequestStatusSchema, backendRequestTypeSchema } from '@/features/requests/schemas/request.schema'

// Memvalidasi data laporan request.
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
      // Nilai total uang dikirim sebagai string desimal.
      amountTotal: z.string().nullable(),
    }),
    byStatus: z.record(backendRequestStatusSchema, z.number()),
    byType: z.record(backendRequestTypeSchema, z.number()),
    // Mengelompokkan jumlah request berdasarkan departemen.
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
    // Mengelompokkan durasi berdasarkan status akhir.
    byStatus: z.object({
      APPROVED: durationStatBucketSchema.optional(),
      REJECTED: durationStatBucketSchema.optional(),
      CANCELLED: durationStatBucketSchema.optional(),
    }),
    excludedTerminalRequestsWithoutAuditEvidence: z.number(),
  }),
})
