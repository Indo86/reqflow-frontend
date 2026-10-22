import { z } from 'zod'

// Memvalidasi bentuk data sesuai kontrak API.
export const notificationTypeSchema = z.enum([
  'APPROVAL_ASSIGNED',
  'REQUEST_REVISION_REQUIRED',
  'REQUEST_APPROVED',
  'REQUEST_REJECTED',
  // Notifikasi perubahan alur request.
  'REQUEST_WITHDRAWN',
  'APPROVAL_REASSIGNED',
  // Notifikasi proses fulfillment.
  'FULFILLMENT_ASSIGNED',
  'FULFILLMENT_REASSIGNED',
  'FULFILLMENT_NEEDS_OWNER',
  'FULFILLMENT_COMPLETED',
  'FULFILLMENT_CANCELLED',
])

export const notificationSchema = z.object({
  id: z.string(),
  type: notificationTypeSchema,
  title: z.string(),
  message: z.string(),
  requestId: z.string().nullable(),
  // Menyiapkan data notifikasi untuk pengguna.
  approvalId: z.string().nullable(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
})

// Mengambil data dari /notifications.
export const notificationListResponseSchema = z.object({
  data: z.array(notificationSchema),
  meta: z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

// Mengambil data dari /notifications/unread-count.
export const unreadCountResponseSchema = z.object({
  data: z.object({ count: z.number() }),
})

// Memperbarui data melalui /notifications/:id/read.
export const markNotificationReadResponseSchema = z.object({
  data: notificationSchema,
})

// Mengirim data ke /notifications/read-all.
export const markAllReadResponseSchema = z.object({
  data: z.object({ updated: z.number() }),
})
