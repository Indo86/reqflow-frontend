import { Bell, CheckCircle2, ClipboardCheck, RotateCcw, XCircle, type LucideIcon } from 'lucide-react'
import type { NotificationType } from '../types/notification'

interface NotificationPresentation {
  icon: LucideIcon
  background: string
  color: string
}

const presentationByType: Record<NotificationType, NotificationPresentation> = {
  APPROVAL_ASSIGNED: { icon: ClipboardCheck, background: 'var(--rf-accent-subtle)', color: 'var(--rf-accent)' },
  REQUEST_APPROVED: { icon: CheckCircle2, background: 'var(--green-bg)', color: 'var(--green-text)' },
  REQUEST_REJECTED: { icon: XCircle, background: 'var(--red-bg)', color: 'var(--red-text)' },
  REQUEST_REVISION_REQUIRED: { icon: RotateCcw, background: 'var(--orange-bg)', color: 'var(--orange-text)' },
}

const fallbackPresentation: NotificationPresentation = {
  icon: Bell,
  background: 'var(--muted-bg)',
  color: 'var(--muted-text)',
}

// Falls back safely for any notification type this frontend build doesn't
// yet know about, rather than crashing (F5 "Notification type presentation").
export function getNotificationPresentation(type: NotificationType): NotificationPresentation {
  return presentationByType[type] ?? fallbackPresentation
}
