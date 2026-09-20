import type { CommentEntry } from '@/types/domain'
import { UserAvatar } from './user-avatar'

export function CommentItem({ author, initials, timestamp, text }: CommentEntry) {
  return (
    <div className="comment-item">
      <UserAvatar initials={initials} />
      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author">{author}</span>
          <span className="comment-time">{timestamp}</span>
        </div>
        <p className="comment-text">{text}</p>
      </div>
    </div>
  )
}
