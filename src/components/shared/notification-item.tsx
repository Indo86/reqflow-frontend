import { Bell, CheckCircle2, ClipboardCheck, MessageSquare, RotateCcw, XCircle, type LucideIcon } from 'lucide-react'
import type { NotificationItemData } from '@/types/domain'

const kindStyle: Record<NotificationItemData['kind'], { icon: LucideIcon; background: string; color: string }> = {
  approved: { icon: CheckCircle2, background: 'var(--green-bg)', color: 'var(--green-text)' },
  assigned: { icon: ClipboardCheck, background: 'var(--rf-accent-subtle)', color: 'var(--rf-accent)' },
  revision: { icon: RotateCcw, background: 'var(--orange-bg)', color: 'var(--orange-text)' },
  comment: { icon: MessageSquare, background: 'var(--muted-bg)', color: 'var(--muted-text)' },
  rejected: { icon: XCircle, background: 'var(--red-bg)', color: 'var(--red-text)' },
}

export function NotificationItem({ title, description, time, unread, kind }: NotificationItemData) {
  const { icon: Icon, background, color } = kindStyle[kind] ?? { icon: Bell, background: 'var(--muted-bg)', color: 'var(--muted-text)' }

  return (
    <div className="notif-item">
      <div className="notif-icon-wrap" style={{ background, color }}>
        <Icon className="icon" width={16} height={16} strokeWidth={2} />
      </div>
      <div className="notif-body">
        <div className="notif-top-row">
          <span className="notif-title">{title}</span>
          <span className="notif-time">{time}</span>
        </div>
        <p className="notif-desc">{description}</p>
      </div>
      {unread ? <div className="unread-dot" /> : <div style={{ width: 8 }} />}
    </div>
  )
}
