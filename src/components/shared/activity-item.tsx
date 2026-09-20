import { CheckCircle2, FileText, MessageSquare, RotateCcw, XCircle, type LucideIcon } from 'lucide-react'
import type { ActivityEntry } from '@/types/domain'

const kindStyle: Record<ActivityEntry['kind'], { icon: LucideIcon; background: string; color: string }> = {
  approved: { icon: CheckCircle2, background: 'var(--green-bg)', color: 'var(--green-text)' },
  submitted: { icon: FileText, background: 'var(--rf-accent-subtle)', color: 'var(--rf-accent)' },
  comment: { icon: MessageSquare, background: 'var(--muted-bg)', color: 'var(--muted-text)' },
  revision: { icon: RotateCcw, background: 'var(--orange-bg)', color: 'var(--orange-text)' },
  rejected: { icon: XCircle, background: 'var(--red-bg)', color: 'var(--red-text)' },
}

export function ActivityItem({ title, description, time, kind, isLast }: ActivityEntry & { isLast?: boolean }) {
  const { icon: Icon, background, color } = kindStyle[kind]

  return (
    <div className="timeline-item">
      <div className="timeline-rail">
        <div className="timeline-dot" style={{ background, color }}>
          <Icon className="icon" width={13} height={13} strokeWidth={2} />
        </div>
        {!isLast ? <div className="timeline-line" /> : null}
      </div>
      <div className="timeline-content">
        <div className="timeline-title">{title}</div>
        <div className="timeline-desc">{description}</div>
        <div className="timeline-time">{time}</div>
      </div>
    </div>
  )
}
