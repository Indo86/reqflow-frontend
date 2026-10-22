export interface NotificationListFilters {
  page: number
  pageSize: number
  unreadOnly: boolean
}

// Menyusun kunci cache untuk kueri ini.
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: NotificationListFilters) => [...notificationKeys.lists(), filters] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
}
