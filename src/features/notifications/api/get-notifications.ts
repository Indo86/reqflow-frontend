import { apiClient } from '@/lib/api'
import { notificationListResponseSchema } from '../schemas/notification.schema'
import { mapNotificationListResponse, type NotificationListResult } from '../types/notification'
import type { NotificationListFilters } from './notification-query-keys'

// Mengambil data dari /notifications?page=&pageSize=&unreadOnly=true|false.
export async function getNotifications(filters: NotificationListFilters): Promise<NotificationListResult> {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))
  params.set('unreadOnly', filters.unreadOnly ? 'true' : 'false')

  const response = await apiClient(`/notifications?${params.toString()}`)
  return mapNotificationListResponse(notificationListResponseSchema.parse(response))
}
