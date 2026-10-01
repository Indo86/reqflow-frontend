import { apiClient } from '@/lib/api'
import { unreadCountResponseSchema } from '../schemas/notification.schema'
import { mapUnreadCountResponse, type UnreadCountResult } from '../types/notification'

// GET /notifications/unread-count — dedicated backend endpoint; never
// derived by loading every notification into the browser (F5 "Unread
// count").
export async function getUnreadCount(): Promise<UnreadCountResult> {
  const response = await apiClient('/notifications/unread-count')
  return mapUnreadCountResponse(unreadCountResponseSchema.parse(response))
}
