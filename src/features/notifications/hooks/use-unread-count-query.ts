import { useQuery } from '@tanstack/react-query'
import { getUnreadCount } from '../api/get-unread-count'
import { notificationKeys } from '../api/notification-query-keys'

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadCount,
  })
}
