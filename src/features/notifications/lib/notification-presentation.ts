import { Bell, CheckCircle2, ClipboardCheck, ListChecks, Repeat, RotateCcw, Undo2, XCircle, type LucideIcon } from 'lucide-react'
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
  REQUEST_WITHDRAWN: { icon: Undo2, background: 'var(--muted-bg)', color: 'var(--muted-text)' },
  APPROVAL_REASSIGNED: { icon: Repeat, background: 'var(--muted-bg)', color: 'var(--muted-text)' },
  FULFILLMENT_ASSIGNED: { icon: ListChecks, background: 'var(--rf-accent-subtle)', color: 'var(--rf-accent)' },
  FULFILLMENT_REASSIGNED: { icon: Repeat, background: 'var(--muted-bg)', color: 'var(--muted-text)' },
  FULFILLMENT_NEEDS_OWNER: { icon: ListChecks, background: 'var(--orange-bg)', color: 'var(--orange-text)' },
  FULFILLMENT_COMPLETED: { icon: CheckCircle2, background: 'var(--green-bg)', color: 'var(--green-text)' },
  FULFILLMENT_CANCELLED: { icon: XCircle, background: 'var(--muted-bg)', color: 'var(--muted-text)' },
}

const fallbackPresentation: NotificationPresentation = {
  icon: Bell,
  background: 'var(--muted-bg)',
  color: 'var(--muted-text)',
}

// Menyiapkan data untuk ditampilkan di antarmuka.
export function getNotificationPresentation(type: NotificationType): NotificationPresentation {
  return presentationByType[type] ?? fallbackPresentation
}
