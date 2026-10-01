import { useMutation, useQueryClient } from '@tanstack/react-query'
import { markNotificationRead } from '../api/mark-notification-read'
import { notificationKeys } from '../api/notification-query-keys'

// Marking a notification read is delivery-state, not business-state — it
// only ever invalidates the notification feature's own queries, never
// Request/Approval queries (F5 "cache invalidation").
export function useMarkReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    },
  })
}
