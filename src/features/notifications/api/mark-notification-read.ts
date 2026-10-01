import { apiClient } from '@/lib/api'
import { markNotificationReadResponseSchema } from '../schemas/notification.schema'
import { mapNotification, type Notification } from '../types/notification'

// PATCH /notifications/:id/read — no request body. Idempotent on the
// backend (notification.service.ts markNotificationAsRead: a conditional
// updateMany scoped to readAt IS NULL, falling back to a re-read of the
// same row when it's already read) — safe to call more than once without
// special-casing on the frontend. A wrong/foreign id 404s, never 403 (the
// backend's hidden-resource principle — see F5 "backend contract").
export async function markNotificationRead(notificationId: string): Promise<Notification> {
  const response = await apiClient(`/notifications/${notificationId}/read`, { method: 'PATCH' })
  return mapNotification(markNotificationReadResponseSchema.parse(response).data)
}
