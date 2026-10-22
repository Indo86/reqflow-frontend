import type { ReactNode } from 'react'
import type { CommentEntry } from '@/types/domain'
import { UserAvatar } from './user-avatar'

interface CommentItemProps extends CommentEntry {
  // Menggunakan data API di halaman produksi tanpa mengubah halaman preview.
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
