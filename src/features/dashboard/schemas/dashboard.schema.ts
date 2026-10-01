import { z } from 'zod'
import { backendRequestStatusSchema, backendRequestTypeSchema } from '@/features/requests/schemas/request.schema'

// Mirrors reqFlow-backend's M10 dashboard.service.ts DashboardSummary /
// RequestsOverTimeResult / RecentActivityEntry shapes exactly — verified by
// direct backend inspection. All 5 M10 endpoints share the `{ data: ... }`
// envelope, never `{ success, data }` or a bare array/object.
export const dashboardSummarySchema = z.object({
  data: z.object({
    requests: z.object({
      total: z.number(),
      byStatus: z.record(backendRequestStatusSchema, z.number()),
      byType: z.record(backendRequestTypeSchema, z.number()),
    }),
    approvals: z.object({ pendingForCurrentUser: z.number() }),
    notifications: z.object({ unreadForCurrentUser: z.number() }),
    // Decimal, never a JS number — total is a string when count > 0, null
    // when count is 0. Never Number(...)'d here; formatted at display time
    // only via formatRequestAmount. See F6 "Decimal / amount handling".
    amounts: z.object({ count: z.number(), total: z.string().nullable() }),
  }),
})

export const bucketSchema = z.enum(['day', 'week', 'month'])

export const requestsOverTimeSchema = z.object({
  data: z.object({
    bucket: bucketSchema,
    from: z.string(),
    to: z.string(),
    points: z.array(z.object({ periodStart: z.string(), count: z.number() })),
  }),
})

// AuditAction/AuditEntityType are read as plain strings, not a strict zod
// enum — a future backend value must render through the presentation
// layer's safe fallback rather than fail parsing entirely (F5's own
// "unknown notification type" precedent, applied here).
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
