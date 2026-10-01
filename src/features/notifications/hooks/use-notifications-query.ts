import { useQuery } from '@tanstack/react-query'
import { getNotifications } from '../api/get-notifications'
import { notificationKeys, type NotificationListFilters } from '../api/notification-query-keys'

export function useNotificationsQuery(filters: NotificationListFilters) {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => getNotifications(filters),
  })
}
