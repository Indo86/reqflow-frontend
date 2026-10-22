import { apiClient } from '@/lib/api'
import { markNotificationReadResponseSchema } from '../schemas/notification.schema'
import { mapNotification, type Notification } from '../types/notification'

// Memperbarui data melalui /notifications/:id/read.
export async function markNotificationRead(notificationId: string): Promise<Notification> {
  const response = await apiClient(`/notifications/${notificationId}/read`, { method: 'PATCH' })
  return mapNotification(markNotificationReadResponseSchema.parse(response).data)
}
