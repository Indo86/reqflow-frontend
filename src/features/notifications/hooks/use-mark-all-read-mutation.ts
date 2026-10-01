import { useMutation, useQueryClient } from '@tanstack/react-query'
import { markAllNotificationsRead } from '../api/mark-all-read'
import { notificationKeys } from '../api/notification-query-keys'

export function useMarkAllReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
    },
  })
}
