import { z } from 'zod'

// Mirrors reqFlow-backend's Notification model and NotificationType enum
// (prisma/schema.prisma) and notification.service.ts's NotificationResponse
// shape — verified by direct backend inspection. There is no separate
// boolean isRead field: readAt (null = unread) is the single source of
// truth. See F5 "backend contract".
export const notificationTypeSchema = z.enum([
  'APPROVAL_ASSIGNED',
  'REQUEST_REVISION_REQUIRED',
  'REQUEST_APPROVED',
  'REQUEST_REJECTED',
])

export const notificationSchema = z.object({
  id: z.string(),
  type: notificationTypeSchema,
  title: z.string(),
  message: z.string(),
  requestId: z.string().nullable(),
  // Only ever populated for APPROVAL_ASSIGNED — every other notification
  // type always sends null (post-F6-contract-completion; a notification
  // created before this field existed also serializes as null, the same
  // as any other legacy row). See F6-contract-completion "Notification
  // approvalId".
  approvalId: z.string().nullable(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
})

// GET /notifications — recipient scope comes entirely from the session
// cookie server-side (notification.service.ts listNotifications); there is
// no recipientId/organizationId field on the request or the response.
export const notificationListResponseSchema = z.object({
  data: z.array(notificationSchema),
  meta: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

// GET /notifications/unread-count
export const unreadCountResponseSchema = z.object({
  data: z.object({ count: z.number() }),
})

// PATCH /notifications/:id/read — idempotent on the backend: an
// already-read notification returns the same row unchanged rather than
// erroring (notification.service.ts markNotificationAsRead).
export const markNotificationReadResponseSchema = z.object({
  data: notificationSchema,
})

// POST /notifications/read-all
export const markAllReadResponseSchema = z.object({
  data: z.object({ updated: z.number() }),
})
