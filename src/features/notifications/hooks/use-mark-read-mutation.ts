import { useMutation, useQueryClient } from '@tanstack/react-query'
import { markNotificationRead } from '../api/mark-notification-read'
import { notificationKeys } from '../api/notification-query-keys'

// Menandai notifikasi telah dibaca lalu menyegarkan cache.
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
