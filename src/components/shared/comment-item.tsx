import type { ReactNode } from 'react'
import type { CommentEntry } from '@/types/domain'
import { UserAvatar } from './user-avatar'

interface CommentItemProps extends CommentEntry {
  // Optional so the F0.5 mock/preview usage (no delete affordance) is
  // unaffected — only real (F4) comment lists pass this.
  actions?: ReactNode
}

export function CommentItem({ author, initials, timestamp, text, actions }: CommentItemProps) {
  return (
    <div className="comment-item">
      <UserAvatar initials={initials} />
      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author">{author}</span>
          <span className="comment-time">{timestamp}</span>
          {actions}
        </div>
        <p className="comment-text">{text}</p>
      </div>
    </div>
  )
}
