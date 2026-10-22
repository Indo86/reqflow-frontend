import { apiClient } from '@/lib/api'
import { markAllReadResponseSchema } from '../schemas/notification.schema'
import { mapMarkAllReadResponse, type MarkAllReadResult } from '../types/notification'

// Mengirim data ke /notifications/read-all.
export async function markAllNotificationsRead(): Promise<MarkAllReadResult> {
  const response = await apiClient('/notifications/read-all', { method: 'POST' })
  return mapMarkAllReadResponse(markAllReadResponseSchema.parse(response))
}
