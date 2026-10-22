import type { Notification } from '../types/notification'

// Aksi hanya tersedia untuk approver yang sedang bertugas.
export function getNotificationLink(
  notification: Pick<Notification, 'type' | 'requestId' | 'approvalId'>
): string | undefined {
  if (notification.type === 'APPROVAL_ASSIGNED') {
    if (notification.approvalId) return `/approvals/${notification.approvalId}`
    return notification.requestId ? '/approvals' : undefined
  }

  // Aksi hanya tersedia untuk approver yang sedang bertugas.
  if (notification.type === 'REQUEST_WITHDRAWN') {
    return notification.approvalId ? `/approvals/${notification.approvalId}` : undefined
  }
  if (notification.type === 'APPROVAL_REASSIGNED') return undefined

  // Hak akses tetap divalidasi oleh backend.
  if (notification.type === 'FULFILLMENT_REASSIGNED') return undefined

  return notification.requestId ? `/requests/${notification.requestId}` : undefined
}
