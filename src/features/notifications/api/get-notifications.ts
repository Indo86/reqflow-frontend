import { apiClient } from '@/lib/api'
import { notificationListResponseSchema } from '../schemas/notification.schema'
import { mapNotificationListResponse, type NotificationListResult } from '../types/notification'
import type { NotificationListFilters } from './notification-query-keys'

// GET /notifications?page=&pageSize=&unreadOnly=true|false — recipient scope
// comes entirely from the session cookie server-side
// (notification.service.ts listNotifications); there is no
// recipientId/organizationId param to send. unreadOnly is always sent as an
// explicit 'true'/'false' string, never omitted, so a `false` filter can
// never be mistaken for "unset" by the backend's
// listNotificationsQuerySchema (F5 "query-string boolean semantics must
// remain explicit").
export async function getNotifications(filters: NotificationListFilters): Promise<NotificationListResult> {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))
  params.set('unreadOnly', filters.unreadOnly ? 'true' : 'false')

  const response = await apiClient(`/notifications?${params.toString()}`)
  return mapNotificationListResponse(notificationListResponseSchema.parse(response))
}
