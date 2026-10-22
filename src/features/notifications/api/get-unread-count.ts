import { apiClient } from '@/lib/api'
import { unreadCountResponseSchema } from '../schemas/notification.schema'
import { mapUnreadCountResponse, type UnreadCountResult } from '../types/notification'

// Mengambil data dari /notifications/unread-count.
export async function getUnreadCount(): Promise<UnreadCountResult> {
  const response = await apiClient('/notifications/unread-count')
  return mapUnreadCountResponse(unreadCountResponseSchema.parse(response))
}
