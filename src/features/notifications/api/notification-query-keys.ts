export interface NotificationListFilters {
  page: number
  pageSize: number
  unreadOnly: boolean
}

// Feature-owned query keys — no global registry (see F3
// approval-query-keys.ts for the established pattern). Filters are part of
// the list key so All and Unread never collide in the cache.
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: NotificationListFilters) => [...notificationKeys.lists(), filters] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
}
