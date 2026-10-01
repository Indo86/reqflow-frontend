import { apiClient } from '@/lib/api'
import { markAllReadResponseSchema } from '../schemas/notification.schema'
import { mapMarkAllReadResponse, type MarkAllReadResult } from '../types/notification'

// POST /notifications/read-all — confirmed to exist on the backend
// (notification.routes.ts) with no request body; only touches the caller's
// own unread notifications and returns how many rows it actually flipped
// (notification.service.ts markAllNotificationsAsRead).
export async function markAllNotificationsRead(): Promise<MarkAllReadResult> {
  const response = await apiClient('/notifications/read-all', { method: 'POST' })
  return mapMarkAllReadResponse(markAllReadResponseSchema.parse(response))
}
