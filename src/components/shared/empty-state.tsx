import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  body: string
}

export function EmptyState({ icon: Icon, title, body }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon className="icon" width={18} height={18} strokeWidth={2} />
      </div>
      <div className="empty-state-title">{title}</div>
      <div className="empty-state-body">{body}</div>
    </div>
  )
}
