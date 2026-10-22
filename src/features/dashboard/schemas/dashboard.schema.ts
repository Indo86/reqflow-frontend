import { z } from 'zod'
import { backendRequestStatusSchema, backendRequestTypeSchema } from '@/features/requests/schemas/request.schema'

// Memvalidasi ringkasan data dashboard.
export const dashboardSummarySchema = z.object({
  data: z.object({
    requests: z.object({
      total: z.number(),
      byStatus: z.record(backendRequestStatusSchema, z.number()),
      byType: z.record(backendRequestTypeSchema, z.number()),
    }),
    // Properti ini opsional agar penggunaan sebelumnya tetap didukung.
    fulfillment: z
      .object({
        awaitingOwner: z.number(),
        notStarted: z.number(),
        inProgress: z.number(),
        completed: z.number(),
        cancelled: z.number(),
        approvedBeforeTracking: z.number(),
        assignedToCurrentUser: z.number(),
      })
      .optional(),
    approvals: z.object({ pendingForCurrentUser: z.number() }),
    notifications: z.object({ unreadForCurrentUser: z.number() }),
    // Menyiapkan data untuk ditampilkan di antarmuka.
    amounts: z.object({ count: z.number(), total: z.string().nullable() }),
  }),
})

export const bucketSchema = z.enum(['day', 'week', 'month'])

export const requestsOverTimeSchema = z.object({
  data: z.object({
    bucket: bucketSchema,
    from: z.string(),
    to: z.string(),
    range: z.enum(['1m', '2m', '6m', '1y', 'all']).optional(),
    points: z.array(z.object({ periodStart: z.string(), count: z.number() })),
  }),
})

// Menyiapkan data untuk ditampilkan di antarmuka.
export const recentActivitySchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      action: z.string(),
      entityType: z.string(),
      entityId: z.string().nullable(),
      requestId: z.string().nullable(),
      actorId: z.string().nullable(),
      createdAt: z.string(),
      metadata: z.unknown().nullable(),
    })
  ),
})
