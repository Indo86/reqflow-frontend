import type { z } from 'zod'
import type {
  markAllReadResponseSchema,
  notificationListResponseSchema,
  notificationSchema,
  notificationTypeSchema,
  unreadCountResponseSchema,
} from '../schemas/notification.schema'

export type NotificationType = z.infer<typeof notificationTypeSchema>

// Exactly the 4 values notification.service.ts's notify* functions actually
// create — do not add REQUEST_SUBMITTED, COMMENT_ADDED, or any other
// invented type (see F5 "backend contract").
export const notificationTypeLabels: Record<NotificationType, string> = {
  APPROVAL_ASSIGNED: 'Approval assigned',
  REQUEST_REVISION_REQUIRED: 'Revision requested',
  REQUEST_APPROVED: 'Request approved',
  REQUEST_REJECTED: 'Request rejected',
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  requestId: string | null
  approvalId: string | null
  readAt: string | null
  createdAt: string
}

export function mapNotification(dto: z.infer<typeof notificationSchema>): Notification {
  return dto
}

export interface NotificationListMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface NotificationListResult {
  items: Notification[]
  meta: NotificationListMeta
}

export function mapNotificationListResponse(
  dto: z.infer<typeof notificationListResponseSchema>
): NotificationListResult {
  return { items: dto.data.map(mapNotification), meta: dto.meta }
}

export interface UnreadCountResult {
  count: number
}

export function mapUnreadCountResponse(dto: z.infer<typeof unreadCountResponseSchema>): UnreadCountResult {
  return dto.data
}

export interface MarkAllReadResult {
  updated: number
}

export function mapMarkAllReadResponse(dto: z.infer<typeof markAllReadResponseSchema>): MarkAllReadResult {
  return dto.data
}
